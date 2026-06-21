insert into public.clients (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Catalyst', 'catalyst')
on conflict (slug) do update set name = excluded.name;

insert into public.content_accounts (
  id, client_id, platform, platform_account_id, display_name, profile_url, connector_mode
)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'linkedin',
  'willleatherman',
  'Will Leatherman',
  'https://www.linkedin.com/in/willleatherman',
  'seeded'
)
on conflict (platform, platform_account_id) do update
set display_name = excluded.display_name, updated_at = now();
