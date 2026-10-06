-- Community map pins on /map: any visitor can see them, signed-in users can add and remove their own.
create table if not exists public.map_pins (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    author_name text not null default 'Traveller' check (char_length(author_name) between 1 and 80),
    lat double precision not null check (lat between -90 and 90),
    lng double precision not null check (lng between -180 and 180),
    category text not null check (category in (
        'temple', 'mosque', 'church', 'school', 'historical', 'heritage',
        'durga_puja', 'museum', 'park', 'market', 'food', 'viewpoint', 'other'
    )),
    title text not null check (char_length(trim(title)) between 2 and 80),
    review text not null default '' check (char_length(review) <= 1000),
    rating smallint not null check (rating between 1 and 5),
    created_at timestamptz not null default now()
);

create index if not exists map_pins_created_idx on public.map_pins (created_at desc);

alter table public.map_pins enable row level security;

drop policy if exists "Map pins are public" on public.map_pins;
create policy "Map pins are public" on public.map_pins
    for select using (true);

drop policy if exists "Users add their own map pins" on public.map_pins;
create policy "Users add their own map pins" on public.map_pins
    for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users delete their own map pins" on public.map_pins;
create policy "Users delete their own map pins" on public.map_pins
    for delete to authenticated using (auth.uid() = user_id);

grant select on public.map_pins to anon, authenticated;
grant insert, delete on public.map_pins to authenticated;
