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
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen" style={{ backgroundColor: '#0A0A0B', color: '#E8E6E3' }}>
        {children}
      </div>
    </>
  )
}
