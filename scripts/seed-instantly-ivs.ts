import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CLIENT_ID = 'e79d95a4-1fa1-4dae-82f7-011fe79e4e7f'

const campaigns = [
  { platform: 'instantly', external_campaign_id: '92024911-0315-44e4-9c00-4138c1e8b0c8', campaign_name: 'IVS | Company Acquisition Trigger' },
  { platform: 'instantly', external_campaign_id: '87df5144-de39-4a25-815b-bcac7b6a5023', campaign_name: 'IVS - OFS' },
  { platform: 'instantly', external_campaign_id: '7e295ab7-45f1-4156-95b0-ee355535d1db', campaign_name: 'IVS | Chemical Manufacturing - Free Assessment Review' },
  { platform: 'instantly', external_campaign_id: '1556879a-5123-43d2-87b8-bbda02ee9727', campaign_name: 'IVS | Free Assessment Review - Hiring Trigger' },
]

async function main() {
  for (const campaign of campaigns) {
    const { error } = await supabase
      .from('client_integrations')
      .upsert(
        { client_id: CLIENT_ID, ...campaign },
        { onConflict: 'platform,external_campaign_id' }
      )
    if (error) {
      console.error(`Failed: ${campaign.campaign_name}:`, error.message)
    } else {
      console.log(`OK: ${campaign.campaign_name}`)
    }
  }
}

main().catch(console.error)
