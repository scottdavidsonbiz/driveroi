import { describe, it, expect } from 'vitest'
import { classifyHookStyle, isLinkedInUrl } from '../hook-classifier'

describe('isLinkedInUrl', () => {
  it('detects LinkedIn post URLs', () => {
    expect(isLinkedInUrl('https://www.linkedin.com/feed/update/urn:li:activity:123')).toBe(true)
  })

  it('returns false for regular text', () => {
    expect(isLinkedInUrl('Companies are racing to capture employee knowledge')).toBe(false)
  })

  it('returns false for null/empty', () => {
    expect(isLinkedInUrl(null)).toBe(false)
    expect(isLinkedInUrl('')).toBe(false)
  })
})

describe('classifyHookStyle', () => {
  it('classifies question-list format', () => {
    const text = 'Can you answer these about your business right now?\n1. Do you know your CAC?\n2. What is your pipeline velocity?'
    expect(classifyHookStyle(text)).toBe('question-list')
  })

  it('classifies contrarian hooks', () => {
    expect(classifyHookStyle('Most people think cold email is dead. Actually, they are wrong.')).toBe('contrarian')
    expect(classifyHookStyle('Stop sending cold emails without a signal layer.')).toBe('contrarian')
  })

  it('classifies data-led hooks', () => {
    expect(classifyHookStyle('We sent 2,106 emails across 9 campaigns.')).toBe('data-led')
    expect(classifyHookStyle('$120/hr is the rate for white-label Clay work.')).toBe('data-led')
    expect(classifyHookStyle('85% of their pipeline comes from marketing.')).toBe('data-led')
  })

  it('classifies story hooks', () => {
    expect(classifyHookStyle('Last week I sat down with a CRO who had just raised Series A.')).toBe('story')
    expect(classifyHookStyle('We spent 3 months building outbound for an oilfield services company.')).toBe('story')
  })

  it('classifies observation hooks', () => {
    expect(classifyHookStyle('Most companies I talk to have no idea what their pipeline velocity is.')).toBe('observation')
    expect(classifyHookStyle('Every time I audit a GTM stack, the same pattern shows up.')).toBe('observation')
  })

  it('falls back to direct for unrecognized patterns', () => {
    expect(classifyHookStyle('Build your GTM infrastructure before you hire salespeople.')).toBe('direct')
  })

  it('returns null for null/empty text', () => {
    expect(classifyHookStyle(null)).toBeNull()
    expect(classifyHookStyle('')).toBeNull()
  })

  it('returns null for LinkedIn URLs', () => {
    expect(classifyHookStyle('https://www.linkedin.com/feed/update/urn:li:activity:123')).toBeNull()
  })
})
