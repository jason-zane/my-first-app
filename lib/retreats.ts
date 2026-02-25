export type Route = {
  name: string
  distance: string
  terrain: string
  elevation: string
  description: string
}

export type ItineraryEvent = {
  time: string
  label: string
}

export type ItineraryDay = {
  day: string
  date: string
  events: ItineraryEvent[]
}

export type Retreat = {
  slug: string
  name: string
  tagline: string
  location: string
  region: string
  distanceFromCity: string
  dates: string
  datesShort: string
  capacity: number
  priceFrom: number
  deposit: number
  heroImage: string
  heroImageAlt: string
  venueImage: string
  venueImageAlt: string
  description: string
  venueName: string
  venueDescription: string
  venueHighlights: string[]
  routes: Route[]
  itinerary: ItineraryDay[]
  included: string[]
  notIncluded: string[]
  status: 'upcoming' | 'open' | 'sold-out'
}

export const retreats: Retreat[] = [
  {
    slug: 'sydney-southern-highlands',
    name: 'The Southern Highlands',
    tagline: '90 minutes from Sydney. A world away from it.',
    location: 'Bargo, NSW',
    region: 'Southern Highlands',
    distanceFromCity: '~90 min drive from Sydney CBD',
    dates: '24–27 September 2026',
    datesShort: 'September 2026',
    capacity: 12,
    priceFrom: 5899,
    deposit: 500,
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80',
    heroImageAlt: 'Dramatic highland landscape at dawn',
    venueImage:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    venueImageAlt: 'Country estate exterior with gardens',
    description:
      'Three nights in an award-winning colonial estate at the foot of the Southern Highlands escarpment. Three guided runs through Nattai National Park. Exceptional food, a heated pool, and the kind of evenings that make you glad you came.',
    venueName: 'Kalinya Estate',
    venueDescription:
      "An extraordinary colonial homestead set across 6 acres of award-winning gardens in Bargo, NSW. Kalinya is the exclusive preserve of your group for the full three nights — two buildings, The Homestead and The Lodge, sleeping 12 guests in private rooms. Wander the gardens, swim in the 17-metre heated pool, or ease into the therapeutic spa after a long run. The estate sits at the edge of Nattai National Park, which unfolds into some of the finest trail running terrain within reach of Sydney.",
    venueHighlights: [
      '6-acre estate with award-winning gardens',
      '17-metre heated swimming pool',
      'Therapeutic spa',
      'Two buildings: The Homestead & The Lodge',
      'Exclusive use — your group only',
      'Tennis court and outdoor recreation areas',
    ],
    routes: [
      {
        name: 'The Nattai Circuit',
        distance: '10–18 km',
        terrain: 'Single trail, sandstone track, river flats',
        elevation: '250–350 m gain',
        description:
          "Saturday's morning run takes you into Nattai National Park through wild heathland, sandstone outcrops and river flats. Two paced groups depart together and regroup at natural waypoints — choose how far you run.",
      },
      {
        name: 'The Escarpment',
        distance: '15–25 km',
        terrain: 'Technical trail, ridgeline, fire road sections',
        elevation: '500–700 m gain',
        description:
          'The signature route. A long climb onto the escarpment rewards you with panoramic views across the Wollondilly valley. Two options: turn at the ridge for 15 km, or continue for the full 25. Both finish in style.',
      },
      {
        name: 'Estate Morning',
        distance: '5–8 km',
        terrain: 'Estate paths and quiet country lanes',
        elevation: 'Flat to gentle',
        description:
          "An easy sunrise run through the estate grounds and surrounding lanes before Monday's farewell breakfast. No watch required.",
      },
    ],
    itinerary: [
      {
        day: 'Thursday',
        date: '24 September',
        events: [
          { time: '9:00 am', label: 'Coach departs Sydney CBD' },
          { time: '12:00 pm', label: 'Arrive at Kalinya Estate, settle in, lunch' },
          { time: '3:00 pm', label: 'Meet & Greet — first introductions over coffee' },
          { time: '6:00 pm', label: 'Welcome dinner — long table, family style' },
          { time: '8:30 pm', label: 'Sunset walk through the gardens' },
        ],
      },
      {
        day: 'Friday',
        date: '25 September',
        events: [
          { time: '6:00 am', label: 'Pre-run coffee, then morning run — The Nattai Circuit (10–18 km)' },
          { time: '8:30 am', label: 'Return to estate, showers, full breakfast' },
          { time: '9:30 am', label: 'Running brand session — kit, gear, what actually matters' },
          { time: '12:00 pm', label: 'Lunch' },
          { time: '3:00 pm', label: 'Free time — pool, spa, gardens, tennis' },
          { time: '6:00 pm', label: 'Dinner with nutrition session' },
        ],
      },
      {
        day: 'Saturday',
        date: '26 September',
        events: [
          { time: '6:00 am', label: 'Pre-run coffee, then long run — The Escarpment (15–25 km)' },
          { time: '9:00 am', label: 'Guest-led session — special run or talk' },
          { time: '11:30 am', label: 'Late brunch' },
          { time: '3:00 pm', label: 'Free afternoon — pool, spa, rest, games' },
          { time: '6:00 pm', label: 'Pizza night — casual dinner, long evening' },
        ],
      },
      {
        day: 'Sunday',
        date: '27 September',
        events: [
          { time: '6:00 am', label: 'Optional sunrise run — Estate Morning (5–8 km)' },
          { time: '8:00 am', label: 'Farewell breakfast' },
          { time: '9:30 am', label: '"I want to do this again" — closing session' },
          { time: '12:00 pm', label: 'Farewell lunch' },
          { time: '3:00 pm', label: 'Coach departs for Sydney' },
        ],
      },
    ],
    included: [
      '3 nights exclusive accommodation at Kalinya Estate',
      'All meals: Thursday dinner through Sunday lunch',
      '3 guided runs with experienced run leaders',
      'Daily heated pool and spa access',
      'Guided recovery session Saturday afternoon',
      'Welcome drinks and non-alcoholic beverages throughout',
      'Pre-run coffee each morning',
      'Route maps and weekend programme booklet',
      'Transport to and from trailheads',
    ],
    notIncluded: [
      'Transport to/from Bargo (Sydney coach available — $65 return)',
      'Wine and alcoholic beverages',
      'Travel insurance',
      'Personal running gear or equipment',
    ],
    status: 'upcoming',
  },
]

export function getRetreat(slug: string): Retreat | undefined {
  return retreats.find((r) => r.slug === slug)
}
