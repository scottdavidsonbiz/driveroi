import { describe, it, expect } from 'vitest'
import { classifyEngagerTier, TIER_DEFINITIONS } from '../icp-tiers'

describe('classifyEngagerTier', () => {
  it('classifies VP Marketing as tier 3 (buyer)', () => {
    const result = classifyEngagerTier('VP Marketing')
    expect(result.tier).toBe(3)
    expect(result.label).toBe('Buyer')
  })

  it('classifies CRO as tier 3', () => {
    expect(classifyEngagerTier('CRO').tier).toBe(3)
  })

  it('classifies Chief Marketing Officer as tier 3', () => {
    expect(classifyEngagerTier('Chief Marketing Officer').tier).toBe(3)
  })

  it('classifies Director Marketing as tier 2 (influencer)', () => {
    const result = classifyEngagerTier('Director of Marketing')
    expect(result.tier).toBe(2)
    expect(result.label).toBe('Influencer')
  })

  it('classifies Head of Demand Gen as tier 2', () => {
    expect(classifyEngagerTier('Head of Demand Generation').tier).toBe(2)
  })

  it('classifies Marketing Manager as tier 1 (adjacent)', () => {
    const result = classifyEngagerTier('Marketing Manager')
    expect(result.tier).toBe(1)
    expect(result.label).toBe('Adjacent')
  })

  it('classifies SDR as tier 0 (non-ICP)', () => {
    const result = classifyEngagerTier('Senior SDR')
    expect(result.tier).toBe(0)
    expect(result.label).toBe('Non-ICP')
  })

  it('is case-insensitive', () => {
    expect(classifyEngagerTier('vp marketing').tier).toBe(3)
    expect(classifyEngagerTier('VP MARKETING').tier).toBe(3)
    expect(classifyEngagerTier('director marketing').tier).toBe(2)
  })

  it('handles null/empty titles as tier 0', () => {
    expect(classifyEngagerTier(null).tier).toBe(0)
    expect(classifyEngagerTier('').tier).toBe(0)
    expect(classifyEngagerTier(undefined as unknown as string).tier).toBe(0)
  })

  it('matches longest pattern first (VP Marketing over Marketing Manager)', () => {
    expect(classifyEngagerTier('VP of Marketing').tier).toBe(3)
  })

  it('matches titles with extra words around the pattern', () => {
    expect(classifyEngagerTier('Senior VP of Sales, North America').tier).toBe(3)
    expect(classifyEngagerTier('Director of Revenue Operations at Acme').tier).toBe(2)
  })

  it('exports TIER_DEFINITIONS array', () => {
    expect(TIER_DEFINITIONS).toBeDefined()
    expect(TIER_DEFINITIONS.length).toBe(4)
    expect(TIER_DEFINITIONS[0].tier).toBe(3)
  })
})
