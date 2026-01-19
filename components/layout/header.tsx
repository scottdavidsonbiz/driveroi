'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const pageTitles: Record<string, { title: string; description?: string; action?: { label: string; href: string } }> = {
  '/': {
    title: 'Dashboard',
    description: 'Overview of all client activity'
  },
  '/clients': {
    title: 'Clients',
    description: 'Manage client accounts and campaigns',
    action: { label: 'New Client', href: '/clients/new' }
  },
  '/clients/new': {
    title: 'New Client',
    description: 'Set up a new client account'
  },
  '/leads': {
    title: 'Leads',
    description: 'View and manage enriched leads'
  },
  '/sops': {
    title: 'SOPs',
    description: 'Standard operating procedures and playbooks'
  },
  '/settings': {
    title: 'Settings',
    description: 'Configure your workspace'
  },
}

export function Header() {
  const pathname = usePathname()

  // Find matching page config
  let pageConfig = pageTitles[pathname]

  // Check for dynamic routes
  if (!pageConfig) {
    if (pathname.startsWith('/clients/') && pathname !== '/clients/new') {
      pageConfig = {
        title: 'Client Details',
        description: 'View and manage client'
      }
    } else if (pathname.startsWith('/sops/')) {
      pageConfig = {
        title: 'SOP',
        description: 'Standard operating procedure'
      }
    }
  }

  // Fallback
  if (!pageConfig) {
    pageConfig = { title: 'DriveROI Ops' }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{pageConfig.title}</h1>
        {pageConfig.description && (
          <p className="text-sm text-muted-foreground">{pageConfig.description}</p>
        )}
      </div>

      {pageConfig.action && (
        <Button asChild size="sm" className="gradient-accent border-0">
          <Link href={pageConfig.action.href}>
            <Plus className="mr-1.5 h-4 w-4" />
            {pageConfig.action.label}
          </Link>
        </Button>
      )}
    </header>
  )
}
