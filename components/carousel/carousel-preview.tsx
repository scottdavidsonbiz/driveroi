'use client'

import type { CarouselData, Card } from '@/lib/carousel/types'

const BRAND = {
  BLACK: "#0A0A0A",
  WHITE: "#FFFFFF",
  PURPLE: "#8B5CF6",
  GRAY_400: "#A3A3A3",
  GRAY_800: "#262626",
}

function MiniSlide({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex-shrink-0 w-[270px]">
      <div
        className="w-[270px] h-[270px] rounded-lg overflow-hidden relative"
        style={{ backgroundColor: BRAND.BLACK }}
      >
        {children}
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 text-center">{label}</p>
    </div>
  )
}

function TitlePreview({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <MiniSlide label="Title">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: BRAND.PURPLE }} />
      <div className="p-6 flex flex-col justify-center h-full">
        <p className="text-white font-bold text-sm leading-tight">{title}</p>
        {subtitle && (
          <p className="text-xs mt-2" style={{ color: BRAND.GRAY_400 }}>{subtitle}</p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: BRAND.PURPLE }} />
    </MiniSlide>
  )
}

function StatPreview({ value, label }: { value: string; label: string }) {
  return (
    <MiniSlide label="Stat">
      <div className="flex flex-col items-center justify-center h-full">
        <p className="font-bold text-2xl" style={{ color: BRAND.PURPLE }}>{value}</p>
        <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: BRAND.GRAY_400 }}>{label}</p>
      </div>
    </MiniSlide>
  )
}

function InsightPreview({ headline, body }: { headline: string; body: string }) {
  return (
    <MiniSlide label="Insight">
      <div className="flex items-center h-full px-6">
        <div className="w-[2px] self-stretch mr-4 rounded" style={{ backgroundColor: BRAND.PURPLE }} />
        <div>
          <p className="text-white font-bold text-xs leading-tight">{headline}</p>
          {body && <p className="text-[10px] mt-1.5 leading-snug" style={{ color: BRAND.GRAY_400 }}>{body}</p>}
        </div>
      </div>
    </MiniSlide>
  )
}

function StepPreview({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <MiniSlide label={`Step ${number}`}>
      <div className="flex items-center h-full px-5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3"
          style={{ backgroundColor: BRAND.PURPLE }}
        >
          <span className="text-white text-xs font-bold">{String(number).padStart(2, '0')}</span>
        </div>
        <div>
          <p className="text-white font-bold text-xs">{title}</p>
          <p className="text-[10px] mt-1 leading-snug" style={{ color: BRAND.GRAY_400 }}>{description}</p>
        </div>
      </div>
    </MiniSlide>
  )
}

function TakeawayPreview({ text }: { text: string }) {
  return (
    <MiniSlide label="Takeaway">
      <div className="flex items-center h-full px-6">
        <div className="w-[2px] self-stretch mr-4 rounded" style={{ backgroundColor: BRAND.PURPLE }} />
        <p className="text-white font-bold text-xs leading-tight">{text}</p>
      </div>
    </MiniSlide>
  )
}

function CTAPreview() {
  return (
    <MiniSlide label="CTA">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: BRAND.PURPLE }} />
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-8 h-[2px] mb-3" style={{ backgroundColor: BRAND.PURPLE }} />
        <p className="text-xs" style={{ color: BRAND.GRAY_400 }}>driveroi.ai</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: BRAND.PURPLE }} />
    </MiniSlide>
  )
}

function renderCardPreview(card: Card, index: number) {
  switch (card.type) {
    case 'stat':
      return <StatPreview key={index} value={card.value} label={card.label} />
    case 'insight':
      return <InsightPreview key={index} headline={card.headline} body={card.body} />
    case 'step':
      return <StepPreview key={index} number={card.number} title={card.title} description={card.description} />
    case 'takeaway':
      return <TakeawayPreview key={index} text={card.text} />
  }
}

export function CarouselPreview({ carousel }: { carousel: CarouselData }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3">
      <TitlePreview title={carousel.title} subtitle={carousel.subtitle} />
      {carousel.cards.map((card, i) => renderCardPreview(card, i))}
      <CTAPreview />
    </div>
  )
}
