const APIFY_BASE_URL = 'https://api.apify.com/v2'

function getApiKey(): string {
  const key = process.env.APIFY_API_KEY
  if (!key) throw new Error('APIFY_API_KEY not set')
  return key
}

// LinkedIn Post Likers/Commenters actor
const LINKEDIN_POST_SCRAPER_ACTOR = 'd5ib8ypLiKOuB8y8Q'

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
