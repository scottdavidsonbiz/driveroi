import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GTM Readiness Audit | DriveROI',
  description:
    'Score your go-to-market infrastructure in 3 minutes. Find the gaps holding back your pipeline.',
}

export default function AuditLayout({
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
