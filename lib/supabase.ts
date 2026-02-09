import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Client {
  id: string
  name: string
  website: string | null
  industry: string | null
  status: 'client' | 'prospect' | 'internal' | 'churned'
  created_at: string
  updated_at: string
}

export interface ClientICP {
  id: string
  client_id: string
  buyer_persona: string | null
  company_size: string | null
  industry: string | null
  geography: string | null
  triggers: string[] | null
  pain_points: string[] | null
  positioning: string | null
  email_angles: {
    name: string
    subject: string
    preview: string
  }[] | null
  created_at: string
  updated_at: string
}

export interface ClientMaterial {
  id: string
  client_id: string
  type: string
  filename: string | null
  content: string | null
  created_at: string
}

export interface ClientIntegration {
  id: string
  client_id: string
  platform: string
  external_campaign_id: string
  campaign_name: string | null
  active: boolean
  created_at: string
}

export interface ClientUpdate {
  id: string
  client_id: string
  period_start: string
  period_end: string
  metrics_snapshot: Record<string, any>
  previous_snapshot: Record<string, any> | null
  narrative: string
  recommendations: string[]
  markdown_path: string | null
  created_at: string
}

export interface Lead {
  id: string
  client_id: string | null
  email: string | null
  domain: string | null
  first_name: string | null
  last_name: string | null
  title: string | null
  company: string | null
  linkedin_url: string | null
  enriched_at: string | null
  source: string | null
  raw_data: Record<string, unknown> | null
  created_at: string
}
