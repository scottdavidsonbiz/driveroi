import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SOPS_DIR = path.join(process.cwd(), 'docs', 'sops')

function extractMetadata(content: string, slug: string) {
  // Extract title
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch
    ? titleMatch[1].replace(/^SOP:\s*/i, '').trim()
    : slug.replace(/-/g, ' ')

  // Extract purpose
  const purposeMatch = content.match(/\*\*Purpose:\*\*\s*(.+)/i)
  const purpose = purposeMatch ? purposeMatch[1].trim() : null

  // Extract last updated
  const lastUpdatedMatch = content.match(/\*\*Last Updated:\*\*\s*(.+)/i)
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : null

  // Extract Loom URL if present
  const loomMatch = content.match(/\*\*Loom:\*\*\s*(https:\/\/www\.loom\.com\/share\/[^\s\n]+)/i)
  const loomUrl = loomMatch ? loomMatch[1].trim() : null

  return { title, purpose, lastUpdated, loomUrl }
}

// GET /api/sops/[slug] - Get a single SOP
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const filepath = path.join(SOPS_DIR, `${slug}.md`)

    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 })
    }

    const content = fs.readFileSync(filepath, 'utf-8')
    const { title, purpose, lastUpdated, loomUrl } = extractMetadata(content, slug)

    return NextResponse.json({
      sop: {
        slug,
        title,
        purpose,
        lastUpdated,
        loomUrl,
        content,
      },
    })
  } catch (error) {
    console.error('[SOPs API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch SOP' }, { status: 500 })
  }
}

// PUT /api/sops/[slug] - Update an SOP
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const filepath = path.join(SOPS_DIR, `${slug}.md`)

    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Update the Last Updated date
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    let updatedContent = content
    if (updatedContent.match(/\*\*Last Updated:\*\*/i)) {
      updatedContent = updatedContent.replace(
        /\*\*Last Updated:\*\*\s*.+/i,
        `**Last Updated:** ${today}`
      )
    }

    fs.writeFileSync(filepath, updatedContent, 'utf-8')

    const { title, purpose, lastUpdated, loomUrl } = extractMetadata(updatedContent, slug)

    return NextResponse.json({
      success: true,
      sop: {
        slug,
        title,
        purpose,
        lastUpdated,
        loomUrl,
        content: updatedContent,
      },
    })
  } catch (error) {
    console.error('[SOPs API] Error:', error)
    return NextResponse.json({ error: 'Failed to update SOP' }, { status: 500 })
  }
}
