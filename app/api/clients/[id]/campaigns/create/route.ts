import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {
  createCampaign,
  textToHtml,
  type CampaignSequence,
  type CreateCampaignResult,
} from '@/lib/instantly'

interface RequestBody {
  campaign_name_prefix?: string
  num_campaigns?: number
  offers?: string[]
  target_audience_override?: string
  social_proof?: string
}

interface GeneratedCampaign {
  campaign_name: string
  sequences: {
    steps: {
      delay?: number
      variants: { subject: string; body: string }[]
    }[]
  }[]
}

// POST /api/clients/[id]/campaigns/create
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const body: RequestBody = await request.json()

    // 1. Load client + ICP
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`*, client_icp (*)`)
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const icp = Array.isArray(client.client_icp)
      ? client.client_icp[0]
      : client.client_icp

    if (!icp) {
      return NextResponse.json(
        { error: 'Client has no ICP data. Add ICP before creating campaigns.' },
        { status: 400 }
      )
    }

    // 2. Build prompt from ICP
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    const numCampaigns = Math.min(Math.max(body.num_campaigns ?? 3, 1), 3)
    const namePrefix = body.campaign_name_prefix || client.name

    const prompt = buildPrompt(icp, {
      namePrefix,
      numCampaigns,
      offers: body.offers,
      targetAudienceOverride: body.target_audience_override,
      socialProof: body.social_proof,
    })

    // 3. Call Claude
    const generatedCampaigns = await callClaude(apiKey, prompt)

    if (!generatedCampaigns || generatedCampaigns.length === 0) {
      return NextResponse.json(
        { error: 'Claude returned no campaigns' },
        { status: 500 }
      )
    }

    // 4. Create campaigns in Instantly
    const results: { id: string; name: string }[] = []
    const errors: string[] = []

    for (let i = 0; i < generatedCampaigns.length; i++) {
      const campaign = generatedCampaigns[i]

      // Convert plain text bodies to HTML
      const sequences: CampaignSequence[] = campaign.sequences.map(seq => ({
        steps: seq.steps.map((step, stepIdx) => ({
          type: 'email' as const,
          delay: stepIdx === 0 ? 0 : (step.delay ?? 3),
          variants: step.variants.map(v => ({
            subject: v.subject,
            body: textToHtml(v.body),
          })),
        })),
      }))

      try {
        const result: CreateCampaignResult = await createCampaign({
          name: campaign.campaign_name,
          sequences,
        })

        results.push({ id: result.id, name: campaign.campaign_name })

        // Auto-insert into client_integrations
        await supabase.from('client_integrations').upsert(
          {
            client_id: clientId,
            platform: 'instantly',
            external_campaign_id: result.id,
            campaign_name: campaign.campaign_name,
            active: true,
          },
          { onConflict: 'platform,external_campaign_id' }
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[Campaign Create] Failed to create "${campaign.campaign_name}":`, msg)
        errors.push(`${campaign.campaign_name}: ${msg}`)
      }

      // 2s delay between API calls
      if (i < generatedCampaigns.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return NextResponse.json({
      status: errors.length === 0 ? 'success' : 'partial',
      campaigns_created: results.length,
      campaigns: results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[Campaign Create] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create campaigns' },
      { status: 500 }
    )
  }
}

function buildPrompt(
  icp: any,
  opts: {
    namePrefix: string
    numCampaigns: number
    offers?: string[]
    targetAudienceOverride?: string
    socialProof?: string
  }
): string {
  const audience = opts.targetAudienceOverride || icp.buyer_persona || 'B2B decision makers'
  const painPoints = (icp.pain_points || []).join(', ')
  const triggers = (icp.triggers || []).join(', ')
  const positioning = icp.positioning || ''
  const emailAngles = (icp.email_angles || [])
    .map((a: any) => `- ${a.name}: ${a.preview}`)
    .join('\n')

  const offersSection = opts.offers && opts.offers.length > 0
    ? `Offers to use:\n${opts.offers.map(o => `- ${o}`).join('\n')}`
    : 'Derive compelling offers from the ICP pain points and positioning above.'

  const socialProofSection = opts.socialProof
    ? `Social proof to reference: ${opts.socialProof}`
    : ''

  return `You are an expert cold email copywriter creating campaigns for Instantly.ai.

Generate exactly ${opts.numCampaigns} cold email campaign(s) for outreach to: ${audience}

ICP Context:
- Buyer Persona: ${icp.buyer_persona || 'N/A'}
- Industry: ${icp.industry || 'N/A'}
- Company Size: ${icp.company_size || 'N/A'}
- Geography: ${icp.geography || 'N/A'}
- Pain Points: ${painPoints || 'N/A'}
- Buying Triggers: ${triggers || 'N/A'}
- Positioning: ${positioning || 'N/A'}
- Email Angles:\n${emailAngles || 'N/A'}

${offersSection}
${socialProofSection}

Campaign naming: Use prefix "${opts.namePrefix}" then a descriptive angle name.

RULES:
- Conversational, peer-to-peer tone. Write like a real person, not a marketer.
- NO em dashes. Use commas or periods instead.
- Lowercase subject lines (no Title Case)
- Each campaign has 1 sequence with 3 steps (emails)
- Step 1 MUST have 2 A/B variants (different subject + body). Steps 2 and 3 have 1 variant each.
- Step 2 delay: 3 days. Step 3 delay: 4 days.
- Each email: 5-10 sentences max. Short paragraphs.
- Use these Instantly variables: {{firstName}}, {{companyName}}, {{sendingAccountFirstName}}
- {{icebreaker}} in the opening line of step 1 variants
- Sign off with "{{sendingAccountFirstName}}" (no last name)
- Each campaign should use a DIFFERENT angle/offer
- No links in the email body

Return ONLY a valid JSON array (no markdown fences):
[
  {
    "campaign_name": "${opts.namePrefix} - Angle Name",
    "sequences": [
      {
        "steps": [
          {
            "delay": 0,
            "variants": [
              { "subject": "lowercase subject a", "body": "Email body A..." },
              { "subject": "lowercase subject b", "body": "Email body B..." }
            ]
          },
          {
            "delay": 3,
            "variants": [
              { "subject": "lowercase follow up subject", "body": "Follow up body..." }
            ]
          },
          {
            "delay": 4,
            "variants": [
              { "subject": "lowercase breakup subject", "body": "Breakup body..." }
            ]
          }
        ]
      }
    ]
  }
]`
}

async function callClaude(
  apiKey: string,
  prompt: string
): Promise<GeneratedCampaign[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Claude API] Campaign generation error:', errorText)
    throw new Error(`Claude API error: ${response.status}`)
  }

  const result = await response.json()
  const content = result.content[0].text

  // Parse JSON — handle potential markdown fences
  let jsonStr = content
  if (content.includes('```json')) {
    jsonStr = content.split('```json')[1].split('```')[0]
  } else if (content.includes('```')) {
    jsonStr = content.split('```')[1].split('```')[0]
  }

  return JSON.parse(jsonStr.trim())
}
