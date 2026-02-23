import { NextRequest, NextResponse } from 'next/server'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import React from 'react'
import { SLIDE_WIDTH, SLIDE_HEIGHT } from '@/lib/carousel/brand'
import {
  TitleSlide,
  CTASlide,
  renderCard,
} from '@/lib/carousel/slides'
import type { CarouselData } from '@/lib/carousel/types'

// Cache fonts and logo at module level (loaded once per cold start)
let fontsLoaded: { name: string; data: Buffer; weight: number; style: string }[] | null = null
let logoBase64: string | null = null

function loadAssets() {
  if (fontsLoaded && logoBase64) return { fonts: fontsLoaded, logo: logoBase64 }

  const publicDir = path.join(process.cwd(), 'public')

  const interBold = fs.readFileSync(path.join(publicDir, 'fonts', 'Inter-Bold.ttf'))
  const interRegular = fs.readFileSync(path.join(publicDir, 'fonts', 'Inter-Regular.ttf'))

  fontsLoaded = [
    { name: 'Inter Bold', data: interBold, weight: 700, style: 'normal' },
    { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
  ]

  const logoBuffer = fs.readFileSync(path.join(publicDir, 'logo.png'))
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`

  return { fonts: fontsLoaded, logo: logoBase64 }
}

async function renderSlideToSvg(
  element: React.ReactElement,
  fonts: { name: string; data: Buffer; weight: number; style: string }[]
): Promise<string> {
  return satori(element as React.ReactNode, {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    fonts: fonts.map(f => ({
      name: f.name,
      data: f.data,
      weight: f.weight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
      style: f.style as 'normal' | 'italic',
    })),
  })
}

function svgToPng(svg: string): Uint8Array {
  // Render at 2x resolution for crisp logos and text in the PDF
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: SLIDE_WIDTH * 2 },
  })
  const pngData = resvg.render()
  return pngData.asPng()
}

export async function POST(request: NextRequest) {
  try {
    const carousel: CarouselData = await request.json()

    if (!carousel || !carousel.title || !carousel.cards) {
      return NextResponse.json(
        { error: 'Invalid carousel data' },
        { status: 400 }
      )
    }

    const { fonts, logo } = loadAssets()

    // Build slide list: Title + content cards + CTA
    const slideElements: React.ReactElement[] = [
      React.createElement(TitleSlide, {
        title: carousel.title,
        subtitle: carousel.subtitle,
        logoBase64: logo,
      }),
      ...carousel.cards.map((card, index) =>
        renderCard(card, logo, carousel.cards, index) as React.ReactElement
      ),
      React.createElement(CTASlide, { logoBase64: logo }),
    ]

    // Render each slide: satori → SVG → resvg → PNG
    const pngBuffers: Uint8Array[] = []
    for (const element of slideElements) {
      const svg = await renderSlideToSvg(element, fonts)
      const png = svgToPng(svg)
      pngBuffers.push(png)
    }

    // Assemble PDF
    const pdfDoc = await PDFDocument.create()

    for (const pngBytes of pngBuffers) {
      const pngImage = await pdfDoc.embedPng(pngBytes)
      const page = pdfDoc.addPage([SLIDE_WIDTH, SLIDE_HEIGHT])
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
      })
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="carousel.pdf"',
      },
    })
  } catch (error) {
    console.error('[Carousel Render] Error:', error)
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ''
    return NextResponse.json(
      { error: 'Failed to render carousel PDF', detail: message, stack },
      { status: 500 }
    )
  }
}
