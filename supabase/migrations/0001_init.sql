-- =====================================================================
-- VITRINE DE PERFUMES — banco de dados
-- Execute este arquivo inteiro no SQL Editor do Supabase (uma vez).
-- Preços em CENTAVOS (integer) para evitar erros de arredondamento.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ADMINISTRADORES: só usuários listados aqui gerenciam a loja
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- CONFIGURAÇÕES DA LOJA (linha única)
-- ---------------------------------------------------------------------
create table if not exists public.store_settings (
  id          smallint primary key default 1 check (id = 1),
  store_name  text not null default 'Rafael' check (char_length(trim(store_name)) between 1 and 80),
  tagline     text not null default 'Perfumaria masculina' check (char_length(tagline) <= 60),
  whatsapp    text check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'),
  instagram   text check (instagram is null or char_length(instagram) <= 60),
  updated_at  timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- PRODUTOS
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(trim(name)) between 1 and 120),
  brand         text not null default '' check (char_length(brand) <= 80),
  volume_ml     integer check (volume_ml is null or (volume_ml > 0 and volume_ml <= 5000)),
  description   text not null default '' check (char_length(description) <= 2000),
  price_cents   integer check (price_cents is null or price_cents >= 0),
  image_path    text,
  is_available  boolean not null default true,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_name_idx on public.products (lower(name));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.store_settings;
create trigger settings_touch before update on public.store_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- SEGURANÇA (RLS)
-- Visitantes: só leitura de produtos e configurações.
-- Escrita: somente administradores.
-- ---------------------------------------------------------------------
alter table public.admins         enable row level security;
alter table public.store_settings enable row level security;
alter table public.products       enable row level security;

drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists settings_read on public.store_settings;
create policy settings_read on public.store_settings for select to anon, authenticated using (true);
drop policy if exists settings_write on public.store_settings;
create policy settings_write on public.store_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_read on public.products;
create policy products_read on public.products for select to anon, authenticated using (true);
drop policy if exists products_admin on public.products;
create policy products_admin on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.admins from anon;
revoke insert, update, delete on public.products, public.store_settings from anon;

-- ---------------------------------------------------------------------
-- STORAGE: imagens com leitura pública; envio e remoção só por admin
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

drop policy if exists "imagens leitura publica" on storage.objects;
create policy "imagens leitura publica" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "imagens admin insere" on storage.objects;
create policy "imagens admin insere" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "imagens admin altera" on storage.objects;
create policy "imagens admin altera" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "imagens admin remove" on storage.objects;
create policy "imagens admin remove" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------------------
-- DEPOIS de criar seu usuário em Authentication > Users, torne-o admin:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'seu-email@exemplo.com';
-- ---------------------------------------------------------------------
