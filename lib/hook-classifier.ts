export type HookStyle = 'question-list' | 'contrarian' | 'data-led' | 'story' | 'direct' | 'observation'

export function isLinkedInUrl(text: string | null | undefined): boolean {
  if (!text) return false
  return text.includes('linkedin.com/feed/update')
}

export function classifyHookStyle(text: string | null | undefined): HookStyle | null {
  if (!text || text.trim() === '') return null
  if (isLinkedInUrl(text)) return null

  const firstLine = text.split('\n')[0].toLowerCase()
  const fullLower = text.toLowerCase()

  // Question-list: starts with question AND has numbered/bulleted items
  if (
    (firstLine.includes('?') || firstLine.startsWith('can ') || firstLine.startsWith('do ') || firstLine.startsWith('how ') || firstLine.startsWith('what ') || firstLine.startsWith('why ')) &&
    (/\n\s*[\d]+[.)]\s/.test(fullLower) || /\n\s*[-•]\s/.test(fullLower))
  ) {
    return 'question-list'
  }

  // Contrarian: negation or contradiction words in first sentence
  const contrarianPatterns = [' actually', ' wrong', ' stop ', 'stop ', ' but ', ' isn\'t', ' aren\'t', ' don\'t', ' doesn\'t', ' not ', ' dead', ' myth']
  if (contrarianPatterns.some(p => firstLine.includes(p))) {
    return 'contrarian'
  }

  // Data-led: numbers, percentages, or dollar signs in first line
  if (/\d[\d,]*/.test(firstLine) && (/\$/.test(firstLine) || /%/.test(firstLine) || /\d{2,}/.test(firstLine))) {
    return 'data-led'
  }

  // Story: temporal or first-person narrative opening
  const storyPatterns = ['last week', 'last month', 'last year', 'yesterday', 'this morning', 'i sat down', 'i was ', 'we spent', 'we built', 'we ran', 'i just']
  if (storyPatterns.some(p => firstLine.includes(p))) {
    return 'story'
  }

  // Observation: generalized pattern observation
  const observationPatterns = ['most companies', 'every time', 'every company', 'most founders', 'most people', 'in my experience', 'companies are']
  if (observationPatterns.some(p => firstLine.includes(p))) {
    return 'observation'
  }

  // Default: direct
  return 'direct'
}
