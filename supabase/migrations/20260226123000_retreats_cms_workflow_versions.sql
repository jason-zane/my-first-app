alter table public.retreats_cms
  add column if not exists workflow_status text not null default 'draft',
  add column if not exists current_draft_version_id uuid,
  add column if not exists current_published_version_id uuid,
  add column if not exists published_at timestamptz;

alter table public.retreats_cms
  drop constraint if exists retreats_cms_workflow_status_check;

alter table public.retreats_cms
  add constraint retreats_cms_workflow_status_check
  check (workflow_status in ('draft', 'published', 'archived'));

create table if not exists public.retreats_cms_versions (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references public.retreats_cms(id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  unique (retreat_id, version_number)
);

create index if not exists idx_retreats_cms_versions_retreat_id
  on public.retreats_cms_versions (retreat_id, version_number desc);

alter table public.retreats_cms_versions enable row level security;

drop policy if exists "No anonymous access" on public.retreats_cms_versions;
create policy "No anonymous access"
  on public.retreats_cms_versions
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "No authenticated direct access" on public.retreats_cms_versions;
create policy "No authenticated direct access"
  on public.retreats_cms_versions
  for all
  to authenticated
  using (false)
  with check (false);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'retreats_cms_current_draft_version_id_fkey'
  ) then
    alter table public.retreats_cms
      add constraint retreats_cms_current_draft_version_id_fkey
      foreign key (current_draft_version_id)
      references public.retreats_cms_versions(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'retreats_cms_current_published_version_id_fkey'
  ) then
    alter table public.retreats_cms
      add constraint retreats_cms_current_published_version_id_fkey
      foreign key (current_published_version_id)
      references public.retreats_cms_versions(id)
      on delete set null;
  end if;
end $$;

insert into public.retreats_cms_versions (
  retreat_id,
  version_number,
  snapshot,
  created_at
)
select
  r.id,
  1,
  jsonb_build_object(
    'slug', r.slug,
    'name', r.name,
    'tagline', r.tagline,
    'location', r.location,
    'region', r.region,
    'distance_from_city', r.distance_from_city,
    'dates', r.dates,
    'dates_short', r.dates_short,
    'capacity', r.capacity,
    'price_from', r.price_from,
    'deposit', r.deposit,
    'hero_image', r.hero_image,
    'hero_image_alt', r.hero_image_alt,
    'venue_image', r.venue_image,
    'venue_image_alt', r.venue_image_alt,
    'description', r.description,
    'venue_name', r.venue_name,
    'venue_description', r.venue_description,
    'venue_highlights', r.venue_highlights,
    'routes', r.routes,
    'itinerary', r.itinerary,
    'included', r.included,
    'not_included', r.not_included,
    'status', r.status,
    'seo_title', r.seo_title,
    'seo_description', r.seo_description,
    'seo_og_image_url', r.seo_og_image_url
  ),
  coalesce(r.updated_at, r.created_at, now())
from public.retreats_cms r
where not exists (
  select 1
  from public.retreats_cms_versions v
  where v.retreat_id = r.id
);

update public.retreats_cms r
set
  current_draft_version_id = v.id,
  current_published_version_id = v.id,
  workflow_status = case
    when r.workflow_status = 'archived' then 'archived'
    else 'published'
  end,
  published_at = coalesce(r.published_at, now())
from public.retreats_cms_versions v
where v.retreat_id = r.id
  and v.version_number = 1
  and (r.current_draft_version_id is null or r.current_published_version_id is null);
