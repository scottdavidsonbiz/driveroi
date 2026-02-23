// Notion-based task query layer for daily digest
// Reads from the DriveROI Tasks database in Notion

const NOTION_DATABASE_ID = '783f5ed431da4666b9f54609f4840b18'
const NOTION_VERSION = '2022-06-28'

export interface DigestTask {
  id: string
  title: string
  stage: string
  priority: string
  due_date: string | null
  assignee: string | null
  area: string | null
  notion_url: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToTask(page: any): DigestTask {
  const props = page.properties
  return {
    id: page.id,
    title: props['Task name']?.title?.[0]?.plain_text ?? '(untitled)',
    stage: props['Stage']?.select?.name ?? 'Not Started',
    priority: props['Priority']?.select?.name ?? 'Medium',
    due_date: props['Due']?.date?.start ?? null,
    assignee: props['Assignee']?.people?.[0]?.name ?? null,
    area: props['Area']?.select?.name ?? null,
    notion_url: page.url,
  }
}

async function queryNotionDatabase(
  filter: Record<string, unknown>
): Promise<DigestTask[]> {
  const token = process.env.NOTION_TOKEN
  if (!token) throw new Error('NOTION_TOKEN not configured')

  const res = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter,
        sorts: [{ property: 'Due', direction: 'ascending' }],
        page_size: 100,
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.results.map(pageToTask)
}

export async function getOverdueTasks(): Promise<DigestTask[]> {
  const today = new Date().toISOString().split('T')[0]
  return queryNotionDatabase({
    and: [
      { property: 'Stage', select: { does_not_equal: 'Done' } },
      { property: 'Due', date: { before: today } },
    ],
  })
}

export async function getTasksDueToday(): Promise<DigestTask[]> {
  const today = new Date().toISOString().split('T')[0]
  return queryNotionDatabase({
    and: [
      { property: 'Stage', select: { does_not_equal: 'Done' } },
      { property: 'Due', date: { equals: today } },
    ],
  })
}

export async function getTasksDueThisWeek(): Promise<DigestTask[]> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  return queryNotionDatabase({
    and: [
      { property: 'Stage', select: { does_not_equal: 'Done' } },
      { property: 'Due', date: { after: todayStr } },
      { property: 'Due', date: { on_or_before: weekEndStr } },
    ],
  })
}

export async function getUpcomingTasks(): Promise<DigestTask[]> {
  const today = new Date()
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  return queryNotionDatabase({
    and: [
      { property: 'Stage', select: { does_not_equal: 'Done' } },
      { property: 'Due', date: { after: weekEndStr } },
    ],
  })
}

export async function getNoDueDateTasks(): Promise<DigestTask[]> {
  return queryNotionDatabase({
    and: [
      { property: 'Stage', select: { does_not_equal: 'Done' } },
      { property: 'Due', date: { is_empty: true } },
    ],
  })
}
