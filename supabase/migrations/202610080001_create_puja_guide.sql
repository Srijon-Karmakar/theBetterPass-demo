-- Durga Puja guide on /map: providers opt in as Puja guides (admin approves), tourists keep a private
-- pandal plan and send guide booking requests. Accepted/pending requests also unlock chat in the app.

create table if not exists public.puja_guides (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null check (char_length(trim(display_name)) between 2 and 80),
    bio text not null default '' check (char_length(bio) <= 800),
    languages text not null default '' check (char_length(languages) <= 120),
    areas text not null default '' check (char_length(areas) <= 160),
    price_per_day numeric(10, 2) not null default 0 check (price_per_day >= 0 and price_per_day <= 100000),
    max_group_size smallint not null default 6 check (max_group_size between 1 and 50),
    is_active boolean not null default true,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.puja_guides enable row level security;

drop policy if exists "Approved puja guides are public" on public.puja_guides;
create policy "Approved puja guides are public" on public.puja_guides
    for select using (
        (status = 'approved' and is_active)
        or user_id = auth.uid()
        or public.is_admin_user()
    );

-- Only provider accounts can opt in, and they always (re)enter review as pending.
drop policy if exists "Providers manage their puja guide profile" on public.puja_guides;
create policy "Providers manage their puja guide profile" on public.puja_guides
    for insert to authenticated with check (
        user_id = auth.uid()
        and status = 'pending'
        and exists (
            select 1 from public.profiles p
            where p.id = auth.uid()
              and p.role in ('tour_company', 'tour_instructor', 'tour_guide', 'local_guide')
        )
    );

drop policy if exists "Providers update their puja guide profile" on public.puja_guides;
create policy "Providers update their puja guide profile" on public.puja_guides
    for update to authenticated
    using (user_id = auth.uid() or public.is_admin_user())
    with check (user_id = auth.uid() or public.is_admin_user());

-- Providers may edit their own row, but only admins can change the review status.
create or replace function public.puja_guides_guard_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at := now();
    if not public.is_admin_user() then
        if tg_op = 'INSERT' then
            new.status := 'pending';
        elsif new.status is distinct from old.status then
            new.status := old.status;
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists puja_guides_guard_status on public.puja_guides;
create trigger puja_guides_guard_status
    before insert or update on public.puja_guides
    for each row execute function public.puja_guides_guard_status();

create table if not exists public.puja_guide_requests (
    id uuid primary key default gen_random_uuid(),
    tourist_id uuid not null references auth.users(id) on delete cascade,
    guide_id uuid not null references public.puja_guides(user_id) on delete cascade,
    visit_date date not null,
    group_size smallint not null default 2 check (group_size between 1 and 50),
    pandal_ids text[] not null default '{}',
    note text not null default '' check (char_length(note) <= 1000),
    status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (tourist_id <> guide_id)
);

create index if not exists puja_guide_requests_guide_idx on public.puja_guide_requests (guide_id, created_at desc);
create index if not exists puja_guide_requests_tourist_idx on public.puja_guide_requests (tourist_id, created_at desc);

alter table public.puja_guide_requests enable row level security;

drop policy if exists "Puja requests visible to both sides" on public.puja_guide_requests;
create policy "Puja requests visible to both sides" on public.puja_guide_requests
    for select to authenticated using (
        tourist_id = auth.uid() or guide_id = auth.uid() or public.is_admin_user()
    );

drop policy if exists "Tourists create puja requests" on public.puja_guide_requests;
create policy "Tourists create puja requests" on public.puja_guide_requests
    for insert to authenticated with check (
        tourist_id = auth.uid()
        and status = 'pending'
        and exists (
            select 1 from public.puja_guides g
            where g.user_id = guide_id and g.status = 'approved' and g.is_active
        )
    );

drop policy if exists "Both sides update puja requests" on public.puja_guide_requests;
create policy "Both sides update puja requests" on public.puja_guide_requests
    for update to authenticated
    using (tourist_id = auth.uid() or guide_id = auth.uid())
    with check (tourist_id = auth.uid() or guide_id = auth.uid());

-- Guides accept or decline; tourists can only cancel. Nothing else on the request changes after creation.
create or replace function public.puja_guide_requests_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.status is distinct from old.status then
        if auth.uid() = old.guide_id and new.status in ('accepted', 'declined') and old.status in ('pending', 'accepted') then
            null;
        elsif auth.uid() = old.tourist_id and new.status = 'cancelled' and old.status in ('pending', 'accepted') then
            null;
        else
            raise exception 'This status change is not allowed' using errcode = '42501';
        end if;
    end if;

    new.tourist_id := old.tourist_id;
    new.guide_id := old.guide_id;
    new.visit_date := old.visit_date;
    new.group_size := old.group_size;
    new.pandal_ids := old.pandal_ids;
    new.note := old.note;
    new.created_at := old.created_at;
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists puja_guide_requests_guard_update on public.puja_guide_requests;
create trigger puja_guide_requests_guard_update
    before update on public.puja_guide_requests
    for each row execute function public.puja_guide_requests_guard_update();

-- A tourist's private "pandals I want to visit" list, in visiting order.
create table if not exists public.puja_pandal_plans (
    user_id uuid primary key references auth.users(id) on delete cascade,
    pandal_ids text[] not null default '{}',
    updated_at timestamptz not null default now()
);

alter table public.puja_pandal_plans enable row level security;

drop policy if exists "Users manage their own pandal plan" on public.puja_pandal_plans;
create policy "Users manage their own pandal plan" on public.puja_pandal_plans
    for all to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

grant select on public.puja_guides to anon, authenticated;
grant insert, update on public.puja_guides to authenticated;
grant select, insert, update on public.puja_guide_requests to authenticated;
grant select, insert, update, delete on public.puja_pandal_plans to authenticated;
