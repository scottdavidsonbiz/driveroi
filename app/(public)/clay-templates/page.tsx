'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Play, FileText, ExternalLink } from 'lucide-react'

type Tier = 'crawl' | 'walk' | 'run'

interface ClayColumn {
  name: string
  type: string
  source: string
}

interface Template {
  id: string
  tier: Tier
  title: string
  useCase: string
  problem: string
  description: string
  timeToValue: string
  columns: ClayColumn[]
  loomUrl?: string
  sopUrl?: string
  keyBenefit: string
}

const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; border: string; tagBg: string; description: string }> = {
  crawl: {
    label: 'Crawl',
    color: '#22C55E',
    bg: 'bg-green-50',
    border: 'border-green-200',
    tagBg: 'bg-green-100 text-green-800',
    description: 'Quick wins. Fix what\'s broken, clean what\'s dirty. Live in days.',
  },
  walk: {
    label: 'Walk',
    color: '#F59E0B',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    tagBg: 'bg-amber-100 text-amber-800',
    description: 'Signal-based workflows. Enrich, score, and route leads automatically.',
  },
  run: {
    label: 'Run',
    color: '#8B5CF6',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    tagBg: 'bg-violet-100 text-violet-800',
    description: 'Full ABM and multi-channel orchestration. The complete GTM engine.',
  },
}

// Templates will be added after review — keep empty for now
const TEMPLATES: Template[] = []

function ColumnTypeTag({ type }: { type: string }) {
  const colors: Record<string, string> = {
    'CRM Import': 'bg-slate-100 text-slate-700',
    'Signal': 'bg-blue-100 text-blue-700',
    'Enrichment': 'bg-cyan-100 text-cyan-700',
    'Formula': 'bg-orange-100 text-orange-700',
    'AI Column': 'bg-purple-100 text-purple-700',
    'Action': 'bg-green-100 text-green-700',
    'Seed List': 'bg-slate-100 text-slate-700',
    'Lookup': 'bg-slate-100 text-slate-700',
  }
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {type}
    </span>
  )
}

function TemplateCard({ template }: { template: Template }) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_CONFIG[template.tier]

  return (
    <div className={`rounded-xl border-2 ${tier.border} overflow-hidden transition-all duration-200`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full ${tier.bg} px-6 py-5 text-left transition-colors hover:opacity-90`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${tier.tagBg}`}>
                {tier.label}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-medium text-gray-600">
                {template.useCase}
              </span>
              <span className="rounded-full bg-white/80 px-3 py-0.5 text-xs font-medium text-gray-600">
                {template.timeToValue}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{template.keyBenefit}</p>
          </div>
          <div className="mt-1 flex-shrink-0 text-gray-400">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-6 py-6 space-y-6">
          {/* Problem / Description */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">The Problem</h4>
              <p className="text-sm text-gray-700">{template.problem}</p>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">What This Template Does</h4>
              <p className="text-sm text-gray-700">{template.description}</p>
            </div>
          </div>

          {/* Clay Table */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Clay Table Structure</h4>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Column</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Source / Logic</th>
                  </tr>
                </thead>
                <tbody>
                  {template.columns.map((col, i) => (
                    <tr key={col.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-2 font-medium text-gray-900">{col.name}</td>
                      <td className="px-4 py-2"><ColumnTypeTag type={col.type} /></td>
                      <td className="px-4 py-2 text-gray-600">{col.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loom + SOP row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Loom Video */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-4 w-4 text-gray-500" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">Video Walkthrough</h4>
              </div>
              {template.loomUrl ? (
                <div className="aspect-video overflow-hidden rounded-md">
                  <iframe
                    src={template.loomUrl}
                    className="h-full w-full"
                    allowFullScreen
                    title={`${template.title} walkthrough`}
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white">
                  <p className="text-sm text-gray-400">Loom walkthrough coming soon</p>
                </div>
              )}
            </div>

            {/* SOP Doc */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">SOP Document</h4>
              </div>
              {template.sopUrl ? (
                <a
                  href={template.sopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ color: '#6D28D9' }}
                >
                  <FileText className="h-4 w-4" />
                  View Full SOP
                  <ExternalLink className="ml-auto h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="flex h-[calc(100%-2rem)] min-h-[60px] items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white">
                  <p className="text-sm text-gray-400">SOP document coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClayTemplatesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-dark.png"
            alt="DriveROI"
            width={160}
            height={40}
            priority
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Clay Templates:{' '}
          <span className="gradient-accent-text">Crawl, Walk, Run</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Ready-to-use Clay table blueprints for Sales, Marketing, and Customer Success.
          Pick your level, follow the SOP, and start building.
        </p>

        {/* CTA */}
        <div className="mt-6">
          <a
            href="https://cal.com/driveroi/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            Want These Built For You? Book a Call
          </a>
        </div>
      </div>

      {/* Tier Legend */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {(['crawl', 'walk', 'run'] as Tier[]).map((tier) => {
          const config = TIER_CONFIG[tier]
          return (
            <div key={tier} className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-sm font-bold text-gray-900">{config.label}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">{config.description}</p>
            </div>
          )
        })}
      </div>

      {/* Templates */}
      <div className="space-y-4">
        {TEMPLATES.length > 0 ? (
          TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-lg font-semibold text-gray-500">Templates launching soon</p>
            <p className="mt-2 text-sm text-gray-400">
              Clay table blueprints for Sales, Marketing, and Customer Success — each with a video walkthrough and step-by-step SOP.
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        className="mt-12 rounded-xl p-6 text-center text-white sm:p-8"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        <h3 className="text-lg font-semibold sm:text-xl">
          These templates are the blueprint. We build the machine.
        </h3>
        <p className="mt-2 text-sm" style={{ color: '#E9E5FF' }}>
          Book a free 30-minute call. We&apos;ll assess your current stack and tell you exactly
          which template fits — and what it takes to go live.
        </p>
        <a
          href="https://cal.com/driveroi/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
          style={{ color: '#6D28D9' }}
        >
          Book a Strategy Call
        </a>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DriveROI. Signal-to-pipeline infrastructure built on Clay.</p>
      </div>
    </div>
  )
}
