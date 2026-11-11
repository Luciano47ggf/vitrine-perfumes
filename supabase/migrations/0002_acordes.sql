-- Acordes principais (ex.: amadeirado 100, cítrico 85, aromático 70...)
-- Execute depois do 0001_init.sql. Pode rodar mais de uma vez sem problema.

alter table public.products
  add column if not exists accords jsonb not null default '[]'::jsonb;

alter table public.products drop constraint if exists products_accords_check;
alter table public.products add constraint products_accords_check check (
  jsonb_typeof(accords) = 'array' and jsonb_array_length(accords) <= 12
);
