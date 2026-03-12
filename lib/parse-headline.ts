/**
 * Parse a LinkedIn headline into title and company.
 *
 * Handles common patterns:
 *   "VP Marketing at Acme Corp"
 *   "Chief Revenue Officer | Acme Corp"
 *   "VP of Marketing, Acme Corp"
 *   "Director of Sales @ Acme"
 *
 * Returns null for title/company when parsing fails.
 */
export function parseHeadline(headline: string | null | undefined): {
  title: string | null
  company: string | null
} {
  if (!headline || !headline.trim()) {
    return { title: null, company: null }
  }

  const text = headline.trim()

  // Try splitting on common separators: " at ", " @ ", " | ", " - ", ", "
  const separators = [' at ', ' @ ', ' | ', ' - ', ', ']
  for (const sep of separators) {
    const idx = text.toLowerCase().indexOf(sep.toLowerCase())
    if (idx > 0) {
      const left = text.slice(0, idx).trim()
      const right = text.slice(idx + sep.length).trim()
      if (left && right) {
        return { title: left, company: right }
      }
    }
  }

  // No separator found — treat entire headline as title, no company
  return { title: text, company: null }
}
