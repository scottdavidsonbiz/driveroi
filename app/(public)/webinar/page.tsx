'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Terminal, FileText, Zap, MessageSquare, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Expandable({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors">
        <span className="font-semibold text-zinc-900">{title}</span>
        {open ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-zinc-100">{children}</div>}
    </div>
  )
}

const SKILL_FILES = {
  extractInsights: {
    name: 'extract-insights/SKILL.md',
    download: '/webinar/extract-insights-SKILL.md',
    files: [
      { name: 'SKILL.md', url: '/webinar/extract-insights-SKILL.md' },
      { name: 'references/output-template.md', url: '/webinar/extract-insights-output-template.md' },
    ]
  },
  prospectDeliverable: {
    name: 'prospect-deliverable/SKILL.md',
    download: '/webinar/prospect-deliverable-SKILL.md',
    files: [
      { name: 'SKILL.md', url: '/webinar/prospect-deliverable-SKILL.md' },
      { name: 'references/discovery-workflow.md', url: '/webinar/prospect-deliverable-discovery-workflow.md' },
    ]
  }
}

export default function WebinarPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-zinc-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-zinc-900">DriveROI</span>
          <a
            href="https://luma.com/CCinthewildcb_sd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Register
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Session
          </span>
          <span className="text-xs text-zinc-400">March 25, 2026 at 11:00 AM ET</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight mb-4">
          Claude Code for Go-to-Market
        </h1>

        <p className="text-lg text-zinc-500 leading-relaxed mb-8 max-w-2xl">
          Two GTM tools built entirely in Claude Code. Live walkthrough of the builds, the decisions, and where things got messy. Plus a reference deck on MCPs, APIs, and getting started.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://luma.com/CCinthewildcb_sd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Register Free <ArrowRight size={15} />
          </a>
          <a
            href="#skills"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 text-zinc-700 text-sm font-medium hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            Get the Skills <Terminal size={15} />
          </a>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-zinc-100" />
      </div>

      {/* What You'll See */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-8">What You'll See</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-zinc-100 bg-zinc-50/50">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
              <MessageSquare size={18} className="text-amber-700" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-2">Meeting Insight Extraction</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Drop in a call transcript. Get pain points with direct quotes, buying triggers, objections, competitive intel, next steps, and a follow-up email draft. No scrolling through 45-minute recordings.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-100 bg-zinc-50/50">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Zap size={18} className="text-blue-700" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-2">Outbound Prospecting Pipeline</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Full flow: find ICP lookalikes with DiscoLike, grab decision-maker contacts, verify emails, push straight to Instantly. One pipeline, no manual steps, live URL deliverable at the end.
            </p>
          </div>
        </div>

        <div className="mt-8 p-5 rounded-xl border border-zinc-100 bg-zinc-50/50">
          <h3 className="font-semibold text-zinc-900 mb-2">What You Walk Away With</h3>
          <ul className="space-y-2 text-sm text-zinc-500">
            <li className="flex items-start gap-2">
              <Check size={15} className="text-emerald-500 mt-0.5 shrink-0" />
              A clear picture of how to think about building GTM tools with Claude Code
            </li>
            <li className="flex items-start gap-2">
              <Check size={15} className="text-emerald-500 mt-0.5 shrink-0" />
              Real decisions and trade-offs, not just the highlight reel
            </li>
            <li className="flex items-start gap-2">
              <Check size={15} className="text-emerald-500 mt-0.5 shrink-0" />
              Both Claude Code skills to try yourself (copy below)
            </li>
          </ul>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-zinc-100" />
      </div>

      {/* Getting Started Basics */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-8">Getting Started with Claude Code</h2>

        <div className="space-y-3">
          <Expandable title="What is Claude Code?">
            <div className="pt-3 space-y-3 text-sm text-zinc-600 leading-relaxed">
              <p>Claude Code is Anthropic's CLI tool that gives Claude direct access to your filesystem, terminal, and connected services. It reads your code, runs commands, edits files, and connects to external tools via MCP servers.</p>
              <p>Think of it as an AI pair programmer that lives in your terminal and can actually do things, not just suggest them.</p>
              <div className="mt-4 p-4 rounded-lg bg-zinc-900 text-zinc-300 font-mono text-xs">
                <span className="text-zinc-500"># Install</span><br />
                npm install -g @anthropic-ai/claude-code<br /><br />
                <span className="text-zinc-500"># Run in any project directory</span><br />
                claude
              </div>
            </div>
          </Expandable>

          <Expandable title="What is a Skill?">
            <div className="pt-3 space-y-3 text-sm text-zinc-600 leading-relaxed">
              <p>A skill is a markdown file (SKILL.md) that teaches Claude a specific workflow. It contains step-by-step instructions, reference files, and sometimes scripts. When you invoke a skill, Claude follows the instructions to complete a task.</p>
              <p>Skills live in <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs">.claude/skills/</code> in your project. Each skill is a folder with a SKILL.md and optional reference files.</p>
              <div className="mt-4 p-4 rounded-lg bg-zinc-100 text-zinc-700 font-mono text-xs">
                .claude/skills/<br />
                &nbsp;&nbsp;extract-insights/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;SKILL.md<br />
                &nbsp;&nbsp;&nbsp;&nbsp;references/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;output-template.md<br />
                &nbsp;&nbsp;prospect-deliverable/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;SKILL.md<br />
                &nbsp;&nbsp;&nbsp;&nbsp;references/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;discovery-workflow.md<br />
                &nbsp;&nbsp;&nbsp;&nbsp;scripts/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;generate-deliverable.py
              </div>
            </div>
          </Expandable>

          <Expandable title="What are MCPs?">
            <div className="pt-3 space-y-3 text-sm text-zinc-600 leading-relaxed">
              <p>MCP (Model Context Protocol) servers give Claude access to external tools and data. Instead of writing API code, you connect an MCP server and Claude can call it directly.</p>
              <p>Examples used in this session:</p>
              <ul className="space-y-1 ml-4">
                <li><strong>DiscoLike</strong> — company discovery and enrichment (65M+ companies)</li>
                <li><strong>Clarify</strong> — CRM data, meeting transcripts, deal pipeline</li>
              </ul>
              <p>MCPs are configured in your project's <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs">.claude/settings.json</code> file.</p>
            </div>
          </Expandable>

          <Expandable title="What is CLAUDE.md?">
            <div className="pt-3 space-y-3 text-sm text-zinc-600 leading-relaxed">
              <p>CLAUDE.md is the project-level instruction file. Claude reads it at the start of every conversation. Use it for:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Project context (what the codebase does, who it's for)</li>
                <li>Conventions (coding style, naming, file structure)</li>
                <li>Tool configuration (API keys, service URLs)</li>
                <li>Do's and don'ts (tone rules, things to avoid)</li>
              </ul>
              <p>Think of it as onboarding docs for your AI teammate.</p>
            </div>
          </Expandable>

          <Expandable title="Git Basics (Just Enough)">
            <div className="pt-3 space-y-3 text-sm text-zinc-600 leading-relaxed">
              <p>Claude Code works within a git repository. You don't need to be a git expert, but you need to know:</p>
              <div className="mt-3 p-4 rounded-lg bg-zinc-900 text-zinc-300 font-mono text-xs space-y-2">
                <div><span className="text-zinc-500"># See what changed</span><br />git status</div>
                <div><span className="text-zinc-500"># Save your work</span><br />git add . && git commit -m "description"</div>
                <div><span className="text-zinc-500"># Undo last change if something breaks</span><br />git checkout -- .</div>
                <div><span className="text-zinc-500"># Push to GitHub (if connected)</span><br />git push</div>
              </div>
              <p className="mt-3">Claude Code will often handle git for you if you ask it to commit or push.</p>
            </div>
          </Expandable>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-zinc-100" />
      </div>

      {/* Skills */}
      <section id="skills" className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">The Skills</h2>
        <p className="text-sm text-zinc-500 mb-8">Copy these into your project's <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs">.claude/skills/</code> directory to try them yourself.</p>

        <div className="space-y-6">
          {/* Skill 1 */}
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-5 bg-zinc-50/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <MessageSquare size={16} className="text-amber-700" />
                </div>
                <h3 className="font-semibold text-zinc-900">Meeting Insight Extraction</h3>
              </div>
              <p className="text-sm text-zinc-500 mb-4">
                Full skill with 11-step process: participant identification, pain point extraction with quote citations, buying triggers, objections, competitive intel, decision criteria, action items, follow-up email drafting, and content ideas. Includes output template.
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILL_FILES.extractInsights.files.map((f) => (
                  <a
                    key={f.name}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    <FileText size={14} className="text-zinc-400" />
                    {f.name}
                    <ExternalLink size={12} className="text-zinc-300 ml-1" />
                  </a>
                ))}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-zinc-100 bg-white">
              <p className="text-xs text-zinc-400">
                Place in <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-600">.claude/skills/extract-insights/</code> in your project
              </p>
            </div>
          </div>

          {/* Skill 2 */}
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-6 py-5 bg-zinc-50/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap size={16} className="text-blue-700" />
                </div>
                <h3 className="font-semibold text-zinc-900">Outbound Prospecting Pipeline</h3>
              </div>
              <p className="text-sm text-zinc-500 mb-4">
                5-phase end-to-end workflow: prospect research, account discovery (DiscoLike + Exa), automated contact enrichment (DiscoLike contacts + Anymailfinder fallback), branded HTML deliverable generation, and Vercel deployment. Includes discovery workflow reference with query strategies.
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILL_FILES.prospectDeliverable.files.map((f) => (
                  <a
                    key={f.name}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    <FileText size={14} className="text-zinc-400" />
                    {f.name}
                    <ExternalLink size={12} className="text-zinc-300 ml-1" />
                  </a>
                ))}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-zinc-100 bg-white">
              <p className="text-xs text-zinc-400">
                Place in <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-600">.claude/skills/prospect-deliverable/</code> in your project
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-zinc-100" />
      </div>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 mb-3">Live build session. Not slides.</h2>
        <p className="text-zinc-500 mb-6">March 25, 2026 at 11:00 AM ET. Free and online.</p>
        <a
          href="https://luma.com/CCinthewildcb_sd"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors"
        >
          Register <ExternalLink size={15} />
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-zinc-400">DriveROI</span>
          <span className="text-xs text-zinc-400">Part of the Claude Code in the Wild series</span>
        </div>
      </footer>
    </div>
  )
}
