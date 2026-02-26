do $$
declare
  v_page_id uuid;
  v_version_id uuid;
begin
  -- home
  insert into public.site_pages (slug, name, status)
  values ('home', 'Home', 'draft')
  on conflict (slug) do update set name = excluded.name
  returning id into v_page_id;

  if not exists (select 1 from public.site_page_versions where page_id = v_page_id) then
    insert into public.site_page_versions (page_id, version_number, document, notes)
    values (
      v_page_id,
      1,
      jsonb_build_object(
        'schemaVersion', 1,
        'blocks', jsonb_build_array(
          jsonb_build_object('id','home-hero','type','hero','props',jsonb_build_object('eyebrow','Running Retreats','heading','Somewhere between the miles, you find yourself.','subheading','Escape the ordinary and join thoughtfully designed running retreats.','ctaLabel','View Retreats','ctaHref','/retreats'),'style',jsonb_build_object('background','dark','spacingTop','l','spacingBottom','l')),
          jsonb_build_object('id','home-story','type','rich_text','props',jsonb_build_object('title','What is Miles Between','body','Running is part of your life. Not all of it.\n\nMiles Between is built for recreational runners who value adventure, community, and restoration.'),'style',jsonb_build_object('background','default','spacingTop','m','spacingBottom','m')),
          jsonb_build_object('id','home-retreats','type','retreat_cards','props',jsonb_build_object('title','Upcoming Retreats'),'style',jsonb_build_object('background','alt','spacingTop','m','spacingBottom','m')),
          jsonb_build_object('id','home-cta','type','cta_banner','props',jsonb_build_object('title','Join the retreat list','body','Be the first to hear about new dates and destinations.','ctaLabel','Join Retreat List','ctaHref','/#register'),'style',jsonb_build_object('background','default','spacingTop','m','spacingBottom','m'))
        )
      ),
      'Starter seed from legacy home layout'
    )
    returning id into v_version_id;

    update public.site_pages
    set current_draft_version_id = v_version_id,
        updated_at = now()
    where id = v_page_id and current_draft_version_id is null;
  end if;

  -- about
  insert into public.site_pages (slug, name, status)
  values ('about', 'About', 'draft')
  on conflict (slug) do update set name = excluded.name
  returning id into v_page_id;

  if not exists (select 1 from public.site_page_versions where page_id = v_page_id) then
    insert into public.site_page_versions (page_id, version_number, document, notes)
    values (
      v_page_id,
      1,
      jsonb_build_object(
        'schemaVersion', 1,
        'blocks', jsonb_build_array(
          jsonb_build_object('id','about-hero','type','hero','props',jsonb_build_object('eyebrow','About','heading','Why we built Miles Between.','subheading','A retreat for people who love running but want more than a training camp.','ctaLabel','View Retreat','ctaHref','/retreats/sydney-southern-highlands'),'style',jsonb_build_object('background','dark','spacingTop','l','spacingBottom','l')),
          jsonb_build_object('id','about-story','type','rich_text','props',jsonb_build_object('title','The story','body','We looked for this retreat. It did not exist.\n\nSo we built it: exceptional terrain, genuine rest, and meaningful company.'),'style',jsonb_build_object('background','default','spacingTop','m','spacingBottom','m')),
          jsonb_build_object('id','about-quote','type','quote','props',jsonb_build_object('quote','You do not need to be training for anything. You just need to love running.','author','Miles Between'),'style',jsonb_build_object('background','alt','spacingTop','m','spacingBottom','m'))
        )
      ),
      'Starter seed from legacy about layout'
    )
    returning id into v_version_id;

    update public.site_pages
    set current_draft_version_id = v_version_id,
        updated_at = now()
    where id = v_page_id and current_draft_version_id is null;
  end if;

  -- experience
  insert into public.site_pages (slug, name, status)
  values ('experience', 'Experience', 'draft')
  on conflict (slug) do update set name = excluded.name
  returning id into v_page_id;

  if not exists (select 1 from public.site_page_versions where page_id = v_page_id) then
    insert into public.site_page_versions (page_id, version_number, document, notes)
    values (
      v_page_id,
      1,
      jsonb_build_object(
        'schemaVersion', 1,
        'blocks', jsonb_build_array(
          jsonb_build_object('id','exp-hero','type','hero','props',jsonb_build_object('eyebrow','The Experience','heading','What it actually feels like.','subheading','Three nights. Three runs. More meals than you can finish. People worth knowing.','ctaLabel','View Retreats','ctaHref','/retreats'),'style',jsonb_build_object('background','dark','spacingTop','l','spacingBottom','l')),
          jsonb_build_object('id','exp-pillars','type','stats_row','props',jsonb_build_object('items',jsonb_build_array(
            jsonb_build_object('label','Pillars','value','4'),
            jsonb_build_object('label','Nights','value','3'),
            jsonb_build_object('label','Guided Runs','value','3'),
            jsonb_build_object('label','Guests','value','12')
          )),'style',jsonb_build_object('background','default','spacingTop','m','spacingBottom','m')),
          jsonb_build_object('id','exp-cta','type','cta_banner','props',jsonb_build_object('title','Ready to see what is on?','body','Our first retreat is in the Southern Highlands, September 2026.','ctaLabel','View Retreats','ctaHref','/retreats'),'style',jsonb_build_object('background','alt','spacingTop','m','spacingBottom','m'))
        )
      ),
      'Starter seed from legacy experience layout'
    )
    returning id into v_version_id;

    update public.site_pages
    set current_draft_version_id = v_version_id,
        updated_at = now()
    where id = v_page_id and current_draft_version_id is null;
  end if;

  -- retreats
  insert into public.site_pages (slug, name, status)
  values ('retreats', 'Retreats', 'draft')
  on conflict (slug) do update set name = excluded.name
  returning id into v_page_id;

  if not exists (select 1 from public.site_page_versions where page_id = v_page_id) then
    insert into public.site_page_versions (page_id, version_number, document, notes)
    values (
      v_page_id,
      1,
      jsonb_build_object(
        'schemaVersion', 1,
        'blocks', jsonb_build_array(
          jsonb_build_object('id','retreats-hero','type','hero','props',jsonb_build_object('eyebrow','Retreats','heading','Where will the miles take you?','subheading','Each retreat is built around a place worth travelling for.','ctaLabel','Join General Retreat List','ctaHref','/#register'),'style',jsonb_build_object('background','dark','spacingTop','l','spacingBottom','l')),
          jsonb_build_object('id','retreats-cards','type','retreat_cards','props',jsonb_build_object('title','Explore Retreats'),'style',jsonb_build_object('background','default','spacingTop','m','spacingBottom','m'))
        )
      ),
      'Starter seed from legacy retreats layout'
    )
    returning id into v_version_id;

    update public.site_pages
    set current_draft_version_id = v_version_id,
        updated_at = now()
    where id = v_page_id and current_draft_version_id is null;
  end if;

  -- faq
  insert into public.site_pages (slug, name, status)
  values ('faq', 'FAQ', 'draft')
  on conflict (slug) do update set name = excluded.name
  returning id into v_page_id;

  if not exists (select 1 from public.site_page_versions where page_id = v_page_id) then
    insert into public.site_page_versions (page_id, version_number, document, notes)
    values (
      v_page_id,
      1,
      jsonb_build_object(
        'schemaVersion', 1,
        'blocks', jsonb_build_array(
          jsonb_build_object('id','faq-hero','type','hero','props',jsonb_build_object('eyebrow','FAQ','heading','Questions worth answering.','subheading','Everything you want to know before registering.','ctaLabel','Apply for This Retreat','ctaHref','/retreats/sydney-southern-highlands#register'),'style',jsonb_build_object('background','dark','spacingTop','l','spacingBottom','l')),
          jsonb_build_object('id','faq-list','type','faq_list','props',jsonb_build_object('title','Frequently Asked Questions','items',jsonb_build_array(
            jsonb_build_object('question','What fitness level do I need?','answer','You should be comfortable running 10-15 km at a conversational pace.'),
            jsonb_build_object('question','Can I come on my own?','answer','Most guests do. The small-group format makes this easy.'),
            jsonb_build_object('question','Do you cater for dietary requirements?','answer','Yes. Share requirements when you register interest.')
          )),'style',jsonb_build_object('background','default','spacingTop','m','spacingBottom','m'))
        )
      ),
      'Starter seed from legacy FAQ layout'
    )
    returning id into v_version_id;

    update public.site_pages
    set current_draft_version_id = v_version_id,
        updated_at = now()
    where id = v_page_id and current_draft_version_id is null;
  end if;
end $$;
