create table if not exists public.retreats_cms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  location text not null default '',
  region text not null default '',
  distance_from_city text not null default '',
  dates text not null default '',
  dates_short text not null default '',
  capacity integer not null default 12,
  price_from integer not null default 0,
  deposit integer not null default 0,
  hero_image text not null default '',
  hero_image_alt text not null default '',
  venue_image text not null default '',
  venue_image_alt text not null default '',
  description text not null default '',
  venue_name text not null default '',
  venue_description text not null default '',
  venue_highlights jsonb not null default '[]'::jsonb,
  routes jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  included jsonb not null default '[]'::jsonb,
  not_included jsonb not null default '[]'::jsonb,
  status text not null default 'upcoming',
  seo_title text,
  seo_description text,
  seo_og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint retreats_cms_status_check check (status in ('upcoming', 'open', 'sold-out'))
);

create index if not exists idx_retreats_cms_status on public.retreats_cms (status);
create index if not exists idx_retreats_cms_updated_at on public.retreats_cms (updated_at desc);

alter table public.retreats_cms enable row level security;

drop policy if exists "No anonymous access" on public.retreats_cms;
create policy "No anonymous access"
  on public.retreats_cms
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "No authenticated direct access" on public.retreats_cms;
create policy "No authenticated direct access"
  on public.retreats_cms
  for all
  to authenticated
  using (false)
  with check (false);

insert into public.retreats_cms (
  slug,
  name,
  tagline,
  location,
  region,
  distance_from_city,
  dates,
  dates_short,
  capacity,
  price_from,
  deposit,
  hero_image,
  hero_image_alt,
  venue_image,
  venue_image_alt,
  description,
  venue_name,
  venue_description,
  venue_highlights,
  routes,
  itinerary,
  included,
  not_included,
  status
)
values (
  'sydney-southern-highlands',
  'The Southern Highlands',
  '90 minutes from Sydney. A world away from it.',
  'Bargo, NSW',
  'Southern Highlands',
  '~90 min drive from Sydney CBD',
  '24-27 September 2026',
  'September 2026',
  12,
  5899,
  500,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80',
  'Wide highland landscape with layered ridges and soft light',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'Country estate and gardens in warm late-afternoon light',
  'Three nights in an award-winning colonial estate at the foot of the Southern Highlands escarpment. Three guided runs through Nattai National Park. Exceptional food, a heated pool, and the kind of evenings that make you glad you came.',
  'Kalinya Estate',
  'An extraordinary colonial homestead set across 6 acres of award-winning gardens in Bargo, NSW.',
  '["6-acre estate with award-winning gardens","17-metre heated swimming pool","Therapeutic spa","Two buildings: The Homestead & The Lodge","Exclusive use - your group only","Tennis court and outdoor recreation areas"]'::jsonb,
  '[{"name":"The Nattai Circuit","distance":"10-18 km","terrain":"Single trail, sandstone track, river flats","elevation":"250-350 m gain","description":"Saturday morning run into Nattai National Park."}]'::jsonb,
  '[{"day":"Thursday","date":"24 September","events":[{"time":"9:00 am","label":"Coach departs Sydney CBD"},{"time":"12:00 pm","label":"Arrive at Kalinya Estate"}]}]'::jsonb,
  '["3 nights exclusive accommodation at Kalinya Estate","All meals: Thursday dinner through Sunday lunch","3 guided runs with experienced run leaders"]'::jsonb,
  '["Transport to/from Bargo (Sydney coach available)","Wine and alcoholic beverages","Travel insurance"]'::jsonb,
  'upcoming'
)
on conflict (slug) do nothing;
