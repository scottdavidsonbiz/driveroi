'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, X, Plus } from 'lucide-react'
import type { ClientIntakeData } from '@/app/clients/new/page'
import { useState } from 'react'

interface StepAnalysisProps {
  data: ClientIntakeData
  updateData: (updates: Partial<ClientIntakeData>) => void
  isAnalyzing: boolean
}

export function StepAnalysis({ data, updateData, isAnalyzing }: StepAnalysisProps) {
  const [newTrigger, setNewTrigger] = useState('')
  const [newPainPoint, setNewPainPoint] = useState('')

  if (isAnalyzing) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Analyzing Materials</h2>
        <p className="text-sm text-muted-foreground">
          AI is extracting ICP, pain points, and positioning...
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">Reading transcripts</Badge>
          <Badge variant="secondary">Analyzing website</Badge>
          <Badge variant="secondary">Building ICP</Badge>
        </div>
      </div>
    )
  }

  if (!data.analysis) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Analysis not available.</p>
      </div>
    )
  }

  const updateAnalysis = (path: string, value: any) => {
    const analysis = { ...data.analysis! }
    const keys = path.split('.')
    let obj: any = analysis

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value

    updateData({ analysis })
  }

  const addTrigger = () => {
    if (!newTrigger.trim()) return
    updateAnalysis('icp.triggers', [...data.analysis!.icp.triggers, newTrigger.trim()])
    setNewTrigger('')
  }

  const removeTrigger = (index: number) => {
    updateAnalysis('icp.triggers', data.analysis!.icp.triggers.filter((_, i) => i !== index))
  }

  const addPainPoint = () => {
    if (!newPainPoint.trim()) return
    updateAnalysis('painPoints', [...data.analysis!.painPoints, newPainPoint.trim()])
    setNewPainPoint('')
  }

  const removePainPoint = (index: number) => {
    updateAnalysis('painPoints', data.analysis!.painPoints.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI Analysis Complete</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Review and edit the extracted information below.
      </p>

      {/* ICP Section */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">Ideal Customer Profile</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyerPersona">Buyer Persona</Label>
            <Input
              id="buyerPersona"
              value={data.analysis.icp.buyerPersona}
              onChange={(e) => updateAnalysis('icp.buyerPersona', e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="companySize">Company Size</Label>
            <Input
              id="companySize"
              value={data.analysis.icp.companySize}
              onChange={(e) => updateAnalysis('icp.companySize', e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={data.analysis.icp.industry}
              onChange={(e) => updateAnalysis('icp.industry', e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="geography">Geography</Label>
            <Input
              id="geography"
              value={data.analysis.icp.geography}
              onChange={(e) => updateAnalysis('icp.geography', e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Triggers */}
        <div>
          <Label>Trigger Events</Label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {data.analysis.icp.triggers.map((trigger, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {trigger}
                <button
                  onClick={() => removeTrigger(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add trigger event..."
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTrigger()}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={addTrigger}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Pain Points */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Pain Points</h3>
        <div className="space-y-2">
          {data.analysis.painPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <span className="text-primary mt-1">•</span>
              <span className="flex-1 text-sm">{point}</span>
              <button
                onClick={() => removePainPoint(index)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add pain point..."
            value={newPainPoint}
            onChange={(e) => setNewPainPoint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPainPoint()}
            className="flex-1"
          />
          <Button size="sm" variant="outline" onClick={addPainPoint}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Positioning */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Positioning Statement</h3>
        <Textarea
          value={data.analysis.positioning}
          onChange={(e) => updateAnalysis('positioning', e.target.value)}
          className="min-h-[80px]"
        />
      </Card>

      {/* Email Angles */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Email Angles</h3>
        <div className="space-y-4">
          {data.analysis.emailAngles.map((angle, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Angle {index + 1}</Label>
              </div>
              <Input
                value={angle.name}
                onChange={(e) => {
                  const angles = [...data.analysis!.emailAngles]
                  angles[index] = { ...angles[index], name: e.target.value }
                  updateAnalysis('emailAngles', angles)
                }}
                placeholder="Angle name"
                className="font-medium"
              />
              <Input
                value={angle.subject}
                onChange={(e) => {
                  const angles = [...data.analysis!.emailAngles]
                  angles[index] = { ...angles[index], subject: e.target.value }
                  updateAnalysis('emailAngles', angles)
                }}
                placeholder="Subject line"
              />
              <Textarea
                value={angle.preview}
                onChange={(e) => {
                  const angles = [...data.analysis!.emailAngles]
                  angles[index] = { ...angles[index], preview: e.target.value }
                  updateAnalysis('emailAngles', angles)
                }}
                placeholder="Email preview/opening"
                className="min-h-[60px]"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
