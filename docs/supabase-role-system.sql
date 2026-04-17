-- Supabase contract for the role-aware system introduced in the frontend.
-- Run this against your project before relying on the new provider flows.

create extension if not exists pgcrypto;

alter table public.profiles
    add column if not exists email text,
    add column if not exists phone text,
    add column if not exists country text,
    add column if not exists city text,
    add column if not exists role text default 'tourist',
    add column if not exists verification_status text default 'not_required',
    add column if not exists company_name text,
    add column if not exists company_profile_id uuid,
    add column if not exists works_under_company boolean default false,
    add column if not exists provider_specialties text,
    add column if not exists guide_license_number text,
    add column if not exists certificate_id text,
    add column if not exists government_id_ref text,
    add column if not exists years_experience integer,
    add column if not exists languages text[];

-- Optional internal admin access:
-- 1. set profiles.role = 'admin' for staff users, or
-- 2. list staff emails in VITE_ADMIN_EMAILS on the frontend.

update public.profiles
set verification_status = case
    when role = 'tourist' then 'not_required'
    when coalesce(is_verified, false) = true then 'approved'
    else 'pending'
end
where verification_status is null;

create table if not exists public.verification (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('tour_company', 'tour_instructor', 'tour_guide')),
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'resubmitted')),
    company_name text,
    website text,
    registration_number text,
    works_under_company boolean default false,
    specialties text,
    license_number text,
    languages text[],
    years_experience integer,
    certificate_id text,
    government_id_ref text,
    bio text,
    rejection_reason text,
    reviewed_at timestamptz,
    reviewed_by uuid references auth.users(id) on delete set null,
    submitted_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists verification_user_id_idx on public.verification(user_id);
create index if not exists verification_status_idx on public.verification(status);

create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    provider_user_id uuid references auth.users(id) on delete set null,
    company_profile_id uuid references public.profiles(id) on delete set null,
    listing_id uuid not null,
    listing_type text not null check (listing_type in ('tour', 'activity', 'event')),
    listing_title text,
    listing_image text,
    number_of_people integer not null default 1,
    unit_price numeric(12,2) not null default 0,
    total_price numeric(12,2) not null default 0,
    status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
    booking_date date,
    created_at timestamptz not null default now()
);

alter table public.bookings
    add column if not exists provider_user_id uuid references auth.users(id) on delete set null,
    add column if not exists company_profile_id uuid references public.profiles(id) on delete set null,
    add column if not exists listing_id uuid,
    add column if not exists listing_type text,
    add column if not exists listing_title text,
    add column if not exists listing_image text,
    add column if not exists unit_price numeric(12,2) default 0,
    add column if not exists payment_status text default 'pending',
    add column if not exists booking_date date;

create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_provider_user_id_idx on public.bookings(provider_user_id);
create index if not exists bookings_listing_lookup_idx on public.bookings(listing_type, listing_id);

alter table public.favorites
    add column if not exists listing_id uuid,
    add column if not exists listing_type text;

alter table public.conversations
    add column if not exists traveler_id uuid,
    add column if not exists provider_id uuid,
    add column if not exists booking_id uuid;

alter table public.posts
    add column if not exists provider_user_id uuid references auth.users(id) on delete set null,
    add column if not exists company_profile_id uuid references public.profiles(id) on delete set null,
    add column if not exists starts_at timestamptz,
    add column if not exists status text default 'published',
    add column if not exists rejection_reason text,
    add column if not exists reviewed_at timestamptz,
    add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

create table if not exists public.moderation_audit_logs (
    id uuid primary key default gen_random_uuid(),
    entity_type text not null check (entity_type in ('verification', 'listing')),
    entity_id uuid not null,
    action text not null check (action in ('approved', 'rejected', 'published', 'resubmitted')),
    actor_user_id uuid references auth.users(id) on delete set null,
    target_user_id uuid references auth.users(id) on delete set null,
    reason text,
    metadata jsonb,
    created_at timestamptz not null default now()
);

create index if not exists moderation_audit_logs_entity_idx on public.moderation_audit_logs(entity_type, entity_id);
create index if not exists moderation_audit_logs_created_at_idx on public.moderation_audit_logs(created_at desc);

update public.posts
set status = coalesce(status, 'published')
where status is null;

create or replace function public.is_admin_user(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = check_user_id
          and role = 'admin'
    );
$$;

create or replace function public.is_verified_provider(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = check_user_id
          and role in ('tour_company', 'tour_instructor', 'tour_guide')
          and verification_status = 'approved'
    );
$$;

grant execute on function public.is_admin_user(uuid) to anon, authenticated, service_role;
grant execute on function public.is_verified_provider(uuid) to anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.verification enable row level security;
alter table public.posts enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.moderation_audit_logs enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
    id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (
    id = auth.uid()
    or public.is_admin_user()
)
with check (
    id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "verification_select_self_or_admin" on public.verification;
create policy "verification_select_self_or_admin"
on public.verification
for select
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "verification_insert_provider_self" on public.verification;
create policy "verification_insert_provider_self"
on public.verification
for insert
to authenticated
with check (
    user_id = auth.uid()
    and role in ('tour_company', 'tour_instructor', 'tour_guide')
    and status = 'pending'
);

drop policy if exists "verification_update_provider_resubmit_or_admin" on public.verification;
create policy "verification_update_provider_resubmit_or_admin"
on public.verification
for update
to authenticated
using (
    user_id = auth.uid()
    or public.is_admin_user()
)
with check (
    public.is_admin_user()
    or (
        user_id = auth.uid()
        and role in ('tour_company', 'tour_instructor', 'tour_guide')
        and status = 'resubmitted'
    )
);

drop policy if exists "posts_public_read_published" on public.posts;
create policy "posts_public_read_published"
on public.posts
for select
to anon, authenticated
using (
    status = 'published'
    or provider_user_id = auth.uid()
    or user_id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "posts_provider_insert_verified" on public.posts;
create policy "posts_provider_insert_verified"
on public.posts
for insert
to authenticated
with check (
    public.is_verified_provider()
    and (
        provider_user_id = auth.uid()
        or user_id = auth.uid()
    )
    and status = 'published'
);

drop policy if exists "posts_update_owner_or_admin" on public.posts;
create policy "posts_update_owner_or_admin"
on public.posts
for update
to authenticated
using (
    provider_user_id = auth.uid()
    or user_id = auth.uid()
    or public.is_admin_user()
)
with check (
    public.is_admin_user()
    or (
        public.is_verified_provider()
        and (
            provider_user_id = auth.uid()
            or user_id = auth.uid()
        )
        and status = 'published'
    )
);

drop policy if exists "bookings_select_participants_or_admin" on public.bookings;
create policy "bookings_select_participants_or_admin"
on public.bookings
for select
to authenticated
using (
    user_id = auth.uid()
    or provider_user_id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "bookings_insert_traveler_self" on public.bookings;
create policy "bookings_insert_traveler_self"
on public.bookings
for insert
to authenticated
with check (
    user_id = auth.uid()
);

drop policy if exists "bookings_update_participants_or_admin" on public.bookings;
create policy "bookings_update_participants_or_admin"
on public.bookings
for update
to authenticated
using (
    user_id = auth.uid()
    or provider_user_id = auth.uid()
    or public.is_admin_user()
)
with check (
    user_id = auth.uid()
    or provider_user_id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "conversations_select_participants_or_admin" on public.conversations;
create policy "conversations_select_participants_or_admin"
on public.conversations
for select
to authenticated
using (
    traveler_id = auth.uid()
    or provider_id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "conversations_insert_participants" on public.conversations;
create policy "conversations_insert_participants"
on public.conversations
for insert
to authenticated
with check (
    traveler_id = auth.uid()
    or provider_id = auth.uid()
    or public.is_admin_user()
);

drop policy if exists "moderation_audit_logs_select_admin_only" on public.moderation_audit_logs;
create policy "moderation_audit_logs_select_admin_only"
on public.moderation_audit_logs
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "moderation_audit_logs_insert_actor_or_admin" on public.moderation_audit_logs;
create policy "moderation_audit_logs_insert_actor_or_admin"
on public.moderation_audit_logs
for insert
to authenticated
with check (
    actor_user_id = auth.uid()
    or target_user_id = auth.uid()
    or public.is_admin_user()
);

-- Notes:
-- 1. Admin moderation in the app assumes admins have profiles.role = 'admin'.
-- 2. Provider listings publish instantly after account verification; only provider accounts, not listings, go through admin approval.
-- 3. Service role bypasses RLS; keep it server-side only.
-- 4. If you still have public data in legacy tours / activities / events tables, run docs/legacy-content-to-posts.sql and then remove the temporary client-side fallback merge.
