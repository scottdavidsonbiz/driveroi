const APIFY_BASE_URL = 'https://api.apify.com/v2'

function getApiKey(): string {
  const key = process.env.APIFY_API_KEY
  if (!key) throw new Error('APIFY_API_KEY not set')
  return key
}

// LinkedIn Post Likers/Commenters actor
// Replace ACTOR_ID with the actual actor ID from your Apify account
const LINKEDIN_POST_SCRAPER_ACTOR = 'curious_coder/linkedin-post-likers-and-commenters'

export async function scrapePostEngagers(postUrl: string, webhookUrl: string) {
  const res = await fetch(
    `${APIFY_BASE_URL}/acts/${LINKEDIN_POST_SCRAPER_ACTOR}/runs?token=${getApiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: {
          postUrls: [postUrl],
        },
        webhooks: [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED'],
            requestUrl: webhookUrl,
          },
        ],
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Apify API error ${res.status}: ${text}`)
  }

  return res.json()
}
