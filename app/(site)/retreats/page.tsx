import Link from 'next/link'
import Image from 'next/image'
import { retreats } from '@/lib/retreats'
import { Reveal } from '@/components/site/reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Retreats — Miles Between',
  description:
    'Running retreats for people who love the journey. Explore upcoming retreats from Miles Between.',
}

const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Coming Soon',
  open: 'Registrations Open',
  'sold-out': 'Sold Out',
}

const STATUS_COLOR: Record<string, string> = {
  upcoming: 'bg-amber-100 text-amber-800',
  open: 'bg-green-100 text-green-800',
  'sold-out': 'bg-stone-200 text-stone-600',
}

export default function RetreatsPage() {
  return (
    <div className="bg-[#FAF8F4] text-stone-900">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] pt-40 pb-24 md:pt-52 md:pb-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal delay={0.1}>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[#7A9E8E]">
              Retreats
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="font-serif text-5xl font-bold leading-[1.05] text-[#FAF8F4] md:text-7xl">
              Where will the
              <br />
              miles take you?
            </h1>
          </Reveal>
          <Reveal delay={0.35}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#A8C4B8]">
              Each retreat is built around a place worth travelling for. We're starting in Sydney's
              backyard — more locations to follow.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── RETREATS LIST ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {retreats.map((retreat, i) => (
              <Reveal key={retreat.slug} delay={i * 0.1}>
                <Link
                  href={`/retreats/${retreat.slug}`}
                  className="group flex flex-col overflow-hidden border border-stone-200 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="relative overflow-hidden">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={retreat.heroImage}
                        alt={retreat.heroImageAlt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[retreat.status] ?? ''}`}
                      >
                        {STATUS_LABEL[retreat.status]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                      {retreat.region} • {retreat.datesShort}
                    </p>
                    <h2 className="mb-3 font-serif text-2xl font-bold text-stone-900">
                      {retreat.name}
                    </h2>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-stone-600">
                      {retreat.description}
                    </p>
                    <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                      <div>
                        <p className="text-xs text-stone-400">From</p>
                        <p className="font-serif text-xl font-bold text-stone-900">
                          ${retreat.priceFrom.toLocaleString()}
                          <span className="text-sm font-normal text-stone-500"> pp</span>
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[#2C4A3E] group-hover:underline">
                        View retreat →
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GENERAL INTEREST ──────────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mx-auto max-w-xl text-center">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#7A9E8E]">
                Don't see your city?
              </p>
              <h2 className="mb-6 font-serif text-4xl font-bold text-[#FAF8F4]">
                We're coming to more places.
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-[#A8C4B8]">
                Tell us where you are and what matters to you. We'll be in touch when a retreat
                near you is planned.
              </p>
              <Link
                href="/#register"
                className="inline-block border border-[#FAF8F4]/60 px-8 py-4 text-sm font-medium text-[#FAF8F4] transition-colors hover:bg-[#FAF8F4] hover:text-[#2C4A3E]"
              >
                Join General Retreat List
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
