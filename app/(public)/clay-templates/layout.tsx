import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clay Templates: Crawl, Walk, Run | DriveROI',
  description:
    'Ready-to-use Clay table templates for Sales, Marketing, and Customer Success. From basic enrichment to full ABM — pick your level and start building.',
}

export default function ClayTemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
