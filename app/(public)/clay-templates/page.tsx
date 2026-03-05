'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Play, FileText, ExternalLink, ArrowRight } from 'lucide-react'

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

const TIER_CONFIG: Record<Tier, {
  label: string
  number: string
  color: string
  glowColor: string
  description: string
}> = {
  crawl: {
    label: 'Crawl',
    number: '01',
    color: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.15)',
    description: 'Fix what\'s broken. Clean what\'s dirty. Live in days, not weeks.',
  },
  walk: {
    label: 'Walk',
    number: '02',
    color: '#FBBF24',
    glowColor: 'rgba(251, 191, 36, 0.15)',
    description: 'Signal-based workflows. Enrich, score, and route automatically.',
  },
  run: {
    label: 'Run',
    number: '03',
    color: '#F97316',
    glowColor: 'rgba(249, 115, 22, 0.15)',
    description: 'Multi-table orchestration. ABM, multi-channel, time-based motions.',
  },
}

// Templates will be added after review — keep empty for now
const TEMPLATES: Template[] = []

function ColumnTypeTag({ type }: { type: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    'CRM Import': { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' },
    'Signal': { bg: 'rgba(96, 165, 250, 0.15)', text: '#60A5FA' },
    'Enrichment': { bg: 'rgba(34, 211, 238, 0.15)', text: '#22D3EE' },
    'Formula': { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' },
    'AI Column': { bg: 'rgba(192, 132, 252, 0.15)', text: '#C084FC' },
    'Action': { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399' },
    'Seed List': { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' },
    'Lookup': { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' },
  }
  const c = colors[type] || { bg: 'rgba(148, 163, 184, 0.15)', text: '#94A3B8' }
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        letterSpacing: '0.02em',
      }}
    >
      {type}
    </span>
  )
}

function TemplateCard({ template, index }: { template: Template; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_CONFIG[template.tier]

  return (
    <div
      className="template-card overflow-hidden rounded-lg border transition-all duration-300"
      style={{
        borderColor: expanded ? tier.color : 'rgba(255,255,255,0.08)',
        backgroundColor: expanded ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
        animationDelay: `${0.3 + index * 0.1}s`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  backgroundColor: tier.glowColor,
                  color: tier.color,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                {tier.label}
              </span>
              <span
                className="text-xs uppercase tracking-wider"
                style={{
                  color: 'rgba(232, 230, 227, 0.4)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                }}
              >
                {template.useCase}
              </span>
              <span
                className="text-xs"
                style={{
                  color: 'rgba(232, 230, 227, 0.3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                }}
              >
                {template.timeToValue}
              </span>
            </div>
            <h3
              className="text-xl font-semibold"
              style={{
                color: '#E8E6E3',
                letterSpacing: '-0.01em',
              }}
            >
              {template.title}
            </h3>
            <p className="mt-1.5 text-sm" style={{ color: 'rgba(232, 230, 227, 0.5)' }}>
              {template.keyBenefit}
            </p>
          </div>
          <div className="mt-2 flex-shrink-0" style={{ color: 'rgba(232, 230, 227, 0.3)' }}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t px-6 py-6 space-y-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: tier.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
              >
                The Problem
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(232, 230, 227, 0.6)' }}>
                {template.problem}
              </p>
            </div>
            <div>
              <h4
                className="mb-2 text-xs font-semibold uppercase tracking-widest"
                style={{ color: tier.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
              >
                What This Builds
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(232, 230, 227, 0.6)' }}>
                {template.description}
              </p>
            </div>
          </div>

          {/* Clay Table */}
          <div>
            <h4
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
            >
              Clay Table Schema
            </h4>
            <div
              className="overflow-x-auto rounded-lg border"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <table className="w-full text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(232, 230, 227, 0.35)', fontSize: '0.6rem' }}>Column</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(232, 230, 227, 0.35)', fontSize: '0.6rem' }}>Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(232, 230, 227, 0.35)', fontSize: '0.6rem' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {template.columns.map((col, i) => (
                    <tr
                      key={col.name}
                      style={{
                        borderBottom: i < template.columns.length - 1 ? '1px solid rgba(255,255,255,0.03)' : undefined,
                      }}
                    >
                      <td className="px-4 py-2 text-xs font-medium" style={{ color: '#E8E6E3' }}>{col.name}</td>
                      <td className="px-4 py-2"><ColumnTypeTag type={col.type} /></td>
                      <td className="px-4 py-2 text-xs" style={{ color: 'rgba(232, 230, 227, 0.4)' }}>{col.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loom + SOP row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Play className="h-3.5 w-3.5" style={{ color: 'rgba(232, 230, 227, 0.35)' }} />
                <h4
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                >
                  Video Walkthrough
                </h4>
              </div>
              {template.loomUrl ? (
                <div className="aspect-video overflow-hidden rounded">
                  <iframe src={template.loomUrl} className="h-full w-full" allowFullScreen title={`${template.title} walkthrough`} />
                </div>
              ) : (
                <div
                  className="flex aspect-video items-center justify-center rounded border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <p className="text-xs" style={{ color: 'rgba(232, 230, 227, 0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
                    Coming soon
                  </p>
                </div>
              )}
            </div>

            <div
              className="rounded-lg border p-4"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5" style={{ color: 'rgba(232, 230, 227, 0.35)' }} />
                <h4
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(232, 230, 227, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                >
                  SOP Document
                </h4>
              </div>
              {template.sopUrl ? (
                <a
                  href={template.sopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded border px-4 py-3 text-sm font-medium transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', color: tier.color }}
                >
                  <FileText className="h-4 w-4" />
                  View Full SOP
                  <ExternalLink className="ml-auto h-3.5 w-3.5" />
                </a>
              ) : (
                <div
                  className="flex min-h-[60px] items-center justify-center rounded border border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}
                >
                  <p className="text-xs" style={{ color: 'rgba(232, 230, 227, 0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
                    Coming soon
                  </p>
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
    <>
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .hero-title {
          animation: fadeUp 0.8s ease-out both;
        }
        .hero-subtitle {
          animation: fadeUp 0.8s ease-out 0.15s both;
        }
        .hero-cta {
          animation: fadeUp 0.8s ease-out 0.3s both;
        }
        .tier-card {
          animation: fadeUp 0.6s ease-out both;
        }
        .tier-card:nth-child(1) { animation-delay: 0.2s; }
        .tier-card:nth-child(2) { animation-delay: 0.3s; }
        .tier-card:nth-child(3) { animation-delay: 0.4s; }
        .template-card {
          animation: fadeUp 0.6s ease-out both;
        }
        .bottom-cta {
          animation: fadeIn 0.8s ease-out 0.6s both;
        }
        .grain-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 50;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }
        .connector-line {
          width: 1px;
          height: 24px;
          margin: 0 auto;
          background: linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
        }
      `}</style>

      <div className="grain-overlay" />

      <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="mb-20">
          <div className="hero-title mb-8 flex items-center gap-3">
            <Image
              src="/logo-white.png"
              alt="DriveROI"
              width={130}
              height={34}
              priority
              style={{ opacity: 0.9 }}
            />
          </div>

          <h1
            className="hero-title mb-6 font-bold"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#E8E6E3',
            }}
          >
            Clay Templates
            <br />
            <span className="font-light" style={{ color: 'rgba(232, 230, 227, 0.45)' }}>
              Crawl, Walk, Run
            </span>
          </h1>

          <p
            className="hero-subtitle mb-8 max-w-lg text-base leading-relaxed"
            style={{ color: 'rgba(232, 230, 227, 0.45)' }}
          >
            Production-ready Clay table blueprints for Sales, Marketing, and Customer Success.
            Each one includes the table schema, a video walkthrough, and a step-by-step SOP.
          </p>

          <a
            href="https://cal.com/driveroi/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #814ac8 0%, #9f5de8 100%)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(129, 74, 200, 0.3)',
            }}
          >
            Want these built for you? Book a call
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Tier Legend */}
        <div className="mb-16 space-y-0">
          {(['crawl', 'walk', 'run'] as Tier[]).map((tier, i) => {
            const config = TIER_CONFIG[tier]
            return (
              <div key={tier}>
                {i > 0 && <div className="connector-line" />}
                <div
                  className="tier-card flex items-start gap-5 rounded-lg border px-5 py-4 transition-colors"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${config.color}33`
                    e.currentTarget.style.backgroundColor = config.glowColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span
                    className="mt-0.5 text-xs font-medium"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'rgba(232, 230, 227, 0.2)',
                      fontSize: '0.65rem',
                    }}
                  >
                    {config.number}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: config.color,
                          boxShadow: `0 0 8px ${config.color}66`,
                        }}
                      />
                      <span
                        className="text-sm font-semibold uppercase tracking-widest"
                        style={{
                          color: config.color,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.7rem',
                        }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p
                      className="mt-1.5 text-sm leading-relaxed"
                      style={{ color: 'rgba(232, 230, 227, 0.45)' }}
                    >
                      {config.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div className="mb-12" style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />

        {/* Templates */}
        <div className="space-y-3">
          {TEMPLATES.length > 0 ? (
            TEMPLATES.map((template, i) => (
              <TemplateCard key={template.id} template={template} index={i} />
            ))
          ) : (
            <div
              className="template-card rounded-lg border border-dashed px-8 py-16 text-center"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.01)',
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{
                  color: 'rgba(232, 230, 227, 0.25)',
                }}
              >
                Templates launching soon
              </p>
              <p
                className="mx-auto mt-3 max-w-md text-xs leading-relaxed"
                style={{
                  color: 'rgba(232, 230, 227, 0.2)',
                }}
              >
                Clay table blueprints for Sales, Marketing, and Customer Success &mdash;
                each with a video walkthrough and step-by-step SOP.
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="bottom-cta mt-20 rounded-lg border px-8 py-10 sm:py-12"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.04) 0%, rgba(249, 115, 22, 0.04) 100%)',
          }}
        >
          <h3
            className="mb-3 text-2xl font-bold"
            style={{
              color: '#E8E6E3',
              letterSpacing: '-0.02em',
            }}
          >
            These are the blueprints.
            <br />
            <span className="font-light" style={{ color: 'rgba(232, 230, 227, 0.45)' }}>
              We build the machine.
            </span>
          </h3>
          <p
            className="mb-6 max-w-md text-sm leading-relaxed"
            style={{ color: 'rgba(232, 230, 227, 0.4)' }}
          >
            Book a 30-minute call. We&apos;ll assess your current stack and tell you exactly
            which template fits &mdash; and what it takes to go live.
          </p>
          <a
            href="https://cal.com/driveroi/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #814ac8 0%, #9f5de8 100%)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(129, 74, 200, 0.3)',
            }}
          >
            Book a strategy call
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p
            className="text-xs"
            style={{
              color: 'rgba(232, 230, 227, 0.15)',
              fontSize: '0.7rem',
              letterSpacing: '0.03em',
            }}
          >
            &copy; {new Date().getFullYear()} DriveROI &mdash; Signal-to-pipeline infrastructure built on Clay
          </p>
        </div>
      </div>
    </>
  )
}
