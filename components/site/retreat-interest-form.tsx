'use client'

import { useState } from 'react'

const RUNNING_BACKGROUNDS = [
  { value: 'casual', label: 'Casual', description: 'I run for enjoyment, a few times a month' },
  {
    value: 'regular',
    label: 'Regular',
    description: 'I run 3+ times a week and comfortable with distance',
  },
  {
    value: 'experienced',
    label: 'Experienced',
    description: "I've run events — half marathons, trail races, etc.",
  },
]

const SOURCE_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'friend', label: 'A friend or colleague' },
  { value: 'running-club', label: 'Running club' },
  { value: 'google', label: 'Google search' },
  { value: 'podcast', label: 'Podcast or newsletter' },
  { value: 'other', label: 'Other' },
]

type Props = {
  retreatSlug: string
  retreatName: string
}

export function RetreatInterestForm({ retreatSlug, retreatName }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [runningBackground, setRunningBackground] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    const form = e.currentTarget
    const data = new FormData(form)

    const firstName = String(data.get('firstName') ?? '').trim()
    const lastName = String(data.get('lastName') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const city = String(data.get('city') ?? '').trim()
    const dietary = String(data.get('dietary') ?? '').trim()
    const questions = String(data.get('questions') ?? '').trim()
    const source = String(data.get('source') ?? '').trim()

    const backgroundLabel =
      RUNNING_BACKGROUNDS.find((b) => b.value === runningBackground)?.label ?? runningBackground

    // Format extra fields as notes for the notification email
    const notesParts = [
      `Retreat: ${retreatName}`,
      city ? `City/Suburb: ${city}` : null,
      runningBackground ? `Running background: ${backgroundLabel}` : null,
      dietary ? `Dietary: ${dietary}` : null,
      questions ? `Notes: ${questions}` : null,
    ].filter(Boolean)

    const formData = new FormData()
    formData.set('firstName', firstName)
    formData.set('lastName', lastName)
    formData.set('email', email)
    formData.set('source', source || `retreat:${retreatSlug}`)
    formData.set('notes', notesParts.join('\n'))

    try {
      const response = await fetch('/api/register-interest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Unable to submit right now.')
      }

      setSubmitted(true)
      form.reset()
      setRunningBackground('')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 font-serif text-3xl font-bold text-stone-900">Thank you.</p>
        <p className="text-lg leading-relaxed text-stone-600">
          We'll be in touch as we finalise the retreat details.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-stone-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-stone-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="city" className="mb-2 block text-sm font-medium text-stone-700">
          City / Suburb
        </label>
        <input
          id="city"
          name="city"
          type="text"
          placeholder="e.g. Bondi Junction, Sydney"
          className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-stone-400">
          Helps us understand travel logistics for participants.
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-stone-700">Running background</p>
        <div className="space-y-2.5">
          {RUNNING_BACKGROUNDS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                runningBackground === option.value
                  ? 'border-[#2C4A3E] bg-[#2C4A3E]/5'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="runningBackground"
                value={option.value}
                checked={runningBackground === option.value}
                onChange={() => setRunningBackground(option.value)}
                className="mt-0.5 shrink-0 accent-[#2C4A3E]"
              />
              <div>
                <p className="text-sm font-medium text-stone-900">{option.label}</p>
                <p className="text-sm text-stone-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="dietary" className="mb-2 block text-sm font-medium text-stone-700">
          Dietary requirements
        </label>
        <input
          id="dietary"
          name="dietary"
          type="text"
          placeholder="Any allergies, intolerances or preferences"
          className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="questions" className="mb-2 block text-sm font-medium text-stone-700">
          Questions or notes
        </label>
        <textarea
          id="questions"
          name="questions"
          rows={3}
          placeholder="Anything you'd like us to know"
          className="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="source" className="mb-2 block text-sm font-medium text-stone-700">
          How did you hear about us?
        </label>
        <div className="relative">
          <select
            id="source"
            name="source"
            className="w-full appearance-none border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
          >
            <option value="">Select an option</option>
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg
              className="h-4 w-4 text-stone-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {submitError && (
        <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#2C4A3E] py-4 text-sm font-medium text-[#FAF8F4] transition-colors hover:bg-[#1E3530] disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : 'Register My Interest'}
      </button>

      <p className="text-center text-xs text-stone-400">
        No spam. We'll only contact you with meaningful updates about this retreat.
      </p>
    </form>
  )
}
