'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ParallaxHero } from '@/components/site/parallax-hero'
import { Reveal } from '@/components/site/reveal'
import { Marquee } from '@/components/site/marquee'
import { RegistrationForm } from '@/components/site/registration-form'
import { trackSiteEvent } from '@/utils/analytics'

export default function Home() {
  return (
    <div className="bg-[#FAF8F4] text-stone-900">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <ParallaxHero
        src="https://images.unsplash.com/photo-1645238426817-8c3e7d1396cf?auto=format&fit=crop&w=2400&q=80"
        alt="Group of runners on an open road"
      >
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-stone-300"
            >
              Running Retreats
            </motion.p>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="mb-8 font-serif text-5xl font-bold leading-[1.05] text-white md:text-7xl lg:text-[5.5rem]"
              >
                Somewhere between
                <br />
                the miles, you find
                <br />
                <span className="italic">yourself.</span>
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="max-w-xl text-lg leading-relaxed text-stone-200 md:text-xl"
            >
              Escape the ordinary. Run through landscapes worth crossing the world for. Connect
              with people who understand — and rest in a way that actually restores you.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                href="/retreats"
                onClick={() => trackSiteEvent('cta_clicked', { cta_id: 'home_hero_view_retreats', page_type: 'home' })}
                className="bg-[#FAF8F4] px-8 py-4 text-sm font-medium text-[#2C4A3E] transition-colors hover:bg-white"
              >
                View Retreats
              </Link>
              <Link
                href="#register"
                onClick={() => trackSiteEvent('cta_clicked', { cta_id: 'home_hero_join_list', page_type: 'home' })}
                className="border border-white/60 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Join Retreat List
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 pt-2"
          >
            <div className="h-1.5 w-0.5 animate-bounce rounded-full bg-white/60" />
          </motion.div>
        </div>
      </ParallaxHero>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── WHAT IS MILES BETWEEN ─────────────────────────────────────────── */}
      <section className="bg-[#FAF8F4] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-28">
            <div>
              <Reveal delay={0.05}>
                <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  What is Miles Between
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <h2 className="mb-10 font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                  Running is part of
                  <br />
                  your life.{' '}
                  <span className="italic text-stone-600">Not all of it.</span>
                </h2>
              </Reveal>
              <div className="space-y-6 text-lg leading-relaxed text-stone-600">
                {[
                  'Miles Between is a retreat built for recreational runners who love the sport but have no interest in training camps, obsessive PB tracking, or six-hour briefings about lactate thresholds.',
                  "It's a few days in a beautiful place — with thoughtfully designed runs through exceptional terrain, genuinely excellent food, and evenings that make you feel grateful to be alive.",
                  "You'll run with people who look a lot like you: curious, active, busy with full lives — and very ready to switch off for a while.",
                ].map((text, i) => (
                  <Reveal key={i} delay={0.25 + i * 0.1}>
                    <p>{text}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1} y={32}>
              <div className="relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1652161413302-9b48a8c0f24a?auto=format&fit=crop&w=1200&q=80"
                    alt="Group of runners on a forest trail"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 -z-10 h-36 w-36 rounded-sm bg-stone-200" />
                <div className="absolute -right-5 -top-5 -z-10 h-24 w-24 rounded-sm bg-[#EDE8DF]" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── THE EXPERIENCE ────────────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-20">
            <Reveal delay={0.05}>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#7A9E8E]">
                The Experience
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <h2 className="font-serif max-w-lg text-4xl font-bold leading-[1.15] text-[#FAF8F4] md:text-5xl">
                Everything considered.
                <br />
                <span className="italic">Nothing unnecessary.</span>
              </h2>
            </Reveal>
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
                alt: 'Cosy cabin interior with warm lighting',
              },
            ].map((card, i) => (
              <Reveal key={card.num} delay={i * 0.12}>
                <div className="group flex flex-col">
                  <div className="mb-6 overflow-hidden rounded-sm">
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={card.img}
                        alt={card.alt}
                        fill
                        className="object-cover transition-all duration-700 ease-out grayscale group-hover:scale-[1.03] group-hover:grayscale-0"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  <p className="mb-3 text-xs font-medium tracking-[0.2em] text-[#7A9E8E]">
                    {card.num}
                  </p>
                  <h3 className="mb-4 font-serif text-2xl font-bold text-[#FAF8F4]">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#A8C4B8]">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────────────────────────────── */}
      <section className="bg-[#EDE8DF] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-28">
            <Reveal delay={0.05} y={32} className="order-2 lg:order-1">
              <div className="relative aspect-square w-full overflow-hidden rounded-sm">
                <Image
                  src="https://images.unsplash.com/photo-1533222481259-ce20eda1e20b?auto=format&fit=crop&w=1200&q=80"
                  alt="Runner laughing mid-run"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>

            <div className="order-1 lg:order-2">
              <Reveal delay={0.1}>
                <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  Who It&apos;s For
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <h2 className="mb-12 font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                  Running is part of
                  <br />
                  <span className="italic">how you see the world.</span>
                </h2>
              </Reveal>
              <ul className="space-y-7">
                {[
                  "Running matters to you — it's one of the ways you make sense of things, and you want to be around people who feel the same.",
                  "You're drawn to somewhere beautiful, where the running is woven into the experience — not the only thing on the agenda.",
                  'You care about the table as much as the trail. Good food, real conversation, the kind of evening that lingers.',
                  "You're looking for an escape that feels genuinely considered — and that leaves you restored, not just tired in a different place.",
                ].map((item, i) => (
                  <Reveal key={i} delay={0.3 + i * 0.1}>
                    <li className="flex items-start gap-5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2C4A3E]" />
                      <p className="text-lg leading-relaxed text-stone-700">{item}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FIRST RETREAT SPOTLIGHT ───────────────────────────────────────── */}
      <section className="bg-[#FAF8F4] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <Reveal delay={0.05}>
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                  First Retreat
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <h2 className="mb-4 font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                  The Southern Highlands
                </h2>
              </Reveal>
              <Reveal delay={0.25}>
                <p className="mb-8 text-sm font-medium tracking-wide text-[#2C4A3E]">
                  Bargo, NSW • 24–27 September 2026
                </p>
              </Reveal>
              <Reveal delay={0.35}>
                <p className="mb-10 text-lg leading-relaxed text-stone-600">
                  Three nights in an award-winning colonial estate at the foot of the Southern
                  Highlands escarpment. Three guided runs through Nattai National Park. From $5,899
                  per person.
                </p>
              </Reveal>
              <Reveal delay={0.4}>
                <Link
                  href="/retreats/sydney-southern-highlands"
                  className="inline-block bg-[#2C4A3E] px-8 py-4 text-sm font-medium text-[#FAF8F4] transition-colors hover:bg-[#1E3530]"
                >
                  View Retreat
                </Link>
              </Reveal>
            </div>

            <Reveal delay={0.1} y={32}>
              <div className="relative overflow-hidden">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"
                    alt="Southern Highlands landscape"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute bottom-6 left-6 border border-white/30 bg-black/40 px-5 py-3 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white">Limited to 12 guests</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── REGISTER INTEREST ─────────────────────────────────────────────── */}
      <section id="register" className="bg-[#FAF8F4] py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mx-auto mb-16 max-w-xl text-center">
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                Stay in the loop
              </p>
              <h2 className="mb-6 font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                Not near Sydney?
              </h2>
              <p className="text-lg leading-relaxed text-stone-600">
                We&apos;re planning retreats in more locations. Tell us where you are and we&apos;ll reach
                out when something near you is confirmed.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mx-auto max-w-xl bg-white p-8 md:p-10">
              <RegistrationForm
                mode="general"
                source="site:homepage_register"
                submitCtaLabel="Join Retreat List in 60 Seconds"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
