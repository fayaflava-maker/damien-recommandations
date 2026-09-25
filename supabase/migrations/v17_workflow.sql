-- V17 workflow additions. Keeps legacy values for existing rows.
alter table public.referrals drop constraint if exists referrals_status_check;
alter table public.referrals add constraint referrals_status_check check (status in (
'new','upcoming','confirmed','mandate','sold','validated','pending','paid','without_follow_up','to_contact','contacted','appointment','closed',
'contact_established','appointment_estimate','under_offer','under_compromise','on_hold'
));
alter table public.remunerations drop constraint if exists remunerations_status_check;
alter table public.remunerations add constraint remunerations_status_check check (status in ('pending','validated','available','paid'));
