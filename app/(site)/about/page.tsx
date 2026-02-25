import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/site/reveal'

export const metadata: Metadata = {
  title: 'About — Miles Between',
  description:
    'Miles Between is a running retreat for people who love the sport but want more from it than training data.',
}

const VALUES = [
  {
    title: 'Running is a way of seeing',
    body: "There's a particular kind of clarity that comes from an hour on a good trail. We build retreats around that feeling — not around performance metrics or race targets.",
  },
  {
    title: 'Rest is not a reward',
    body: "Recovery isn't what you do after the running. It's woven through the whole programme. Long afternoons. Good food. Evenings with no agenda. A spa that actually gets used.",
  },
  {
    title: 'Small is intentional',
    body: "We cap every retreat at 12 guests. You can't have a meaningful experience in a group of 40. At 12, you get to know everyone. The conversations are different.",
  },
  {
    title: 'The place matters',
    body: "We don't just find a nice venue with a lawn. We start with the running terrain — the landscape, the trails, the light at 7am — and build the retreat around it.",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F4] text-stone-900">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] pt-40 pb-24 md:pt-52 md:pb-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal delay={0.1}>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[#7A9E8E]">
              About
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="mb-8 font-serif text-5xl font-bold leading-[1.05] text-[#FAF8F4] md:text-7xl">
              Why we built
              <br />
              <span className="italic">Miles Between.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ── ORIGIN ────────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-28">
            <Reveal delay={0.1}>
              <div>
                <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  The story
                </p>
                <h2 className="font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                  We looked for this retreat. It didn't exist.
                </h2>
              </div>
            </Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-stone-600">
              {[
                'Running retreats existed, but they were built for a different kind of runner. Training camps for people chasing PBs. VO2 max workshops. Race-specific programmes. All of it designed for someone obsessively optimising their performance.',
                "That's not most runners. Most runners run because they love it — the meditative rhythm of it, the way it makes you feel in your body, the simple pleasure of going somewhere on your own two feet. They have full lives, and running is part of how they make sense of those lives.",
                'We built Miles Between for that runner. Someone who trains consistently and cares about the experience of running — but has no interest in turning a long weekend into a data collection exercise.',
                "The retreats are designed around three things: exceptional running terrain, genuine rest and restoration, and the kind of company that makes you feel like you've been missing something.",
              ].map((text, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE BELIEVE ───────────────────────────────────────────────── */}
      <section className="bg-[#EDE8DF] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mb-16">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                What we believe
              </p>
              <h2 className="font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                Four things we're sure about.
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {VALUES.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.1}>
                <div className="border-t-2 border-[#2C4A3E] pt-8">
                  <p className="mb-3 text-xs font-medium tracking-[0.2em] text-stone-400">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mb-4 font-serif text-2xl font-bold text-stone-900">
                    {value.title}
                  </h3>
                  <p className="leading-relaxed text-stone-600">{value.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE ────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF8F4] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-28">
            <Reveal delay={0.05} y={32}>
              <div className="relative aspect-square w-full overflow-hidden rounded-sm">
                <Image
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
                  alt="Group of friends running together"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>
            <div>
              <Reveal delay={0.1}>
                <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  Who we are
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <h2 className="mb-8 font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                  A small team of runners who wanted to do this properly.
                </h2>
              </Reveal>
              <div className="space-y-5 text-lg leading-relaxed text-stone-600">
                {[
                  "We're based in Sydney. We run most mornings, have all turned down at least one marathon training plan, and have a genuine obsession with finding places worth running in.",
                  "We started in Sydney's backyard — the Southern Highlands, the escarpment, the national parks you probably drove past on the highway without knowing what was in there. More locations are coming.",
                  "We keep the groups small because we've been to the retreats that weren't. We take the food seriously because we've eaten the food that wasn't. And we build the programme around the running because that's why you're here.",
                ].map((text, i) => (
                  <Reveal key={i} delay={0.3 + i * 0.1}>
                    <p>{text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <Reveal>
            <p className="font-serif text-2xl font-bold leading-relaxed text-[#FAF8F4] md:text-3xl">
              "You don't need to be training for anything. You just need to love running, and want
              to be somewhere worth running."
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF8F4] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mx-auto max-w-xl text-center">
              <h2 className="mb-6 font-serif text-4xl font-bold text-stone-900">
                Come and see for yourself.
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-stone-600">
                Our first retreat is in the Southern Highlands, September 2026. Limited to 12
                guests.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/retreats/sydney-southern-highlands"
                  className="inline-block bg-[#2C4A3E] px-8 py-4 text-sm font-medium text-[#FAF8F4] transition-colors hover:bg-[#1E3530]"
                >
                  View the Retreat
                </Link>
                <Link
                  href="/experience"
                  className="inline-block border border-stone-300 px-8 py-4 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400"
                >
                  What to Expect
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
