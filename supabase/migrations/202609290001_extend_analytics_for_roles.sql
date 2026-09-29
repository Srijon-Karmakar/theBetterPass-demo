-- Extends analytics for Marketing (full traffic + newsletter + CRM), Provider
-- (own-listing engagement + revenue) and Tourist (own activity + trending) roles.

alter table public.analytics_events
    drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
    add constraint analytics_events_event_type_check
    check (event_type in (
        'page_view', 'click', 'login', 'signup', 'link_visit',
        'listing_view', 'booking_started', 'favorite_added'
    ));

-- Marketing accounts get the same platform traffic view as admins.
create or replace function public.admin_analytics_summary(
    p_from timestamptz,
    p_to timestamptz,
    p_tz text default 'Asia/Kolkata'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_span interval;
    v_prev_from timestamptz;
    v_result jsonb;
    v_is_marketing boolean;
begin
    if auth.uid() is null or not exists (
        select 1 from public.profiles where id = auth.uid() and role in ('admin', 'marketing')
    ) then
        raise exception 'Admins only' using errcode = '42501';
    end if;

    select role = 'marketing' into v_is_marketing from public.profiles where id = auth.uid();

    if p_to <= p_from or p_to - p_from > interval '400 days' then
        raise exception 'Invalid date range' using errcode = '22023';
    end if;

    v_span := p_to - p_from;
    v_prev_from := p_from - v_span;

    with cur as (
        select * from public.analytics_events where created_at >= p_from and created_at < p_to
    ),
    prev as (
        select * from public.analytics_events where created_at >= v_prev_from and created_at < p_from
    ),
    totals as (
        select
            count(distinct visitor_id) as visitors,
            count(distinct session_id) as sessions,
            count(*) filter (where event_type = 'page_view') as page_views,
            count(*) filter (where event_type = 'click') as clicks,
            count(*) filter (where event_type = 'login') as logins,
            count(*) filter (where event_type = 'signup') as signups,
            count(*) filter (where event_type = 'link_visit') as link_visits,
            count(*) filter (where event_type = 'listing_view') as listing_views,
            count(*) filter (where event_type = 'booking_started') as booking_starts,
            count(distinct visitor_id) filter (where user_id is not null) as signed_in_visitors,
            count(distinct visitor_id) filter (where visitor_id in (
                select visitor_id from public.analytics_events where created_at < p_from
            )) as returning_visitors
        from cur
    ),
    prev_totals as (
        select
            count(distinct visitor_id) as visitors,
            count(distinct session_id) as sessions,
            count(*) filter (where event_type = 'page_view') as page_views,
            count(*) filter (where event_type = 'click') as clicks,
            count(*) filter (where event_type = 'login') as logins,
            count(*) filter (where event_type = 'signup') as signups,
            count(*) filter (where event_type = 'link_visit') as link_visits,
            count(*) filter (where event_type = 'listing_view') as listing_views,
            count(*) filter (where event_type = 'booking_started') as booking_starts
        from prev
    ),
    days as (
        select
            to_char((created_at at time zone p_tz)::date, 'YYYY-MM-DD') as day,
            count(distinct visitor_id) as visitors,
            count(*) filter (where event_type = 'page_view') as page_views,
            count(*) filter (where event_type = 'click') as clicks,
            count(*) filter (where event_type = 'login') as logins,
            count(*) filter (where event_type = 'signup') as signups,
            count(*) filter (where event_type = 'link_visit') as link_visits,
            count(*) filter (where event_type = 'listing_view') as listing_views,
            count(*) filter (where event_type = 'booking_started') as booking_starts
        from cur
        group by 1
    ),
    top_pages as (
        select path, count(*) as views, count(distinct visitor_id) as visitors
        from cur where event_type = 'page_view'
        group by path order by views desc limit 8
    ),
    top_sources as (
        select coalesce(nullif(utm_source, ''), nullif(referrer_host, ''), 'Direct') as source,
               count(distinct visitor_id) as visitors
        from cur where event_type = 'page_view'
        group by 1 order by visitors desc limit 8
    ),
    top_clicks as (
        select target, count(*) as clicks
        from cur where event_type = 'click' and target is not null
        group by target order by clicks desc limit 8
    ),
    top_links as (
        select coalesce(nullif(coupon_code, ''), nullif(utm_campaign, ''), 'Untagged') as link,
               count(*) as visits, count(distinct visitor_id) as visitors
        from cur where event_type = 'link_visit'
        group by 1 order by visits desc limit 8
    ),
    devices as (
        select coalesce(device, 'desktop') as device, count(distinct visitor_id) as visitors
        from cur group by 1
    ),
    heat as (
        select extract(dow from created_at at time zone p_tz)::int as dow,
               extract(hour from created_at at time zone p_tz)::int as hour,
               count(*) as events
        from cur where event_type = 'page_view'
        group by 1, 2
    ),
    funnel as (
        select
            count(distinct visitor_id) as visited,
            count(distinct visitor_id) filter (where event_type = 'listing_view') as viewed_listing,
            count(distinct visitor_id) filter (where event_type in ('login', 'signup')) as authenticated,
            count(distinct visitor_id) filter (where event_type = 'booking_started') as started_booking
        from cur
    ),
    newsletter_days as (
        select
            to_char((subscribed_at at time zone p_tz)::date, 'YYYY-MM-DD') as day,
            count(*) as subscribers
        from public.newsletter_subscribers
        where subscribed_at >= p_from and subscribed_at < p_to
        group by 1
    ),
    newsletter_totals as (
        select
            count(*) filter (where status = 'subscribed') as active_subscribers,
            count(*) filter (where subscribed_at >= p_from and subscribed_at < p_to) as new_subscribers,
            count(*) filter (where subscribed_at >= v_prev_from and subscribed_at < p_from) as prev_new_subscribers
        from public.newsletter_subscribers
    ),
    crm_funnel as (
        select
            count(*) as leads,
            count(*) filter (where s.status in ('contacted', 'qualified', 'converted')) as contacted,
            count(*) filter (where s.status in ('qualified', 'converted')) as qualified,
            count(*) filter (where s.status = 'converted') as converted
        from public.contact_submissions c
        left join public.crm_lead_status s on s.contact_submission_id = c.id
        where c.created_at >= p_from and c.created_at < p_to
    )
    select jsonb_build_object(
        'range', jsonb_build_object('from', p_from, 'to', p_to, 'tz', p_tz),
        'totals', (select to_jsonb(totals) from totals),
        'previous', (select to_jsonb(prev_totals) from prev_totals),
        'daily', coalesce((select jsonb_agg(to_jsonb(days) order by days.day) from days), '[]'::jsonb),
        'top_pages', coalesce((select jsonb_agg(to_jsonb(top_pages)) from top_pages), '[]'::jsonb),
        'top_sources', coalesce((select jsonb_agg(to_jsonb(top_sources)) from top_sources), '[]'::jsonb),
        'top_clicks', coalesce((select jsonb_agg(to_jsonb(top_clicks)) from top_clicks), '[]'::jsonb),
        'top_links', coalesce((select jsonb_agg(to_jsonb(top_links)) from top_links), '[]'::jsonb),
        'devices', coalesce((select jsonb_agg(to_jsonb(devices)) from devices), '[]'::jsonb),
        'heatmap', coalesce((select jsonb_agg(to_jsonb(heat)) from heat), '[]'::jsonb),
        'funnel', (select to_jsonb(funnel) from funnel),
        'active_now', (
            select count(distinct visitor_id)
            from public.analytics_events
            where created_at >= now() - interval '5 minutes'
        ),
        'newsletter', jsonb_build_object(
            'daily', coalesce((select jsonb_agg(to_jsonb(newsletter_days) order by newsletter_days.day) from newsletter_days), '[]'::jsonb),
            'totals', (select to_jsonb(newsletter_totals) from newsletter_totals)
        ),
        'crm_funnel', (select to_jsonb(crm_funnel) from crm_funnel),
        'is_marketing', coalesce(v_is_marketing, false)
    ) into v_result;

    return v_result;
end;
$$;

revoke all on function public.admin_analytics_summary(timestamptz, timestamptz, text) from public, anon;
grant execute on function public.admin_analytics_summary(timestamptz, timestamptz, text) to authenticated;

-- Provider/vendor analytics: engagement + revenue, scoped to the caller's own listings only.
create or replace function public.provider_analytics_summary(
    p_from timestamptz,
    p_to timestamptz,
    p_tz text default 'Asia/Kolkata'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_provider uuid := auth.uid();
    v_result jsonb;
begin
    if v_provider is null then
        raise exception 'Authentication required' using errcode = '42501';
    end if;

    if p_to <= p_from or p_to - p_from > interval '400 days' then
        raise exception 'Invalid date range' using errcode = '22023';
    end if;

    with my_listings as (
        select id, type, title, status
        from public.posts
        where provider_user_id = v_provider
    ),
    events as (
        select
            e.*,
            split_part(e.target, ':', 1) as ev_type,
            split_part(e.target, ':', 2) as ev_id
        from public.analytics_events e
        where e.created_at >= p_from and e.created_at < p_to
          and e.event_type in ('listing_view', 'booking_started', 'favorite_added')
          and e.target is not null
    ),
    my_events as (
        select ev.* from events ev
        join my_listings l on l.id::text = ev.ev_id
    ),
    totals as (
        select
            count(*) filter (where event_type = 'listing_view') as views,
            count(distinct visitor_id) filter (where event_type = 'listing_view') as unique_viewers,
            count(*) filter (where event_type = 'favorite_added') as favorites,
            count(*) filter (where event_type = 'booking_started') as booking_starts
        from my_events
    ),
    bookings_cur as (
        select *
        from public.bookings
        where provider_user_id = v_provider and created_at >= p_from and created_at < p_to
    ),
    booking_totals as (
        select
            count(*) as bookings,
            count(*) filter (where status = 'confirmed' or status = 'completed') as confirmed_bookings,
            count(*) filter (where status = 'cancelled') as cancelled_bookings,
            coalesce(sum(total_price) filter (where payment_status = 'paid'), 0) as revenue,
            coalesce(sum(provider_payout_amount) filter (where payment_status = 'paid'), 0) as payout_amount
        from bookings_cur
    ),
    days as (
        select
            to_char((created_at at time zone p_tz)::date, 'YYYY-MM-DD') as day,
            count(*) filter (where event_type = 'listing_view') as views,
            count(*) filter (where event_type = 'favorite_added') as favorites,
            count(*) filter (where event_type = 'booking_started') as booking_starts
        from my_events
        group by 1
    ),
    booking_days as (
        select
            to_char((created_at at time zone p_tz)::date, 'YYYY-MM-DD') as day,
            count(*) as bookings,
            coalesce(sum(total_price) filter (where payment_status = 'paid'), 0) as revenue
        from bookings_cur
        group by 1
    ),
    per_listing_events as (
        select ev_id as listing_id,
               count(*) filter (where event_type = 'listing_view') as views,
               count(*) filter (where event_type = 'favorite_added') as favorites,
               count(*) filter (where event_type = 'booking_started') as booking_starts
        from my_events
        group by 1
    ),
    per_listing_bookings as (
        select listing_id::text as listing_id,
               count(*) as bookings,
               coalesce(sum(total_price) filter (where payment_status = 'paid'), 0) as revenue
        from bookings_cur
        group by 1
    ),
    per_listing as (
        select
            l.id, l.title, l.type, l.status,
            coalesce(e.views, 0) as views,
            coalesce(e.favorites, 0) as favorites,
            coalesce(e.booking_starts, 0) as booking_starts,
            coalesce(b.bookings, 0) as bookings,
            coalesce(b.revenue, 0) as revenue
        from my_listings l
        left join per_listing_events e on e.listing_id = l.id::text
        left join per_listing_bookings b on b.listing_id = l.id::text
        order by coalesce(e.views, 0) desc, coalesce(b.revenue, 0) desc
        limit 20
    )
    select jsonb_build_object(
        'range', jsonb_build_object('from', p_from, 'to', p_to, 'tz', p_tz),
        'listing_count', (select count(*) from my_listings),
        'totals', (select to_jsonb(totals) from totals) || (select to_jsonb(booking_totals) from booking_totals),
        'daily_engagement', coalesce((select jsonb_agg(to_jsonb(days) order by days.day) from days), '[]'::jsonb),
        'daily_bookings', coalesce((select jsonb_agg(to_jsonb(booking_days) order by booking_days.day) from booking_days), '[]'::jsonb),
        'listings', coalesce((select jsonb_agg(to_jsonb(per_listing)) from per_listing), '[]'::jsonb)
    ) into v_result;

    return v_result;
end;
$$;

revoke all on function public.provider_analytics_summary(timestamptz, timestamptz, text) from public, anon;
grant execute on function public.provider_analytics_summary(timestamptz, timestamptz, text) to authenticated;

-- Tourist analytics: the caller's own activity, plus anonymized platform-wide trending.
create or replace function public.tourist_analytics_summary(
    p_from timestamptz,
    p_to timestamptz,
    p_tz text default 'Asia/Kolkata'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user uuid := auth.uid();
    v_result jsonb;
begin
    if v_user is null then
        raise exception 'Authentication required' using errcode = '42501';
    end if;

    if p_to <= p_from or p_to - p_from > interval '400 days' then
        raise exception 'Invalid date range' using errcode = '22023';
    end if;

    with my_events as (
        select * from public.analytics_events
        where user_id = v_user and created_at >= p_from and created_at < p_to
    ),
    my_bookings as (
        select * from public.bookings
        where user_id = v_user and created_at >= p_from and created_at < p_to
    ),
    totals as (
        select
            count(*) filter (where event_type = 'listing_view') as listings_viewed,
            count(*) filter (where event_type = 'favorite_added') as favorites_added,
            count(*) filter (where event_type = 'login') as logins,
            count(distinct session_id) as sessions
        from my_events
    ),
    booking_totals as (
        select
            count(*) as bookings,
            count(*) filter (where status = 'confirmed' or status = 'completed') as confirmed_bookings,
            coalesce(sum(total_price) filter (where payment_status = 'paid'), 0) as spend
        from my_bookings
    ),
    days as (
        select
            to_char((created_at at time zone p_tz)::date, 'YYYY-MM-DD') as day,
            count(*) filter (where event_type = 'listing_view') as listings_viewed,
            count(*) filter (where event_type = 'login') as logins
        from my_events
        group by 1
    ),
    booking_days as (
        select
            to_char((created_at at time zone p_tz)::date, 'YYYY-MM-DD') as day,
            count(*) as bookings,
            coalesce(sum(total_price) filter (where payment_status = 'paid'), 0) as spend
        from my_bookings
        group by 1
    ),
    recent_listings as (
        select split_part(target, ':', 2) as listing_id, max(created_at) as last_viewed, count(*) as views
        from my_events
        where event_type = 'listing_view' and target is not null
        group by 1
        order by last_viewed desc
        limit 8
    ),
    trending as (
        select split_part(target, ':', 1) as listing_type, split_part(target, ':', 2) as listing_id,
               count(*) as views, count(distinct visitor_id) as visitors
        from public.analytics_events
        where event_type = 'listing_view' and created_at >= p_from and created_at < p_to and target is not null
        group by 1, 2
        order by views desc
        limit 8
    )
    select jsonb_build_object(
        'range', jsonb_build_object('from', p_from, 'to', p_to, 'tz', p_tz),
        'totals', (select to_jsonb(totals) from totals) || (select to_jsonb(booking_totals) from booking_totals),
        'daily_activity', coalesce((select jsonb_agg(to_jsonb(days) order by days.day) from days), '[]'::jsonb),
        'daily_bookings', coalesce((select jsonb_agg(to_jsonb(booking_days) order by booking_days.day) from booking_days), '[]'::jsonb),
        'recent_listings', coalesce((
            select jsonb_agg(jsonb_build_object(
                'listing_id', rl.listing_id,
                'views', rl.views,
                'title', p.title,
                'type', p.type
            ))
            from recent_listings rl
            left join public.posts p on p.id::text = rl.listing_id
        ), '[]'::jsonb),
        'trending', coalesce((
            select jsonb_agg(jsonb_build_object(
                'listing_id', t.listing_id,
                'listing_type', t.listing_type,
                'views', t.views,
                'title', p.title,
                'type', p.type,
                'image_url', p.image_url
            ))
            from trending t
            left join public.posts p on p.id::text = t.listing_id
        ), '[]'::jsonb)
    ) into v_result;

    return v_result;
end;
$$;

revoke all on function public.tourist_analytics_summary(timestamptz, timestamptz, text) from public, anon;
grant execute on function public.tourist_analytics_summary(timestamptz, timestamptz, text) to authenticated;
