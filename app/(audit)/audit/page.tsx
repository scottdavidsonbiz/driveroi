'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CATEGORIES } from '@/lib/audit/questions'
import {
  scoreAudit,
  getTierColor,
  getCategoryTierColor,
  getCategoryTierLabel,
  type AuditResult,
} from '@/lib/audit/scoring'

type Phase = 'questions' | 'gate' | 'results'

export default function AuditPage() {
  const [phase, setPhase] = useState<Phase>('questions')
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)

  const currentCategory = CATEGORIES[categoryIndex]
  const allQuestionsAnswered = currentCategory?.questions.every(
    (q) => answers[q.id] !== undefined
  )

  function handleAnswer(questionId: string, score: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: score }))
  }

  function handleNext() {
    if (categoryIndex < CATEGORIES.length - 1) {
      setCategoryIndex((i) => i + 1)
    } else {
      setPhase('gate')
    }
  }

  function handleBack() {
    if (categoryIndex > 0) {
      setCategoryIndex((i) => i - 1)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const auditResult = scoreAudit(answers)

    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, answers }),
      })
    } catch {
      // Non-blocking — show results even if save fails
      console.error('Failed to save audit submission')
    }

    setResult(auditResult)
    setPhase('results')
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo-dark.png"
            alt="DriveROI"
            width={160}
            height={40}
            priority
          />
        </div>
        {phase === 'results' ? (
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Your GTM Readiness Score
          </h1>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              GTM Readiness Audit
            </h1>
            <p className="mt-2 text-muted-foreground">
              Score your go-to-market infrastructure in 3 minutes.
            </p>
          </>
        )}
      </div>

      {/* Questions Phase */}
      {phase === 'questions' && currentCategory && (
        <div>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">
                Category {categoryIndex + 1} of {CATEGORIES.length}
              </span>
              <span className="text-muted-foreground">
                {currentCategory.name}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: '#8B5CF6',
                  width: `${((categoryIndex + 1) / CATEGORIES.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Category header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold">{currentCategory.name}</h2>
            <p className="text-sm text-muted-foreground">
              {currentCategory.description}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentCategory.questions.map((question) => (
              <div key={question.id}>
                <p className="mb-3 font-medium">{question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = answers[question.id] === option.score
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleAnswer(question.id, option.score)}
                        className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition-all ${
                          isSelected
                            ? 'border-border hover:bg-muted/50'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        style={
                          isSelected
                            ? { borderColor: '#8B5CF6', backgroundColor: '#F5F3FF', color: '#3B0764' }
                            : undefined
                        }
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {categoryIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!allQuestionsAnswered}
              className="ml-auto rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              {categoryIndex < CATEGORIES.length - 1
                ? 'Next Category'
                : 'See My Results'}
            </button>
          </div>
        </div>
      )}

      {/* Gate Phase */}
      {phase === 'gate' && (
        <div className="rounded-xl border bg-card p-6 sm:p-8">
          <h2 className="mb-2 text-lg font-semibold">
            Almost there — where should we send your results?
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Get your personalized score breakdown and recommendations.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="mb-1.5 block text-sm font-medium"
              >
                Company{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your company"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPhase('questions')
                  setCategoryIndex(CATEGORIES.length - 1)
                }}
                className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting || !name || !email}
                className="ml-auto rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                {submitting ? 'Calculating...' : 'Get My Score'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && result && (
        <div className="space-y-6">
          {/* Score circle */}
          <div className="flex flex-col items-center rounded-xl border bg-card p-8">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-full border-4"
              style={{ borderColor: getTierColor(result.tier) }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold">{result.totalScore}</div>
                <div className="text-sm text-muted-foreground">
                  out of {result.maxScore}
                </div>
              </div>
            </div>
            <div
              className="mt-4 rounded-full px-4 py-1 text-sm font-semibold text-white"
              style={{ backgroundColor: getTierColor(result.tier) }}
            >
              {result.tierLabel}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 font-semibold">Category Breakdown</h3>
            <div className="space-y-4">
              {result.categoryScores.map((cs) => (
                <div key={cs.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{cs.name}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: getCategoryTierColor(cs.tier) }}
                    >
                      {cs.score}/{cs.maxScore} — {getCategoryTierLabel(cs.tier)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(cs.score / cs.maxScore) * 100}%`,
                        backgroundColor: getCategoryTierColor(cs.tier),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-semibold">
                Top Recommendations
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
                  >
                    <span className="mr-2 font-semibold">{i + 1}.</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div
            className="rounded-xl p-6 text-center text-white sm:p-8"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            <h3 className="text-lg font-semibold sm:text-xl">
              Want help closing these gaps?
            </h3>
            <p className="mt-2 text-sm" style={{ color: '#E9E5FF' }}>
              Book a free 30-minute GTM strategy call. We&apos;ll walk through
              your results and map out a plan.
            </p>
            <a
              href="https://cal.com/driveroi/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ color: '#6D28D9' }}
            >
              Book a Strategy Call
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
