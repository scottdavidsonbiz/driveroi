'use client'

import { useState } from 'react'
import { RefreshCw, Pencil, Check, X, Loader2 } from 'lucide-react'
import type { CarouselData, Card } from '@/lib/carousel/types'

const BRAND = {
  BLACK: "#0A0A0A",
  WHITE: "#FFFFFF",
  CREAM: "#F7F3EE",
  PURPLE: "#8B5CF6",
  GRAY_400: "#A3A3A3",
  GRAY_600: "#525252",
}

interface SlideActions {
  onEdit: (index: number, card: Card) => void
  onRegenerate: (index: number, feedback?: string) => void
  editingIndex: number | null
  regeneratingIndex: number | null
  setEditingIndex: (index: number | null) => void
}

function MiniSlide({ children, label, index, actions }: {
  children: React.ReactNode
  label: string
  index?: number
  actions?: SlideActions
}) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const isEditing = actions && index !== undefined && actions.editingIndex === index
  const isRegenerating = actions && index !== undefined && actions.regeneratingIndex === index

  return (
    <div className="flex-shrink-0 w-[270px]">
      <div
        className="w-[270px] h-[270px] rounded-lg overflow-hidden relative group"
        style={{ backgroundColor: BRAND.CREAM }}
      >
        {children}
        {actions && index !== undefined && !isEditing && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => actions.setEditingIndex(index)}
              className="p-1.5 rounded bg-white/90 shadow-sm hover:bg-white text-gray-600 hover:text-gray-900"
              title="Edit slide"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setFeedbackOpen(!feedbackOpen)}
              className="p-1.5 rounded bg-white/90 shadow-sm hover:bg-white text-gray-600 hover:text-gray-900"
              title="Regenerate slide"
              disabled={!!isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </button>
          </div>
        )}
      </div>
      {feedbackOpen && actions && index !== undefined && (
        <div className="mt-1.5 flex gap-1">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What's wrong with this slide?"
            className="flex-1 text-xs border rounded px-2 py-1 bg-background"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                actions.onRegenerate(index, feedback || undefined)
                setFeedback('')
                setFeedbackOpen(false)
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              actions.onRegenerate(index, feedback || undefined)
              setFeedback('')
              setFeedbackOpen(false)
            }}
            className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground"
          >
            Go
          </button>
          <button
            type="button"
            onClick={() => { setFeedback(''); setFeedbackOpen(false) }}
            className="text-xs px-1.5 py-1 rounded border"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-1.5 text-center">{label}</p>
    </div>
  )
}

/** Mini footer bar matching the real slide footer */
function MiniFooter({ navLabel }: { navLabel?: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[22px] flex items-center justify-between px-4"
      style={{ backgroundColor: BRAND.BLACK }}
    >
      <span className="text-[8px] font-bold text-white">driveROI</span>
      {navLabel && (
        <span className="text-[8px] font-bold text-white">{navLabel} &rarr;</span>
      )}
    </div>
  )
}

function TitlePreview({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <MiniSlide label="Title">
      <div className="p-5 flex flex-col items-center justify-center h-full text-center">
        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: BRAND.PURPLE }}>
          GUIDE
        </span>
        <p className="font-bold text-sm leading-tight mt-2" style={{ color: BRAND.BLACK }}>{title}</p>
        {subtitle && (
          <p className="text-[10px] mt-1.5" style={{ color: BRAND.GRAY_600 }}>{subtitle}</p>
        )}
        <div className="mt-3 px-3 py-1.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: BRAND.BLACK }}>
          Learn how &rarr;
        </div>
      </div>
    </MiniSlide>
  )
}

function StatPreview({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-full pb-[22px]">
        <p className="font-bold text-2xl" style={{ color: BRAND.PURPLE }}>{value}</p>
        <p className="text-[9px] mt-1 uppercase tracking-wider text-center px-4" style={{ color: BRAND.GRAY_600 }}>{label}</p>
      </div>
      <MiniFooter navLabel="Next" />
    </div>
  )
}

function InsightPreview({ headline, body, index }: { headline: string; body: string; index: number }) {
  return (
    <div>
      <div className="flex flex-col justify-start h-full p-5 pb-[28px]">
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>
          Insight {index + 1}
        </span>
        <p className="font-bold text-xs leading-tight mt-1" style={{ color: BRAND.BLACK }}>{headline}</p>
        <div className="w-4 h-[2px] rounded my-2" style={{ backgroundColor: BRAND.PURPLE }} />
        <p className="text-[9px] leading-snug" style={{ color: BRAND.GRAY_600 }}>{body}</p>
      </div>
      <MiniFooter navLabel="Next" />
    </div>
  )
}

function StepPreview({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div>
      <div className="flex flex-col justify-start h-full p-5 pb-[28px]">
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>
          Step {number}
        </span>
        <p className="font-bold text-xs leading-tight mt-1" style={{ color: BRAND.BLACK }}>{title}</p>
        <div className="w-4 h-[2px] rounded my-2" style={{ backgroundColor: BRAND.PURPLE }} />
        <p className="text-[9px] leading-snug" style={{ color: BRAND.GRAY_600 }}>{description}</p>
      </div>
      <MiniFooter navLabel="Next step" />
    </div>
  )
}

function TakeawayPreview({ text }: { text: string }) {
  return (
    <div>
      <div className="flex flex-col justify-center h-full p-5 pb-[28px]">
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>
          Key takeaway
        </span>
        <span className="text-lg font-bold leading-none mt-1" style={{ color: BRAND.PURPLE }}>&ldquo;</span>
        <p className="font-bold text-xs leading-tight" style={{ color: BRAND.BLACK }}>{text}</p>
      </div>
      <MiniFooter />
    </div>
  )
}

function CTAPreview() {
  return (
    <MiniSlide label="CTA">
      <div className="flex flex-col items-center justify-center h-full text-center p-5">
        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: BRAND.PURPLE }}>
          Want to build a system?
        </span>
        <p className="font-bold text-xs leading-tight mt-2" style={{ color: BRAND.BLACK }}>
          Let&apos;s make your pipeline predictable
        </p>
        <div className="w-4 h-[2px] rounded my-2" style={{ backgroundColor: BRAND.PURPLE }} />
        <div className="px-3 py-1.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: BRAND.BLACK }}>
          driveroi.ai &rarr;
        </div>
      </div>
    </MiniSlide>
  )
}

// --- Inline editors for each card type ---

function StatEditor({ card, onSave, onCancel }: { card: Card & { type: 'stat' }; onSave: (c: Card) => void; onCancel: () => void }) {
  const [value, setValue] = useState(card.value)
  const [label, setLabel] = useState(card.label)
  return (
    <div className="p-3 flex flex-col gap-2 h-full pb-[28px]">
      <label className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>Stat Value</label>
      <input value={value} onChange={e => setValue(e.target.value)} className="text-xs border rounded px-1.5 py-1 bg-white" />
      <label className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>Label</label>
      <input value={label} onChange={e => setLabel(e.target.value)} className="text-xs border rounded px-1.5 py-1 bg-white" />
      <div className="flex gap-1 mt-auto">
        <button type="button" onClick={() => onSave({ type: 'stat', value, label })} className="p-1 rounded bg-primary text-primary-foreground"><Check className="h-3 w-3" /></button>
        <button type="button" onClick={onCancel} className="p-1 rounded border"><X className="h-3 w-3" /></button>
      </div>
    </div>
  )
}

function InsightEditor({ card, onSave, onCancel }: { card: Card & { type: 'insight' }; onSave: (c: Card) => void; onCancel: () => void }) {
  const [headline, setHeadline] = useState(card.headline)
  const [body, setBody] = useState(card.body)
  return (
    <div className="p-3 flex flex-col gap-1.5 h-full pb-[28px]">
      <label className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>Headline</label>
      <input value={headline} onChange={e => setHeadline(e.target.value)} className="text-xs border rounded px-1.5 py-1 bg-white" />
      <label className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>Body</label>
      <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="text-[9px] border rounded px-1.5 py-1 bg-white flex-1 resize-none" />
      <div className="flex gap-1">
        <button type="button" onClick={() => onSave({ type: 'insight', headline, body })} className="p-1 rounded bg-primary text-primary-foreground"><Check className="h-3 w-3" /></button>
        <button type="button" onClick={onCancel} className="p-1 rounded border"><X className="h-3 w-3" /></button>
      </div>
    </div>
  )
}

function StepEditor({ card, onSave, onCancel }: { card: Card & { type: 'step' }; onSave: (c: Card) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  return (
    <div className="p-3 flex flex-col gap-1.5 h-full pb-[28px]">
      <label className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>Step {card.number} Title</label>
      <input value={title} onChange={e => setTitle(e.target.value)} className="text-xs border rounded px-1.5 py-1 bg-white" />
      <label className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="text-[9px] border rounded px-1.5 py-1 bg-white flex-1 resize-none" />
      <div className="flex gap-1">
        <button type="button" onClick={() => onSave({ type: 'step', number: card.number, title, description })} className="p-1 rounded bg-primary text-primary-foreground"><Check className="h-3 w-3" /></button>
        <button type="button" onClick={onCancel} className="p-1 rounded border"><X className="h-3 w-3" /></button>
      </div>
    </div>
  )
}

function TakeawayEditor({ card, onSave, onCancel }: { card: Card & { type: 'takeaway' }; onSave: (c: Card) => void; onCancel: () => void }) {
  const [text, setText] = useState(card.text)
  return (
    <div className="p-3 flex flex-col gap-2 h-full pb-[28px]">
      <label className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>Takeaway Text</label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3} className="text-xs border rounded px-1.5 py-1 bg-white resize-none" />
      <div className="flex gap-1 mt-auto">
        <button type="button" onClick={() => onSave({ type: 'takeaway', text })} className="p-1 rounded bg-primary text-primary-foreground"><Check className="h-3 w-3" /></button>
        <button type="button" onClick={onCancel} className="p-1 rounded border"><X className="h-3 w-3" /></button>
      </div>
    </div>
  )
}

function CardEditor({ card, onSave, onCancel }: { card: Card; onSave: (c: Card) => void; onCancel: () => void }) {
  switch (card.type) {
    case 'stat': return <StatEditor card={card} onSave={onSave} onCancel={onCancel} />
    case 'insight': return <InsightEditor card={card} onSave={onSave} onCancel={onCancel} />
    case 'step': return <StepEditor card={card} onSave={onSave} onCancel={onCancel} />
    case 'takeaway': return <TakeawayEditor card={card} onSave={onSave} onCancel={onCancel} />
  }
}

function renderCardContent(card: Card, index: number) {
  switch (card.type) {
    case 'stat':
      return <StatPreview value={card.value} label={card.label} />
    case 'insight':
      return <InsightPreview headline={card.headline} body={card.body} index={index} />
    case 'step':
      return <StepPreview number={card.number} title={card.title} description={card.description} />
    case 'takeaway':
      return <TakeawayPreview text={card.text} />
  }
}

export function CarouselPreview({ carousel, postCopy, voice, onUpdateCard }: {
  carousel: CarouselData
  postCopy?: string
  voice?: string
  onUpdateCard?: (index: number, card: Card) => void
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)

  const handleEdit = (index: number, card: Card) => {
    if (onUpdateCard) {
      onUpdateCard(index, card)
    }
    setEditingIndex(null)
  }

  const handleRegenerate = async (index: number, feedback?: string) => {
    if (!onUpdateCard || !postCopy) return
    setRegeneratingIndex(index)
    try {
      const res = await fetch('/api/carousel/regenerate-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carousel,
          postCopy,
          slideIndex: index,
          feedback,
          voice: voice || 'professional',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        onUpdateCard(index, data.card)
      }
    } finally {
      setRegeneratingIndex(null)
    }
  }

  const actions: SlideActions | undefined = onUpdateCard ? {
    onEdit: handleEdit,
    onRegenerate: handleRegenerate,
    editingIndex,
    regeneratingIndex,
    setEditingIndex,
  } : undefined

  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      <TitlePreview title={carousel.title} subtitle={carousel.subtitle} />
      {carousel.cards.map((card, i) => (
        <MiniSlide key={i} label={card.type} index={i} actions={actions}>
          {editingIndex === i ? (
            <CardEditor card={card} onSave={(c) => handleEdit(i, c)} onCancel={() => setEditingIndex(null)} />
          ) : (
            renderCardContent(card, i)
          )}
        </MiniSlide>
      ))}
      <CTAPreview />
    </div>
  )
}
