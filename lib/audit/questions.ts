export interface AuditOption {
  label: string
  score: number
}

export interface AuditQuestion {
  id: string
  text: string
  options: AuditOption[]
}

export interface AuditCategory {
  id: string
  name: string
  description: string
  questions: AuditQuestion[]
}

export const CATEGORIES: AuditCategory[] = [
  {
    id: 'pipeline',
    name: 'Pipeline & CRM',
    description: 'CRM setup quality, deal stage governance, pipeline reporting',
    questions: [
      {
        id: 'q1',
        text: 'How would you describe your CRM setup?',
        options: [
          { label: 'Fully configured with custom fields, automations, and integrations', score: 3 },
          { label: 'Set up with basic fields and stages, mostly manual', score: 2 },
          { label: 'We have a CRM but it\'s underused or messy', score: 1 },
          { label: 'No CRM or using spreadsheets', score: 0 },
        ],
      },
      {
        id: 'q2',
        text: 'How well-defined are your deal stages?',
        options: [
          { label: 'Clear stages with entry/exit criteria and enforced by the team', score: 3 },
          { label: 'Stages exist but criteria are informal', score: 2 },
          { label: 'Stages exist but reps use them inconsistently', score: 1 },
          { label: 'No defined deal stages', score: 0 },
        ],
      },
      {
        id: 'q3',
        text: 'Can you report on pipeline health at any time?',
        options: [
          { label: 'Yes — live dashboards with velocity, conversion, and forecast data', score: 3 },
          { label: 'We can pull reports but it takes some manual work', score: 2 },
          { label: 'We check pipeline in ad-hoc meetings only', score: 1 },
          { label: 'We don\'t track pipeline metrics', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'enrichment',
    name: 'Enrichment & Scoring',
    description: 'ICP targeting, lead enrichment automation, scoring model',
    questions: [
      {
        id: 'q4',
        text: 'How clearly have you defined your Ideal Customer Profile (ICP)?',
        options: [
          { label: 'Documented ICP with firmographics, technographics, and buying signals', score: 3 },
          { label: 'We know our ICP informally but haven\'t documented it', score: 2 },
          { label: 'We have a general sense but no consistent criteria', score: 1 },
          { label: 'We sell to anyone who responds', score: 0 },
        ],
      },
      {
        id: 'q5',
        text: 'How do you enrich lead data (emails, titles, company info)?',
        options: [
          { label: 'Automated enrichment via tools like Clay, Clearbit, or Apollo', score: 3 },
          { label: 'We use enrichment tools but mostly manually', score: 2 },
          { label: 'Reps research leads one by one', score: 1 },
          { label: 'We don\'t enrich — we use whatever data we have', score: 0 },
        ],
      },
      {
        id: 'q6',
        text: 'Do you have a lead scoring model?',
        options: [
          { label: 'Yes — automated scoring based on fit + engagement signals', score: 3 },
          { label: 'Basic scoring (e.g., MQL threshold) but limited signals', score: 2 },
          { label: 'We prioritize leads informally based on gut feel', score: 1 },
          { label: 'No scoring — all leads treated equally', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'outbound',
    name: 'Outbound Systems',
    description: 'Outbound motion maturity, list building, performance tracking',
    questions: [
      {
        id: 'q7',
        text: 'How mature is your outbound motion?',
        options: [
          { label: 'Multi-channel sequences (email + LinkedIn + phone) running consistently', score: 3 },
          { label: 'We run email sequences but limited to one channel', score: 2 },
          { label: 'Outbound happens but it\'s ad-hoc and inconsistent', score: 1 },
          { label: 'No outbound — we rely entirely on inbound or referrals', score: 0 },
        ],
      },
      {
        id: 'q8',
        text: 'How do you build outbound lists?',
        options: [
          { label: 'Automated list building with ICP filters and signal-based triggers', score: 3 },
          { label: 'We pull lists from databases but do it manually', score: 2 },
          { label: 'Reps find prospects one at a time', score: 1 },
          { label: 'We buy generic lists or don\'t build lists', score: 0 },
        ],
      },
      {
        id: 'q9',
        text: 'How do you track outbound performance?',
        options: [
          { label: 'Dashboards tracking open rates, reply rates, meetings booked, and pipeline influenced', score: 3 },
          { label: 'We track basic email metrics (opens/replies) but not downstream', score: 2 },
          { label: 'We know if sequences are "working" anecdotally', score: 1 },
          { label: 'We don\'t track outbound performance', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'reporting',
    name: 'Reporting & Visibility',
    description: 'Dashboard quality, loss analysis, sales/marketing alignment',
    questions: [
      {
        id: 'q10',
        text: 'How do you report on sales and marketing performance?',
        options: [
          { label: 'Unified dashboards with real-time data across sales and marketing', score: 3 },
          { label: 'Separate dashboards for sales and marketing, reviewed regularly', score: 2 },
          { label: 'We pull numbers manually for periodic reviews', score: 1 },
          { label: 'No regular reporting process', score: 0 },
        ],
      },
      {
        id: 'q11',
        text: 'Do you analyze why deals are lost?',
        options: [
          { label: 'Systematic loss analysis with categorized reasons and quarterly reviews', score: 3 },
          { label: 'We track loss reasons in CRM but rarely analyze patterns', score: 2 },
          { label: 'Reps share feedback informally', score: 1 },
          { label: 'No loss analysis', score: 0 },
        ],
      },
      {
        id: 'q12',
        text: 'How aligned are your sales and marketing teams?',
        options: [
          { label: 'Shared KPIs, regular syncs, and joint pipeline reviews', score: 3 },
          { label: 'Occasional meetings but separate goals and metrics', score: 2 },
          { label: 'They operate mostly independently', score: 1 },
          { label: 'No coordination between sales and marketing', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'enablement',
    name: 'Team Enablement',
    description: 'Rep onboarding, messaging playbooks, coaching process',
    questions: [
      {
        id: 'q13',
        text: 'How do you onboard new sales reps?',
        options: [
          { label: 'Structured program with ramp milestones, shadowing, and certification', score: 3 },
          { label: 'Documented process but loosely followed', score: 2 },
          { label: 'Mostly "shadow someone and figure it out"', score: 1 },
          { label: 'No onboarding process', score: 0 },
        ],
      },
      {
        id: 'q14',
        text: 'Do you have messaging playbooks for your team?',
        options: [
          { label: 'Comprehensive playbooks with objection handling, talk tracks, and email templates', score: 3 },
          { label: 'Some documented templates but not comprehensive', score: 2 },
          { label: 'Reps create their own messaging', score: 1 },
          { label: 'No playbooks or templates', score: 0 },
        ],
      },
      {
        id: 'q15',
        text: 'How do you coach your sales team?',
        options: [
          { label: 'Regular 1:1s with call reviews, data-driven feedback, and skill development plans', score: 3 },
          { label: 'Periodic 1:1s focused on deal reviews', score: 2 },
          { label: 'Coaching happens reactively when problems arise', score: 1 },
          { label: 'No formal coaching process', score: 0 },
        ],
      },
    ],
  },
]

export const TOTAL_QUESTIONS = CATEGORIES.reduce(
  (sum, cat) => sum + cat.questions.length,
  0
)
