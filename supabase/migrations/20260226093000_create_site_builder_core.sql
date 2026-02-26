create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'draft',
  seo_title text,
  seo_description text,
  seo_og_image_url text,
  current_draft_version_id uuid,
  current_published_version_id uuid,
  created_by_user_id uuid references auth.users (id) on delete set null,
  updated_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_pages_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.site_page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages (id) on delete cascade,
  version_number integer not null,
  document jsonb not null default '{"schemaVersion":1,"blocks":[]}'::jsonb,
  notes text,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint site_page_versions_unique unique (page_id, version_number)
);

alter table public.site_pages
  add constraint site_pages_current_draft_fk
  foreign key (current_draft_version_id) references public.site_page_versions (id) on delete set null;

alter table public.site_pages
  add constraint site_pages_current_published_fk
  foreign key (current_published_version_id) references public.site_page_versions (id) on delete set null;

create table if not exists public.site_media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text not null,
  alt_text text,
  focal_x numeric,
  focal_y numeric,
  uploaded_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_preview_tokens (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages (id) on delete cascade,
  version_id uuid not null references public.site_page_versions (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  page_id uuid references public.site_pages (id) on delete set null,
  version_id uuid references public.site_page_versions (id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_site_pages_status on public.site_pages (status);
create index if not exists idx_site_page_versions_page_created on public.site_page_versions (page_id, created_at desc);
create index if not exists idx_site_preview_tokens_expires_at on public.site_preview_tokens (expires_at);
create index if not exists idx_site_media_assets_created_at on public.site_media_assets (created_at desc);
create index if not exists idx_site_audit_logs_page_created on public.site_audit_logs (page_id, created_at desc);

alter table public.site_pages enable row level security;
alter table public.site_page_versions enable row level security;
alter table public.site_media_assets enable row level security;
alter table public.site_preview_tokens enable row level security;
alter table public.site_audit_logs enable row level security;

drop policy if exists "No anonymous access" on public.site_pages;
create policy "No anonymous access"
  on public.site_pages
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "No authenticated direct access" on public.site_pages;
create policy "No authenticated direct access"
  on public.site_pages
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "No anonymous access" on public.site_page_versions;
create policy "No anonymous access"
  on public.site_page_versions
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "No authenticated direct access" on public.site_page_versions;
create policy "No authenticated direct access"
  on public.site_page_versions
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "No anonymous access" on public.site_media_assets;
create policy "No anonymous access"
  on public.site_media_assets
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "No authenticated direct access" on public.site_media_assets;
create policy "No authenticated direct access"
  on public.site_media_assets
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "No anonymous access" on public.site_preview_tokens;
create policy "No anonymous access"
  on public.site_preview_tokens
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "No authenticated direct access" on public.site_preview_tokens;
create policy "No authenticated direct access"
  on public.site_preview_tokens
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "No anonymous access" on public.site_audit_logs;
create policy "No anonymous access"
  on public.site_audit_logs
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "No authenticated direct access" on public.site_audit_logs;
create policy "No authenticated direct access"
  on public.site_audit_logs
  for all
  to authenticated
  using (false)
  with check (false);

insert into public.site_pages (slug, name, status)
values
  ('home', 'Home', 'draft'),
  ('about', 'About', 'draft'),
  ('experience', 'Experience', 'draft'),
  ('retreats', 'Retreats', 'draft'),
  ('faq', 'FAQ', 'draft')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;
