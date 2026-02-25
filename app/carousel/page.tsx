'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, Sparkles, Download, Copy, RefreshCw, Zap } from 'lucide-react'
import { CarouselPreview } from '@/components/carousel/carousel-preview'
import type {
  CarouselData,
  CarouselGenerateResponse,
  VoiceTone,
  CTAStyle,
  HookOption,
  HooksGenerateResponse,
  Card as SlideCard,
} from '@/lib/carousel/types'

const CTA_OPTIONS: Array<{ value: CTAStyle; label: string }> = [
  { value: 'none', label: 'No CTA' },
  { value: 'dm', label: 'DM me' },
  { value: 'book', label: 'Book a call' },
  { value: 'follow', label: 'Follow for more' },
]

export default function CarouselPage() {
  const [idea, setIdea] = useState('')
  const [hook, setHook] = useState('')
  const [voice, setVoice] = useState<VoiceTone>('professional')
  const [cta, setCta] = useState<CTAStyle>('none')
  const [ctaCustom, setCtaCustom] = useState('')

  // Hook selection step
  const [hookOptions, setHookOptions] = useState<HookOption[] | null>(null)
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false)

  // Results
  const [postCopy, setPostCopy] = useState('')
  const [carousel, setCarousel] = useState<CarouselData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerateHooks() {
    if (!idea.trim()) return
    setIsGeneratingHooks(true)
    setError(null)
    setHookOptions(null)

    try {
      const res = await fetch('/api/carousel/hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate hooks')
      }

      const data: HooksGenerateResponse = await res.json()
      setHookOptions(data.hooks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGeneratingHooks(false)
    }
  }

  function handleSelectHook(hookOption: HookOption) {
    setHook(hookOption.hook)
    setHookOptions(null)
    // Auto-generate with selected hook
    handleGenerateWithHook(hookOption.hook)
  }

  async function handleGenerateWithHook(selectedHook: string) {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/carousel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          hook: selectedHook || undefined,
          voice,
          cta,
          ctaCustom: cta === 'none' ? undefined : ctaCustom.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data: CarouselGenerateResponse = await res.json()
      setPostCopy(data.postCopy)
      setCarousel(data.carousel)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleGenerate() {
    handleGenerateWithHook(hook.trim())
  }

  async function handleDownloadPDF() {
    if (!carousel) return
    setIsRendering(true)
    setError(null)

    try {
      const res = await fetch('/api/carousel/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carousel),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Render failed')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'carousel.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render PDF')
    } finally {
      setIsRendering(false)
    }
  }

  async function handleCopyPost() {
    try {
      await navigator.clipboard.writeText(postCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_err) {
      const textarea = document.createElement('textarea')
      textarea.value = postCopy
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleUpdateCard(index: number, card: SlideCard) {
    if (!carousel) return
    const newCards = [...carousel.cards]
    newCards[index] = card
    setCarousel({ ...carousel, cards: newCards })
  }

  const hasResults = postCopy && carousel

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Post idea
            </label>
            <Textarea
              placeholder="Enter your post idea, rough concept, or raw thoughts..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Hook / angle <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <div className="flex gap-2">
              <Input
                placeholder={"Set your angle, or generate options below"}
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateHooks}
                disabled={isGeneratingHooks || !idea.trim()}
                className="whitespace-nowrap"
              >
                {isGeneratingHooks ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                )}
                Get hooks
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Set your own angle, or click &ldquo;Get hooks&rdquo; for 3 options to choose from.
            </p>
          </div>

          {/* Hook Options */}
          {hookOptions && (
            <div className="space-y-2">
              <label className="text-sm font-medium block">Pick a hook</label>
              {hookOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectHook(opt)}
                  className="w-full text-left p-3 rounded-md border hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm font-medium">{opt.hook}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.angle}</p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setHookOptions(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Voice</label>
              <div className="flex rounded-md border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setVoice('professional')}
                  className={`flex-1 px-3 py-2 text-sm transition-colors ${
                    voice === 'professional'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  Professional
                </button>
                <button
                  type="button"
                  onClick={() => setVoice('conversational')}
                  className={`flex-1 px-3 py-2 text-sm transition-colors border-l ${
                    voice === 'conversational'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  Conversational
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">CTA</label>
              <select
                value={cta}
                onChange={(e) => setCta(e.target.value as CTAStyle)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CTA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cta !== 'none' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Custom CTA text <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                placeholder={`Override default with your own text`}
                value={ctaCustom}
                onChange={(e) => setCtaCustom(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !idea.trim()}
            className="gradient-accent border-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasResults && (
        <>
          {/* Post Copy */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">LinkedIn Post</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPost}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  {copied ? 'Copied!' : 'Copy Post'}
                </Button>
              </div>
              <Textarea
                value={postCopy}
                onChange={(e) => setPostCopy(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Slide Previews */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Carousel Slides</label>
                <p className="text-xs text-muted-foreground">Hover slides to edit or regenerate</p>
              </div>
              <CarouselPreview
                carousel={carousel}
                postCopy={postCopy}
                voice={voice}
                onUpdateCard={handleUpdateCard}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadPDF}
              disabled={isRendering}
              className="gradient-accent border-0"
            >
              {isRendering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rendering PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate All
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
