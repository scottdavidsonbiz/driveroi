'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Globe, Users, Target, MessageSquare, Mail } from 'lucide-react'
import type { ClientIntakeData } from '@/app/clients/new/page'

interface StepReviewProps {
  data: ClientIntakeData
  updateData: (updates: Partial<ClientIntakeData>) => void
}

export function StepReview({ data }: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Review & Confirm</h2>
        <p className="text-sm text-muted-foreground">
          Review the client setup before creating.
        </p>
      </div>

      {/* Basic Info */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Client Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{data.name}</p>
          </div>
          {data.website && (
            <div>
              <p className="text-muted-foreground">Website</p>
              <p className="font-medium">{data.website}</p>
            </div>
          )}
          {data.industry && (
            <div>
              <p className="text-muted-foreground">Industry</p>
              <p className="font-medium">{data.industry}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Materials Added</p>
            <p className="font-medium">{data.materials.length} items</p>
          </div>
        </div>
      </Card>

      {data.analysis && (
        <>
          {/* ICP */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Ideal Customer Profile</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Buyer Persona</p>
                <p className="font-medium">{data.analysis.icp.buyerPersona}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Company Size</p>
                <p className="font-medium">{data.analysis.icp.companySize}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Industry</p>
                <p className="font-medium">{data.analysis.icp.industry}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Geography</p>
                <p className="font-medium">{data.analysis.icp.geography}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-2">Trigger Events</p>
              <div className="flex flex-wrap gap-1">
                {data.analysis.icp.triggers.map((trigger, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Pain Points */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Pain Points</h3>
            </div>
            <ul className="space-y-1 text-sm">
              {data.analysis.painPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          {/* Positioning */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Positioning</h3>
            </div>
            <p className="text-sm">{data.analysis.positioning}</p>
          </Card>

          {/* Email Angles */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Email Angles ({data.analysis.emailAngles.length})</h3>
            </div>
            <div className="space-y-3">
              {data.analysis.emailAngles.map((angle, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-3">
                  <p className="font-medium text-sm">{angle.name}</p>
                  <p className="text-xs text-muted-foreground">Subject: {angle.subject}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
