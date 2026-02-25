import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getRetreat } from '@/lib/retreats'
import { RegistrationForm } from '@/components/site/registration-form'
import { ParallaxHero } from '@/components/site/parallax-hero'
import { Reveal } from '@/components/site/reveal'
import { CountUp } from '@/components/site/count-up'
import { StickyRetreatCta } from '@/components/site/sticky-retreat-cta'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const retreat = getRetreat(slug)
  if (!retreat) return {}
  return {
    title: `${retreat.name} — Miles Between`,
    description: retreat.description,
  }
}

export default async function RetreatPage({ params }: Props) {
  const { slug } = await params
  const retreat = getRetreat(slug)
  if (!retreat) notFound()

  return (
    <div className="bg-[#FAF8F4] text-stone-900">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <ParallaxHero src={retreat.heroImage} alt={retreat.heroImageAlt} minHeight="min-h-[90vh]">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
          <Reveal delay={0.1}>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-stone-300">
              {retreat.region} • {retreat.datesShort}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="mb-5 font-serif text-5xl font-bold leading-[1.05] text-white md:text-7xl">
              {retreat.name}
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mb-8 text-lg text-stone-200 md:text-xl">{retreat.location}</p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/30 px-4 py-2 text-sm text-white/80">
                Limited to {retreat.capacity} guests
              </span>
              <span className="rounded-full border border-white/30 px-4 py-2 text-sm text-white/80">
                From ${retreat.priceFrom.toLocaleString()} pp
              </span>
              <span className="rounded-full border border-white/30 px-4 py-2 text-sm text-white/80">
                {retreat.dates}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.5}>
            <div className="mt-10">
              <a
                href="#register"
                className="inline-block bg-[#FAF8F4] px-8 py-4 text-sm font-medium text-[#2C4A3E] transition-colors hover:bg-white"
              >
                Apply for This Retreat
              </a>
            </div>
          </Reveal>
        </div>
      </ParallaxHero>

      {/* ── KEY FACTS ─────────────────────────────────────────────────────── */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-stone-200 md:grid-cols-4">
          <div className="px-6 py-6 md:px-10 md:py-8">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
              Duration
            </p>
            <p className="font-serif text-xl font-bold text-stone-900 md:text-2xl">
              <CountUp target={3} suffix=" nights" />
            </p>
          </div>
          <div className="px-6 py-6 md:px-10 md:py-8">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
              Guests
            </p>
            <p className="font-serif text-xl font-bold text-stone-900 md:text-2xl">
              Max <CountUp target={retreat.capacity} />
            </p>
          </div>
          <div className="px-6 py-6 md:px-10 md:py-8">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
              Guided runs
            </p>
            <p className="font-serif text-xl font-bold text-stone-900 md:text-2xl">
              <CountUp target={3} suffix=" runs" />
            </p>
          </div>
          <div className="px-6 py-6 md:px-10 md:py-8">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
              From Sydney
            </p>
            <p className="font-serif text-xl font-bold text-stone-900 md:text-2xl">
              {retreat.distanceFromCity.replace('~', '')}
            </p>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF8F4] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                The Retreat
              </p>
              <p className="font-serif text-3xl font-bold leading-[1.2] text-stone-900 md:text-4xl">
                {retreat.tagline}
              </p>
              <p className="mt-8 text-lg leading-relaxed text-stone-600">{retreat.description}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── THE VENUE ─────────────────────────────────────────────────────── */}
      <section className="bg-[#EDE8DF] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal delay={0.1}>
              <div>
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  Where you'll stay
                </p>
                <h2 className="mb-8 font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                  {retreat.venueName}
                </h2>
                <p className="mb-10 text-lg leading-relaxed text-stone-700">
                  {retreat.venueDescription}
                </p>
                <ul className="space-y-3">
                  {retreat.venueHighlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2C4A3E]" />
                      <span className="text-stone-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.05} y={32}>
              <div className="relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                  <Image
                    src={retreat.venueImage}
                    alt={retreat.venueImageAlt}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-5 -right-5 -z-10 h-32 w-32 rounded-sm bg-stone-300/40" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── THE RUNNING ───────────────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mb-16">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#7A9E8E]">
                What you'll run
              </p>
              <h2 className="font-serif text-4xl font-bold leading-[1.15] text-[#FAF8F4] md:text-5xl">
                Three routes. <span className="italic">Each one memorable.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {retreat.routes.map((route, i) => (
              <Reveal key={route.name} delay={i * 0.12}>
                <div className="border border-[#FAF8F4]/10 bg-[#FAF8F4]/5 p-8 transition-colors hover:bg-[#FAF8F4]/10">
                  <p className="mb-4 text-xs font-medium tracking-[0.2em] text-[#7A9E8E]">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mb-6 font-serif text-2xl font-bold text-[#FAF8F4]">
                    {route.name}
                  </h3>
                  <dl className="mb-6 space-y-2 text-sm">
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-[#7A9E8E]">Distance</dt>
                      <dd className="text-[#A8C4B8]">{route.distance}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-[#7A9E8E]">Terrain</dt>
                      <dd className="text-[#A8C4B8]">{route.terrain}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-24 shrink-0 text-[#7A9E8E]">Elevation</dt>
                      <dd className="text-[#A8C4B8]">{route.elevation}</dd>
                    </div>
                  </dl>
                  <p className="text-sm leading-relaxed text-[#A8C4B8]">{route.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ITINERARY ─────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF8F4] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mb-16">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                The Programme
              </p>
              <h2 className="font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                How the weekend <span className="italic">unfolds.</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-12 md:space-y-16">
            {retreat.itinerary.map((day, i) => (
              <Reveal key={day.day} delay={i * 0.08}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] md:gap-12">
                  <div className="md:pt-1">
                    <p className="font-serif text-2xl font-bold text-stone-900">{day.day}</p>
                    <p className="text-sm text-stone-400">{day.date}</p>
                  </div>
                  <div className="relative space-y-4 pl-6 before:absolute before:left-0 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-stone-200">
                    {day.events.map((event) => (
                      <div key={event.label} className="relative">
                        <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-[#2C4A3E]" />
                        <p className="mb-0.5 text-xs font-medium tracking-wide text-stone-400">
                          {event.time}
                        </p>
                        <p className="text-stone-700">{event.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── INCLUDED ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mb-16">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                Pricing
              </p>
              <h2 className="font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                What's included.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_340px] lg:gap-24">
            <Reveal delay={0.1}>
              <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                <div>
                  <p className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-[#2C4A3E]">
                    Included
                  </p>
                  <ul className="space-y-3">
                    {retreat.included.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-stone-700">
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0 text-[#2C4A3E]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-6 text-sm font-medium uppercase tracking-[0.15em] text-stone-400">
                    Not included
                  </p>
                  <ul className="space-y-3">
                    {retreat.notIncluded.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-stone-500">
                        <span className="mt-2 h-1 w-4 shrink-0 bg-stone-300" />
                        <span className="text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {/* Price card */}
            <Reveal delay={0.2}>
              <div className="h-fit border border-stone-200 bg-[#FAF8F4] p-8">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  From
                </p>
                <p className="mb-2 font-serif text-5xl font-bold text-stone-900">
                  $<CountUp target={retreat.priceFrom} duration={1600} />
                </p>
                <p className="mb-8 text-sm text-stone-500">per person</p>
                <div className="mb-6 space-y-2 text-sm text-stone-600">
                  <p>
                    <span className="font-medium">${retreat.deposit} deposit</span> to secure your
                    place.
                  </p>
                  <p>Full payment due 30 days before the retreat.</p>
                </div>
                <a
                  href="#register"
                  className="block w-full bg-[#2C4A3E] py-4 text-center text-sm font-medium text-[#FAF8F4] transition-colors hover:bg-[#1E3530]"
                >
                  Apply for This Retreat
                </a>
                <p className="mt-4 text-center text-xs text-stone-400">
                  Limited to {retreat.capacity} guests. No payment required to register interest.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── REGISTER INTEREST ─────────────────────────────────────────────── */}
      <section id="register" className="bg-[#EDE8DF] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal delay={0.1}>
              <div>
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  Apply
                </p>
                <h2 className="mb-6 font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                  Apply for your place.
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-stone-700">
                  Places are limited to {retreat.capacity} guests. Submit your details and we will
                  reach out with next steps. No payment is required at this stage.
                </p>
                <div className="space-y-4 border-t border-stone-300 pt-8">
                  {[
                    'Apply below in under a minute',
                    "We'll reach out to confirm your place",
                    `Secure your spot with a $${retreat.deposit} deposit`,
                  ].map((step, i) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2C4A3E] text-sm font-bold text-white">
                        {i + 1}
                      </div>
                      <p className="text-stone-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="bg-white p-8 md:p-10">
                <RegistrationForm
                  mode="retreat"
                  retreatSlug={retreat.slug}
                  retreatName={retreat.name}
                  source={`retreat:${retreat.slug}`}
                  submitCtaLabel="Apply for This Retreat in 60 Seconds"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── STICKY CTA ────────────────────────────────────────────────────── */}
      <StickyRetreatCta retreat={retreat} />
    </div>
  )
}
