'use client'

import type { CarouselData, Card } from '@/lib/carousel/types'

const BRAND = {
  BLACK: "#0A0A0A",
  WHITE: "#FFFFFF",
  CREAM: "#F7F3EE",
  PURPLE: "#8B5CF6",
  GRAY_400: "#A3A3A3",
  GRAY_600: "#525252",
}

function MiniSlide({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex-shrink-0 w-[270px]">
      <div
        className="w-[270px] h-[270px] rounded-lg overflow-hidden relative"
        style={{ backgroundColor: BRAND.CREAM }}
      >
        {children}
      </div>
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
        <span className="text-[8px] font-bold text-white">{navLabel} →</span>
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
          Learn how →
        </div>
      </div>
    </MiniSlide>
  )
}

function StatPreview({ value, label }: { value: string; label: string }) {
  return (
    <MiniSlide label="Stat">
      <div className="flex flex-col items-center justify-center h-full pb-[22px]">
        <p className="font-bold text-2xl" style={{ color: BRAND.PURPLE }}>{value}</p>
        <p className="text-[9px] mt-1 uppercase tracking-wider text-center px-4" style={{ color: BRAND.GRAY_600 }}>{label}</p>
      </div>
      <MiniFooter navLabel="Next" />
    </MiniSlide>
  )
}

function InsightPreview({ headline, body, index }: { headline: string; body: string; index: number }) {
  return (
    <MiniSlide label="Insight">
      <div className="flex flex-col justify-start h-full p-5 pb-[28px]">
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>
          Insight {index + 1}
        </span>
        <p className="font-bold text-xs leading-tight mt-1" style={{ color: BRAND.BLACK }}>{headline}</p>
        <div className="w-4 h-[2px] rounded my-2" style={{ backgroundColor: BRAND.PURPLE }} />
        <p className="text-[9px] leading-snug" style={{ color: BRAND.GRAY_600 }}>{body}</p>
      </div>
      <MiniFooter navLabel="Next" />
    </MiniSlide>
  )
}

function StepPreview({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <MiniSlide label={`Step ${number}`}>
      <div className="flex flex-col justify-start h-full p-5 pb-[28px]">
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>
          Step {number}
        </span>
        <p className="font-bold text-xs leading-tight mt-1" style={{ color: BRAND.BLACK }}>{title}</p>
        <div className="w-4 h-[2px] rounded my-2" style={{ backgroundColor: BRAND.PURPLE }} />
        <p className="text-[9px] leading-snug" style={{ color: BRAND.GRAY_600 }}>{description}</p>
      </div>
      <MiniFooter navLabel="Next step" />
    </MiniSlide>
  )
}

function TakeawayPreview({ text }: { text: string }) {
  return (
    <MiniSlide label="Takeaway">
      <div className="flex flex-col justify-center h-full p-5 pb-[28px]">
        <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: BRAND.GRAY_600 }}>
          Key takeaway
        </span>
        <span className="text-lg font-bold leading-none mt-1" style={{ color: BRAND.PURPLE }}>&ldquo;</span>
        <p className="font-bold text-xs leading-tight" style={{ color: BRAND.BLACK }}>{text}</p>
      </div>
      <MiniFooter />
    </MiniSlide>
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
          driveroi.ai →
        </div>
      </div>
    </MiniSlide>
  )
}

function renderCardPreview(card: Card, index: number) {
  switch (card.type) {
    case 'stat':
      return <StatPreview key={index} value={card.value} label={card.label} />
    case 'insight':
      return <InsightPreview key={index} headline={card.headline} body={card.body} index={index} />
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
