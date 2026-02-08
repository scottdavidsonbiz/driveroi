import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CLIENT_ID = 'e79d95a4-1fa1-4dae-82f7-011fe79e4e7f'

const campaigns = [
  { platform: 'heyreach', external_campaign_id: '296817', campaign_name: 'IVS marketing list - connection' },
  { platform: 'heyreach', external_campaign_id: '312975', campaign_name: 'Oilfield Svc' },
  { platform: 'heyreach', external_campaign_id: '324743', campaign_name: 'Chem Mfg' },
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
      console.log(`OK: ${campaign.campaign_name} (${campaign.external_campaign_id})`)
    }
  }
}

main().catch(console.error)
