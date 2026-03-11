const APIFY_BASE_URL = 'https://api.apify.com/v2'

function getApiKey(): string {
  const key = process.env.APIFY_API_KEY
  if (!key) throw new Error('APIFY_API_KEY not set')
  return key
}

// LinkedIn Post Likers/Commenters actor
const LINKEDIN_POST_SCRAPER_ACTOR = 'scraping_solutions~linkedin-posts-engagers-likers-and-commenters-no-cookies'

export interface ApifyEngager {
  profileUrl?: string
  name?: string
  headline?: string
  [key: string]: unknown
}

// Runs actor synchronously and returns dataset items directly
export async function scrapePostEngagers(postUrl: string): Promise<ApifyEngager[]> {
  const token = getApiKey()

  const res = await fetch(
    `${APIFY_BASE_URL}/acts/${LINKEDIN_POST_SCRAPER_ACTOR}/run-sync-get-dataset-items?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: postUrl,
        start: 0,
        iterations: 5,
        type: 'commenters',
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Apify API error ${res.status}: ${text}`)
  }

  return res.json()
}
