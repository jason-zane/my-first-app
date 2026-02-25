import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/site/reveal'

export const metadata: Metadata = {
  title: 'The Experience — Miles Between',
  description:
    'What a Miles Between retreat actually feels like. The running, the food, the people, the rest.',
}

const PILLARS = [
  {
    num: '01',
    title: 'The Running',
    body: 'Every run is guided, every group is paced. You choose your distance and your pace — there are no race bibs, no timers, no pressure. Just you, excellent terrain, and people who get it. We run in the morning, before the day has warmed up, and return to a breakfast worth coming back for.',
    img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=1200&q=80',
    alt: 'Runner on a trail through bushland',
  },
  {
    num: '02',
    title: 'The Table',
    body: "Meals are long, communal, and genuinely good. We don't do conference-centre catering. Every dinner is a shared table — the kind where nobody checks their phone and the conversation keeps going long after the plates are cleared. We cater for your dietary needs and we take the food seriously.",
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Long dinner table set for a communal meal',
  },
  {
    num: '03',
    title: 'The Company',
    body: "We cap every retreat at 12 guests. That's deliberate. At 12 people, you actually get to know everyone. By Sunday, the group chat has already started. The people you meet on a Miles Between retreat tend to feel like people you were always going to meet.",
    img: 'https://images.unsplash.com/photo-1688079393240-f9f927562d25?auto=format&fit=crop&w=1200&q=80',
    alt: 'Two runners on a trail together',
  },
  {
    num: '04',
    title: 'The Rest',
    body: "Recovery is built into the programme, not bolted on as an afterthought. Long afternoons with nothing required of you. A heated pool. A spa. Gardens worth wandering. The retreat is designed to leave you feeling restored — which means the schedule has space in it.",
    img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Pool at a country estate',
  },
]

const PROGRAMME = [
  {
    day: 'Thursday',
    events: [
      { time: '9:00 am', label: 'Coach departs Sydney CBD' },
      { time: '12:00 pm', label: 'Arrive at the estate, settle in, lunch' },
      { time: '3:00 pm', label: 'Meet & Greet — first introductions over coffee' },
      { time: '6:00 pm', label: 'Welcome dinner — long table, family style' },
      { time: '8:30 pm', label: 'Sunset walk through the gardens' },
    ],
  },
  {
    day: 'Friday',
    events: [
      { time: '6:00 am', label: 'Pre-run coffee, then morning run (guided, paced groups)' },
      { time: '8:30 am', label: 'Return to estate, showers, full breakfast' },
      { time: '9:30 am', label: 'Running brand session — kit, gear, what actually matters' },
      { time: '12:00 pm', label: 'Lunch' },
      { time: '3:00 pm', label: 'Free afternoon — pool, spa, gardens, tennis' },
      { time: '6:00 pm', label: 'Dinner with nutrition session — eating for running and enjoyment' },
    ],
  },
  {
    day: 'Saturday',
    events: [
      { time: '6:00 am', label: 'Pre-run coffee, then long run (guided, your distance)' },
      { time: '9:00 am', label: 'Guest-led session — special run or talk with a guest' },
      { time: '11:30 am', label: 'Late brunch' },
      { time: '3:00 pm', label: 'Free afternoon — pool, spa, rest, games' },
      { time: '6:00 pm', label: 'Pizza night — casual dinner, long evening' },
    ],
  },
  {
    day: 'Sunday',
    events: [
      { time: '6:00 am', label: 'Optional sunrise run — easy, social pace' },
      { time: '8:00 am', label: 'Farewell breakfast' },
      { time: '9:30 am', label: '"I want to do this again" — closing session, reflections' },
      { time: '12:00 pm', label: 'Farewell lunch' },
      { time: '3:00 pm', label: 'Coach departs for Sydney' },
    ],
  },
]

export default function ExperiencePage() {
  return (
    <div className="bg-[#FAF8F4] text-stone-900">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] pt-40 pb-24 md:pt-52 md:pb-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal delay={0.1}>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[#7A9E8E]">
              The Experience
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <h1 className="mb-8 font-serif text-5xl font-bold leading-[1.05] text-[#FAF8F4] md:text-7xl">
              What it actually
              <br />
              <span className="italic">feels like.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.35}>
            <p className="max-w-xl text-lg leading-relaxed text-[#A8C4B8]">
              Three nights. Three runs. More meals than you can finish. People worth knowing. This
              is what a Miles Between retreat is made of.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FOUR PILLARS ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mb-20">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                What we get right
              </p>
              <h2 className="font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                Four things we never compromise on.
              </h2>
            </div>
          </Reveal>

          <div className="space-y-24 md:space-y-32">
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.num} delay={0.1}>
                <div
                  className={`grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24`}
                >
                  <div className={i % 2 === 1 ? 'order-1 lg:order-2' : ''}>
                    <p className="mb-4 text-xs font-medium tracking-[0.25em] text-stone-400">
                      {pillar.num}
                    </p>
                    <h2 className="mb-6 font-serif text-3xl font-bold text-stone-900 md:text-4xl">
                      {pillar.title}
                    </h2>
                    <p className="text-lg leading-relaxed text-stone-600">{pillar.body}</p>
                  </div>
                  <div className={i % 2 === 1 ? 'order-2 lg:order-1' : ''}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
                      <Image
                        src={pillar.img}
                        alt={pillar.alt}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE PROGRAMME ─────────────────────────────────────────────────── */}
      <section className="bg-[#EDE8DF] py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mb-16">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">
                The Programme
              </p>
              <h2 className="font-serif text-4xl font-bold leading-[1.15] text-stone-900 md:text-5xl">
                Thursday to Sunday.
                <br />
                <span className="italic">Every hour considered.</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
                We start with a coach from Sydney on Thursday morning and wrap up Sunday afternoon.
                The programme is structured enough to feel curated, loose enough to feel like a
                holiday.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PROGRAMME.map((day, i) => (
              <Reveal key={day.day} delay={i * 0.1}>
                <div className={`p-8 ${i % 2 === 0 ? 'bg-stone-100' : 'bg-[#2C4A3E]/5'}`}>
                  <h3 className="mb-6 font-serif text-2xl font-bold text-stone-900">{day.day}</h3>
                  <div className="space-y-4">
                    {day.events.map((event) => (
                      <div key={event.label} className="flex gap-4">
                        <span className="w-20 shrink-0 pt-0.5 text-xs font-medium text-stone-400">
                          {event.time}
                        </span>
                        <span className="text-sm leading-relaxed text-stone-700">
                          {event.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <p className="mt-6 text-sm text-stone-500">
              Programme is indicative and may vary by retreat and location.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── NOT A TRAINING CAMP ───────────────────────────────────────────── */}
      <section className="bg-[#2C4A3E] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal>
              <div>
                <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-[#7A9E8E]">
                  Worth knowing
                </p>
                <h2 className="mb-8 font-serif text-4xl font-bold leading-[1.15] text-[#FAF8F4] md:text-5xl">
                  This is not a training camp.
                </h2>
                <p className="text-lg leading-relaxed text-[#A8C4B8]">
                  We don't track your splits. We don't give you race-prep advice. We don't do 5am
                  circuits. What we do is take the running seriously as an experience — the
                  terrain, the pacing, the routes — while leaving the competitive stuff at home.
                </p>
                <p className="mt-6 text-lg leading-relaxed text-[#A8C4B8]">
                  You should be comfortable running 10–15 km. Beyond that, we'd love to have you.
                </p>
              </div>
            </Reveal>
            <div className="space-y-6">
              {[
                {
                  q: 'What fitness level do I need?',
                  a: 'You should be comfortable running 10–15 km at a conversational pace. We have two paced groups on every run, so the exact distance and speed is always flexible.',
                },
                {
                  q: 'Can I come on my own?',
                  a: 'Most guests do. The small group format means you quickly feel at home — and the people you meet tend to become people you stay in touch with.',
                },
                {
                  q: 'What if I need to skip a run?',
                  a: 'No problem. The estate has plenty to enjoy without the runs. Every session is optional, and nobody will make you feel guilty for choosing the spa.',
                },
              ].map((item, i) => (
                <Reveal key={item.q} delay={i * 0.1}>
                  <div className="border-t border-[#FAF8F4]/10 pt-6">
                    <p className="mb-2 font-medium text-[#FAF8F4]">{item.q}</p>
                    <p className="text-sm leading-relaxed text-[#A8C4B8]">{item.a}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#FAF8F4] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <Reveal>
            <div className="mx-auto max-w-xl text-center">
              <h2 className="mb-6 font-serif text-4xl font-bold text-stone-900">
                Ready to see what's on?
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-stone-600">
                Our first retreat is in the Southern Highlands, September 2026. Places are limited.
              </p>
              <Link
                href="/retreats"
                className="inline-block bg-[#2C4A3E] px-8 py-4 text-sm font-medium text-[#FAF8F4] transition-colors hover:bg-[#1E3530]"
              >
                View Retreats
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
