-- Razorpay booking metadata migration
-- Date: 2026-04-30
-- Scope: keep booking creation strictly post-payment and store payment references.

begin;

alter table public.bookings
    add column if not exists payment_order_id text,
    add column if not exists payment_id text,
    add column if not exists payment_signature text,
    add column if not exists payment_currency text default 'INR',
    add column if not exists paid_at timestamptz;

update public.bookings
set payment_currency = 'INR'
where payment_currency is null;

alter table public.bookings
    alter column payment_currency set default 'INR';

create unique index if not exists bookings_payment_id_uniq
    on public.bookings(payment_id)
    where payment_id is not null;

create index if not exists bookings_payment_order_id_idx
    on public.bookings(payment_order_id);

commit;
