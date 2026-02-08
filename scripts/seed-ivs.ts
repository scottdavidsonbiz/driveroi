/**
 * Seed script: Creates IVS/IBS client and maps HeyReach campaigns.
 *
 * Prerequisites:
 *   1. Run supabase/migrations/001_client_updates.sql in the Supabase SQL Editor
 *   2. Have .env or .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Run with:
 *   npx tsx --env-file=.env --env-file=.env.local scripts/seed-ivs.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('Checking for existing IVS client...')

  // Check if IVS already exists
  const { data: existing } = await supabase
    .from('clients')
    .select('id, name')
    .or('name.ilike.%IVS%,name.ilike.%IBS%')
    .limit(1)

  let clientId: string

  if (existing && existing.length > 0) {
    clientId = existing[0].id
    console.log(`Found existing client: ${existing[0].name} (${clientId})`)
  } else {
    console.log('Creating IVS client...')
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: 'IVS (Industrial Valuation Services)',
        website: 'https://industrialvaluationservices.com',
        industry: 'Oilfield Services / Industrial Property Tax',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create client:', error.message)
      process.exit(1)
    }

    clientId = client.id
    console.log(`Created client: ${client.name} (${clientId})`)
  }

  // Insert HeyReach campaign mappings
  const campaigns = [
    { platform: 'heyreach', external_campaign_id: '296817', campaign_name: 'IVS marketing list - connection' },
    { platform: 'heyreach', external_campaign_id: '312975', campaign_name: 'Oilfield Svc' },
    { platform: 'heyreach', external_campaign_id: '324743', campaign_name: 'Chem Mfg' },
  ]

  console.log(`Inserting ${campaigns.length} campaign integrations...`)

  for (const campaign of campaigns) {
    const { error } = await supabase
      .from('client_integrations')
      .upsert(
        { client_id: clientId, ...campaign },
        { onConflict: 'platform,external_campaign_id' }
      )

    if (error) {
      console.error(`Failed to insert ${campaign.campaign_name}:`, error.message)
    } else {
      console.log(`  ✓ ${campaign.platform} / ${campaign.campaign_name} (${campaign.external_campaign_id})`)
    }
  }

  console.log('\nDone! IVS client ID:', clientId)
  console.log('Navigate to: http://localhost:3000/clients/' + clientId)
}

main().catch(console.error)
