-- Reduce the FIRST20 first-booking discount from 20% to 5%.
update public.coupons
set
    name = 'Leaflet first booking 5% off',
    discount_value = 5,
    updated_at = now()
where code = 'FIRST20'
  and discount_type = 'percent';
