import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SOPS_DIR = path.join(process.cwd(), 'docs', 'sops')

interface SOPMeta {
  slug: string
  title: string
  purpose: string | null
  lastUpdated: string | null
}

function extractMetadata(content: string, filename: string): SOPMeta {
  const lines = content.split('\n')

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch
    ? titleMatch[1].replace(/^SOP:\s*/i, '').trim()
    : filename.replace('.md', '').replace(/-/g, ' ')

  // Extract purpose
  const purposeMatch = content.match(/\*\*Purpose:\*\*\s*(.+)/i)
  const purpose = purposeMatch ? purposeMatch[1].trim() : null

  // Extract last updated
  const lastUpdatedMatch = content.match(/\*\*Last Updated:\*\*\s*(.+)/i)
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : null

  return {
    slug: filename.replace('.md', ''),
    title,
    purpose,
    lastUpdated,
  }
}

// GET /api/sops - List all SOPs
export async function GET() {
  try {
    // Check if directory exists
    if (!fs.existsSync(SOPS_DIR)) {
      return NextResponse.json({ sops: [] })
    }

    const files = fs.readdirSync(SOPS_DIR).filter(f => f.endsWith('.md'))

    const sops: SOPMeta[] = files.map(filename => {
      const filepath = path.join(SOPS_DIR, filename)
      const content = fs.readFileSync(filepath, 'utf-8')
      return extractMetadata(content, filename)
    })

    // Sort by title
    sops.sort((a, b) => a.title.localeCompare(b.title))

    return NextResponse.json({ sops })
  } catch (error) {
    console.error('[SOPs API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch SOPs' }, { status: 500 })
  }
}
