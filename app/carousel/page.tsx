'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, Sparkles, Download, Copy, RefreshCw } from 'lucide-react'
import { CarouselPreview } from '@/components/carousel/carousel-preview'
import type { CarouselData, CarouselGenerateResponse, VoiceTone, CTAStyle } from '@/lib/carousel/types'

const CTA_OPTIONS: { value: CTAStyle; label: string }[] = [
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
  const [postCopy, setPostCopy] = useState('')
  const [carousel, setCarousel] = useState<CarouselData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!idea.trim()) return
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/carousel/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          hook: hook.trim() || undefined,
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
            <Input
              placeholder={'e.g., "Founders blame the hire when it\'s an infrastructure problem"'}
              value={hook}
              onChange={(e) => setHook(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set the specific take you want to lead with. Leave blank to let it generate one.
            </p>
          </div>

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
                placeholder={`Override default "${CTA_OPTIONS.find(o => o.value === cta)?.label}" with your own text`}
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
              <label className="text-sm font-medium mb-3 block">Carousel Slides</label>
              <CarouselPreview carousel={carousel} />
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
              Regenerate
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
