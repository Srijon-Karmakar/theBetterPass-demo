-- Adds exit pages (the last page viewed in each session) to the admin analytics summary.
-- Sessions with activity in the last 5 minutes are still browsing, so they are not counted as exits yet.
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
    page_view_counts as (
        select path, count(*) as page_views
        from cur where event_type = 'page_view'
        group by path
    ),
    active_sessions as (
        select distinct session_id
        from public.analytics_events
        where created_at >= now() - interval '5 minutes'
    ),
    session_exits as (
        select distinct on (c.session_id) c.session_id, c.path
        from cur c
        where c.event_type = 'page_view'
          and not exists (select 1 from active_sessions a where a.session_id = c.session_id)
        order by c.session_id, c.created_at desc
    ),
    exit_pages as (
        select se.path, count(*) as exits, coalesce(max(pv.page_views), 0) as page_views
        from session_exits se
        left join page_view_counts pv on pv.path = se.path
        group by se.path
        order by exits desc
        limit 8
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
        'exit_pages', coalesce((select jsonb_agg(to_jsonb(exit_pages) order by exit_pages.exits desc) from exit_pages), '[]'::jsonb),
        'exit_sessions', (select count(*) from session_exits),
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
