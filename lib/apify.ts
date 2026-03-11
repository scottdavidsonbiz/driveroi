const APIFY_BASE_URL = 'https://api.apify.com/v2'

function getApiKey(): string {
  const key = process.env.APIFY_API_KEY
  if (!key) throw new Error('APIFY_API_KEY not set')
  return key
}

// LinkedIn Post Likers/Commenters actor
const LINKEDIN_POST_SCRAPER_ACTOR = 'scraping_solutions~linkedin-posts-engagers-likers-and-commenters-no-cookies'

export async function scrapePostEngagers(postUrl: string, webhookUrl: string) {
  const token = getApiKey()

  // Start the actor run — POST body IS the input directly
  const webhooksParam = encodeURIComponent(JSON.stringify([{
    eventTypes: ['ACTOR.RUN.SUCCEEDED'],
    requestUrl: webhookUrl,
  }]))

  const res = await fetch(
    `${APIFY_BASE_URL}/acts/${LINKEDIN_POST_SCRAPER_ACTOR}/runs?token=${token}&webhooks=${webhooksParam}`,
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
