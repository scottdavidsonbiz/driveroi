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

export interface Task {
  id: string
  clarify_id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  assignee_email: string | null
  deal_name: string | null
  clarify_url: string | null
  synced_at: string
  created_at: string
}

export interface AuditSubmission {
  id: string
  name: string
  email: string
  company: string | null
  answers: Record<string, number>
  category_scores: Record<string, number>
  total_score: number
  score_tier: string
  created_at: string
}

export interface ContentIdea {
  id: string
  created_by: string
  title: string
  notes: string | null
  status: 'idea' | 'planned' | 'in_progress' | 'published' | 'archived'
  priority: number
  theme_tag: string | null
  created_at: string
  updated_at: string
}

export interface ContentTheme {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: 'upcoming' | 'active' | 'completed'
  created_at: string
}

export interface ContentPost {
  id: string
  theme_id: string | null
  idea_id: string | null
  author: string
  content_type: 'thought_leadership' | 'tactical'
  funnel_stage: 'top' | 'middle' | 'bottom' | null
  post_text: string | null
  linkedin_url: string | null
  status: 'draft' | 'ready' | 'published'
  published_at: string | null
  created_at: string
}

export interface LinkedInMetric {
  id: string
  post_id: string | null
  author: string
  post_text: string | null
  published_at: string | null
  impressions: number
  reactions: number
  comments: number
  reposts: number
  clicks: number
  engagement_rate: number
  new_followers: number
  imported_at: string
}

export interface PostEngager {
  id: string
  post_id: string
  linkedin_url: string | null
  name: string | null
  title: string | null
  company: string | null
  domain: string | null
  email: string | null
  enriched_at: string | null
  icp_status: string | null
  created_at: string
}
