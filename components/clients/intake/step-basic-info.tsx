'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ClientIntakeData } from '@/app/clients/new/page'

interface StepBasicInfoProps {
  data: ClientIntakeData
  updateData: (updates: Partial<ClientIntakeData>) => void
}

export function StepBasicInfo({ data, updateData }: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Basic Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter the client's basic details to get started.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Client Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Acme Corporation"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={data.website}
            onChange={(e) => updateData({ website: e.target.value })}
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            We'll analyze the website to help build the ICP if provided.
          </p>
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            placeholder="e.g., Property Tax Assessment, SaaS, Healthcare"
            value={data.industry}
            onChange={(e) => updateData({ industry: e.target.value })}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  )
}
