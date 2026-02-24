'use client'

import { Playfair_Display, Lora } from 'next/font/google'
import { useState, useEffect } from 'react'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

// ─── COLOUR PALETTE GUIDE ─────────────────────────────────────────────────────
// Version A (applied): Deep forest green #2C4A3E / Warm white #FAF8F4 / Linen #EDE8DF
// Version B:           Near-black stone-900 / Off-white #F5F2EB / Sage #6B7C5C (accent section)
// Version C:           Moss green #3D5A47 (Experience section only) / stone-50 light / amber-50 warm
//
// To switch versions: update the bg class on each section per the inline comments.
// ──────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/register-interest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Unable to submit right now.'
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        if (payload?.error) {
          errorMessage = payload.error
        }
        throw new Error(errorMessage)
      }

      setSubmitted(true)
      form.reset()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again in a moment.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // [PALETTE: page background] Version A: bg-[#FAF8F4] | Version B: bg-[#F5F2EB] | Version C: bg-stone-50
    <div className="bg-[#FAF8F4] text-stone-900">

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      {/* [PALETTE: nav scrolled bg] Version A: bg-[#2C4A3E]/95 | Version B: bg-[#F5F2EB]/95 | Version C: bg-stone-50/95 */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#2C4A3E]/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12">
          {/* [PALETTE: nav logo scrolled] Version A: text-[#FAF8F4] | Version B/C: text-stone-900 */}
          <span
            className={`${playfair.className} text-xl font-bold tracking-tight transition-colors duration-500 ${
              scrolled ? 'text-[#FAF8F4]' : 'text-white'
            }`}
          >
            Miles Between
          </span>
          {/* [PALETTE: nav button scrolled] Version A: border-[#FAF8F4]/60 text-[#FAF8F4] hover:bg-[#FAF8F4] hover:text-[#2C4A3E] | Version B/C: border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white */}
          <a
            href="#register"
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              scrolled
                ? 'border-[#FAF8F4]/60 text-[#FAF8F4] hover:bg-[#FAF8F4] hover:text-[#2C4A3E]'
                : 'border-white/80 text-white hover:bg-white hover:text-stone-900'
            }`}
          >
            Register Interest
          </a>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-end pb-24 md:pb-36">
        <img
          src="https://images.unsplash.com/photo-1645238426817-8c3e7d1396cf?auto=format&fit=crop&w=2400&q=80"
          alt="Group of runners on an open road"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/40 to-stone-900/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-stone-300">
              Running Retreats
            </p>
            <h1
              className={`${playfair.className} mb-8 text-5xl font-bold leading-[1.05] text-white md:text-7xl lg:text-[5.5rem]`}
            >
              Somewhere between
              <br />
              the miles, you find
              <br />
              <span className="italic">yourself.</span>
            </h1>
            <p
              className={`${lora.className} max-w-xl text-lg leading-relaxed text-stone-200 md:text-xl`}
            >
              Escape the ordinary. Run through landscapes worth crossing the
              world for. Connect with people who understand — and rest in a way
              that actually restores you.
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 pt-2">
            <div className="h-1.5 w-0.5 animate-bounce rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* ── WHAT IS MILES BETWEEN ─────────────────────────────────────────── */}
      {/* [PALETTE: light section bg] Version A: bg-[#FAF8F4] | Version B: bg-[#F5F2EB] | Version C: bg-stone-50 */}
      <section className="bg-[#FAF8F4] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-28">
            <div>
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                What is Miles Between
              </p>
              <h2
                className={`${playfair.className} mb-10 text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl`}
              >
                Running is part of
                <br />
                your life.{' '}
                <span className="italic text-stone-600">Not all of it.</span>
              </h2>
              <div
                className={`${lora.className} space-y-6 text-lg leading-relaxed text-stone-600`}
              >
                <p>
                  Miles Between is a retreat built for recreational runners who
                  love the sport but have no interest in training camps, obsessive
                  PB tracking, or six-hour briefings about lactate thresholds.
                </p>
                <p>
                  It's a few days in a beautiful place — with thoughtfully
                  designed runs through exceptional terrain, genuinely excellent
                  food, and evenings that make you feel grateful to be alive.
                </p>
                <p>
                  You'll run with people who look a lot like you: curious, active,
                  busy with full lives — and very ready to switch off for a while.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1652161413302-9b48a8c0f24a?auto=format&fit=crop&w=1200&q=80"
                alt="Group of runners on a forest trail"
                className="w-full rounded-sm object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-5 -left-5 -z-10 h-36 w-36 rounded-sm bg-stone-200" />
              {/* [PALETTE: decorative block] Version A: bg-[#EDE8DF] | Version B: bg-stone-200 | Version C: bg-amber-100 */}
              <div className="absolute -right-5 -top-5 -z-10 h-24 w-24 rounded-sm bg-[#EDE8DF]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE EXPERIENCE ────────────────────────────────────────────────── */}
      {/* [PALETTE: dark section bg] Version A: bg-[#2C4A3E] | Version B: bg-stone-900 | Version C: bg-[#3D5A47] */}
      <section className="bg-[#2C4A3E] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-20 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              {/* [PALETTE: dark section eyebrow] Version A: text-[#7A9E8E] | Version B: text-stone-500 | Version C: text-[#8AB09A] */}
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#7A9E8E]">
                The Experience
              </p>
              {/* [PALETTE: dark section heading] Version A: text-[#FAF8F4] | Version B: text-stone-50 | Version C: text-stone-50 */}
              <h2
                className={`${playfair.className} max-w-lg text-4xl font-bold leading-[1.15] text-[#FAF8F4] md:text-5xl`}
              >
                Everything considered.
                <br />
                <span className="italic">Nothing unnecessary.</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Stunning Locations',
                body: "Each retreat is set in a landscape worth travelling for. We scout routes that are genuinely breathtaking — the kind you'd seek out yourself if you had the time and the local knowledge.",
                img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80',
                alt: 'Dramatic mountain landscape at dawn',
              },
              {
                num: '02',
                title: 'Real Community',
                body: "Small groups, unhurried pace, shared tables. You'll run alongside people who balance ambition and enjoyment the same way you do — and leave with more than just miles in the bank.",
                img: 'https://images.unsplash.com/photo-1688079393240-f9f927562d25?auto=format&fit=crop&w=900&q=80',
                alt: 'Two runners side by side on a trail',
              },
              {
                num: '03',
                title: 'Luxury & Comfort',
                body: "The accommodation is carefully chosen, the food is exceptional, and the evenings are unscheduled. Rest is built into the programme. You'll return home feeling genuinely restored.",
                img: 'https://images.unsplash.com/photo-1698933787104-3f91cf25909c?auto=format&fit=crop&w=900&q=80',
                alt: 'Cosy cabin interior with wood burning stove',
              },
            ].map((card) => (
              <div key={card.num} className="group flex flex-col">
                <div className="mb-6 overflow-hidden rounded-sm">
                  <img
                    src={card.img}
                    alt={card.alt}
                    className="aspect-[3/4] w-full object-cover transition-all duration-700 ease-out grayscale group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                {/* [PALETTE: card number] Version A: text-[#7A9E8E] | Version B: text-stone-600 | Version C: text-[#8AB09A] */}
                <p className="mb-3 text-xs font-medium tracking-[0.2em] text-[#7A9E8E]">
                  {card.num}
                </p>
                {/* [PALETTE: card heading] Version A: text-[#FAF8F4] | Version B: text-stone-50 | Version C: text-stone-50 */}
                <h3
                  className={`${playfair.className} mb-4 text-2xl font-bold text-[#FAF8F4]`}
                >
                  {card.title}
                </h3>
                {/* [PALETTE: card body] Version A: text-[#A8C4B8] | Version B: text-stone-400 | Version C: text-[#A8C4B8] */}
                <p className={`${lora.className} text-sm leading-relaxed text-[#A8C4B8]`}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────────────────────────────── */}
      {/* [PALETTE: warm accent section bg] Version A: bg-[#EDE8DF] | Version B: bg-[#6B7C5C] | Version C: bg-amber-50 */}
      <section className="bg-[#EDE8DF] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-28">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1533222481259-ce20eda1e20b?auto=format&fit=crop&w=1200&q=80"
                alt="Runner laughing mid-run"
                className="aspect-square w-full rounded-sm object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              {/* [PALETTE: who it's for eyebrow] Version A: text-stone-400 | Version B: text-[#C5D4BC] | Version C: text-stone-400 */}
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                Who It's For
              </p>
              {/* [PALETTE: who it's for heading] Version A: text-stone-900 | Version B: text-stone-50 | Version C: text-stone-900 */}
              <h2
                className={`${playfair.className} mb-12 text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl`}
              >
                Running is part of
                <br />
                <span className="italic">how you see the world.</span>
              </h2>

              <ul className="space-y-7">
                {[
                  "Running matters to you — it's one of the ways you make sense of things, and you want to be around people who feel the same.",
                  "You're drawn to somewhere beautiful, where the running is woven into the experience — not the only thing on the agenda.",
                  "You care about the table as much as the trail. Good food, real conversation, the kind of evening that lingers.",
                  "You're looking for an escape that feels genuinely considered — and that leaves you restored, not just tired in a different place.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-5">
                    {/* [PALETTE: bullet marker] Version A: bg-[#2C4A3E] | Version B: bg-stone-200 | Version C: bg-stone-700 */}
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2C4A3E]" />
                    {/* [PALETTE: bullet text] Version A: text-stone-700 | Version B: text-stone-100 | Version C: text-stone-700 */}
                    <p className={`${lora.className} text-lg leading-relaxed text-stone-700`}>
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── REGISTER INTEREST ─────────────────────────────────────────────── */}
      {/* [PALETTE: light section bg] Version A: bg-[#FAF8F4] | Version B: bg-[#F5F2EB] | Version C: bg-stone-50 */}
      <section id="register" className="bg-[#FAF8F4] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
              Register Interest
            </p>
            <h2
              className={`${playfair.className} mb-6 text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl`}
            >
              Be the first to know.
            </h2>
            <p className={`${lora.className} text-lg leading-relaxed text-stone-600`}>
              We're building our first retreats now. Register your interest and
              we'll reach out when dates and locations are confirmed.
            </p>
          </div>

          {submitted ? (
            <div className="mx-auto max-w-md py-16 text-center">
              <p
                className={`${playfair.className} mb-4 text-3xl font-bold text-stone-900`}
              >
                Thank you.
              </p>
              <p className={`${lora.className} text-lg leading-relaxed text-stone-600`}>
                We'll be in touch when something worth telling you about is ready.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    First Name
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
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    Last Name
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
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Email
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
                <label
                  htmlFor="source"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  How did you hear about us?
                </label>
                <div className="relative">
                  <select
                    id="source"
                    name="source"
                    className="w-full appearance-none border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 transition-colors focus:border-[#2C4A3E] focus:outline-none"
                  >
                    <option value="">Select an option</option>
                    <option value="instagram">Instagram</option>
                    <option value="friend">A friend or colleague</option>
                    <option value="running-club">Running club</option>
                    <option value="google">Google search</option>
                    <option value="podcast">Podcast or newsletter</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg
                      className="h-4 w-4 text-stone-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* [PALETTE: submit button] Version A: bg-[#2C4A3E] hover:bg-[#1E3530] text-[#FAF8F4] | Version B/C: bg-stone-900 hover:bg-stone-700 text-white */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 w-full bg-[#2C4A3E] py-4 text-sm font-medium text-[#FAF8F4] transition-colors duration-200 hover:bg-[#1E3530]"
              >
                {isSubmitting ? 'Submitting...' : 'Register My Interest'}
              </button>

              {submitError ? (
                <p className="text-center text-sm text-red-700">{submitError}</p>
              ) : null}

              <p className="text-center text-xs text-stone-400">
                No spam. We'll only contact you with meaningful updates.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      {/* [PALETTE: footer bg] Version A: bg-[#2C4A3E] | Version B: bg-stone-900 | Version C: bg-stone-900 */}
      <footer className="bg-[#2C4A3E] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center md:px-12">
          {/* [PALETTE: footer brand] Version A: text-[#FAF8F4] | Version B/C: text-stone-50 */}
          <p
            className={`${playfair.className} mb-3 text-2xl font-bold text-[#FAF8F4]`}
          >
            Miles Between
          </p>
          {/* [PALETTE: footer tagline] Version A: text-[#7A9E8E] | Version B: text-stone-500 | Version C: text-stone-500 */}
          <p className="text-sm tracking-wide text-[#7A9E8E]">
            Running retreats for people who love the journey.
          </p>
        </div>
      </footer>
    </div>
  )
}
