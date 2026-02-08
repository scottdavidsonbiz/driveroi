import { NextRequest, NextResponse } from 'next/server'

interface AnalyzeRequest {
  name: string
  website: string
  industry: string
  materials: {
    type: string
    content: string
    filename?: string
  }[]
}

interface AnalysisResult {
  icp: {
    buyerPersona: string
    companySize: string
    industry: string
    geography: string
    triggers: string[]
  }
  painPoints: string[]
  positioning: string
  emailAngles: {
    name: string
    subject: string
    preview: string
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { name, website, industry, materials } = body

    // Check if Claude API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (apiKey) {
      // Use Claude for real analysis
      const analysis = await analyzeWithClaude(apiKey, { name, website, industry, materials })
      return NextResponse.json({ analysis })
    } else {
      // Return mock data for testing
      console.log('[Analyze API] No ANTHROPIC_API_KEY found, using mock data')
      const analysis = generateMockAnalysis(name, industry)
      return NextResponse.json({ analysis })
    }
  } catch (error) {
    console.error('[Analyze API] Error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

async function analyzeWithClaude(
  apiKey: string,
  data: AnalyzeRequest
): Promise<AnalysisResult> {
  const { name, website, industry, materials } = data

  // Combine all materials into one context
  const materialsText = materials
    .map((m) => `--- ${m.filename || m.type} ---\n${m.content}`)
    .join('\n\n')

  // Get current date for context
  const today = new Date()
  const currentDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const prompt = `You are helping build an Ideal Customer Profile (ICP) for a sales outreach campaign.

Today's date: ${currentDate}

Client: ${name}
Website: ${website || 'Not provided'}
Industry: ${industry || 'Not provided'}

Materials provided:
${materialsText || 'No materials provided - analyze based on website and industry only.'}

Based on this information, extract and create:

1. **ICP (Ideal Customer Profile)**:
   - Buyer Persona: The primary decision maker title/role
   - Company Size: Employee count range or revenue range
   - Industry: Specific industry or vertical
   - Geography: Target regions/countries
   - Triggers: 3-5 events that indicate buying intent

2. **Pain Points**: 3-5 specific problems the target customer faces

3. **Positioning Statement**: A 1-2 sentence value proposition

4. **Email Angles**: 2-3 different approaches for cold outreach, each with:
   - Name: Short descriptive name for the angle
   - Subject: Email subject line (lowercase, casual)
   - Preview: First 1-2 sentences of the email

   IMPORTANT: Any date references should be current (we are in ${today.getFullYear()}). Do not reference past years.

Return your response as JSON in this exact format:
{
  "icp": {
    "buyerPersona": "...",
    "companySize": "...",
    "industry": "...",
    "geography": "...",
    "triggers": ["...", "...", "..."]
  },
  "painPoints": ["...", "...", "..."],
  "positioning": "...",
  "emailAngles": [
    {
      "name": "...",
      "subject": "...",
      "preview": "..."
    }
  ]
}

Only return valid JSON, no other text.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[Claude API] Error:', error)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const result = await response.json()
  const content = result.content[0].text

  // Parse JSON from response
  try {
    // Handle potential markdown code blocks
    let jsonStr = content
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0]
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0]
    }

    return JSON.parse(jsonStr.trim())
  } catch (parseError) {
    console.error('[Claude API] Failed to parse response:', content)
    throw new Error('Failed to parse Claude response as JSON')
  }
}

function generateMockAnalysis(name: string, industry: string): AnalysisResult {
  // Return realistic mock data based on the client name/industry
  return {
    icp: {
      buyerPersona: 'CFO / VP Finance',
      companySize: '50-500 employees',
      industry: industry || 'Mid-market B2B',
      geography: 'United States',
      triggers: [
        'Recent acquisition or merger',
        'New funding round',
        'Leadership change',
        'Expansion announcement',
      ],
    },
    painPoints: [
      'Spending too much time on manual processes',
      'Lack of visibility into key metrics',
      'Difficulty scaling current operations',
      'Pressure to reduce costs while maintaining quality',
    ],
    positioning: `We help ${industry || 'growing companies'} reduce operational overhead and improve efficiency through our streamlined platform, typically saving 20+ hours per month.`,
    emailAngles: [
      {
        name: 'Pain Point Lead',
        subject: `Quick question about ${name}'s operations`,
        preview: `I noticed ${name} is growing quickly in the ${industry || 'industry'} space. Typically companies at your stage start feeling the pain of...`,
      },
      {
        name: 'Trigger Event',
        subject: `Congrats on the recent news`,
        preview: `Saw the announcement about ${name} - congrats! Companies going through similar transitions often find that...`,
      },
      {
        name: 'Value Prop Direct',
        subject: `20 hours back every month?`,
        preview: `Most ${industry || 'ops'} teams I talk to are spending too much time on manual work. We've helped similar companies automate...`,
      },
    ],
  }
}
