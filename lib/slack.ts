import type { DigestTask } from './tasks'

interface SlackBlock {
  type: string
  text?: { type: string; text: string; emoji?: boolean }
  elements?: { type: string; text: string }[]
}

export async function postToSlack(
  webhookUrl: string,
  blocks: SlackBlock[]
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Slack webhook error ${res.status}: ${text}`)
  }
}

function formatPriority(priority: string): string {
  switch (priority) {
    case 'Urgent': return ':rotating_light:'
    case 'High': return ':red_circle:'
    case 'Medium': return ':large_orange_circle:'
    case 'Low': return ':white_circle:'
    default: return ':white_circle:'
  }
}

function formatTask(task: DigestTask): string {
  const priority = formatPriority(task.priority)
  const area = task.area ? ` -- ${task.area}` : ''
  const due = task.due_date ? ` (due ${task.due_date})` : ''
  const link = `<${task.notion_url}|${task.title}>`
  return `${priority} [${task.priority}] ${link}${area}${due}`
}

// Slack section blocks have a 3000 char limit on text.
// Split tasks into chunks that fit within that limit.
function taskSectionBlocks(
  header: string,
  tasks: DigestTask[]
): SlackBlock[] {
  const blocks: SlackBlock[] = []
  let current = header
  for (const t of tasks) {
    const line = `\n  ${formatTask(t)}`
    if (current.length + line.length > 2900 && current !== header) {
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: current } })
      current = line.trimStart()
    } else {
      current += line
    }
  }
  if (current) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: current } })
  }
  return blocks
}

export function formatTaskDigest(sections: {
  overdue: DigestTask[]
  dueToday: DigestTask[]
  dueThisWeek: DigestTask[]
  upcoming: DigestTask[]
  noDueDate: DigestTask[]
}): SlackBlock[] {
  const today = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dateStr = `${dayNames[today.getDay()]} ${monthNames[today.getMonth()]} ${today.getDate()}`

  const totalTasks =
    sections.overdue.length +
    sections.dueToday.length +
    sections.dueThisWeek.length +
    sections.upcoming.length +
    sections.noDueDate.length

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `DriveROI Daily Digest -- ${dateStr}`,
        emoji: true,
      },
    },
  ]

  if (totalTasks === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':white_check_mark: *All clear!* No open tasks right now.',
      },
    })
    return blocks
  }

  const buckets: [string, DigestTask[]][] = [
    [`:fire: *OVERDUE (${sections.overdue.length})*`, sections.overdue],
    [`:calendar: *DUE TODAY (${sections.dueToday.length})*`, sections.dueToday],
    [`:date: *THIS WEEK (${sections.dueThisWeek.length})*`, sections.dueThisWeek],
    [`:soon: *UPCOMING (${sections.upcoming.length})*`, sections.upcoming],
    [`:inbox_tray: *NO DUE DATE (${sections.noDueDate.length})*`, sections.noDueDate],
  ]

  for (const [header, tasks] of buckets) {
    if (tasks.length > 0) {
      blocks.push(...taskSectionBlocks(header, tasks))
    }
  }

  blocks.push({ type: 'divider' })
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `${totalTasks} open tasks | <https://www.notion.so/783f5ed431da4666b9f54609f4840b18|View in Notion> | <https://driveroi.vercel.app|Ops App>`,
      },
    ],
  })

  return blocks
}
