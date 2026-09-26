-- =============================================================================
-- Carteiras — onde o dinheiro de cada movimentação ficou
--
-- Uma carteira é só um nome ("Mão", "Santander"). Não guarda saldo próprio:
-- o saldo de uma carteira é a soma dos lançamentos que apontam para ela, e
-- duplicar esse número numa coluna seria criar duas verdades.
--
-- `carteira_id` é NULLABLE nas movimentações de propósito. A interface exige
-- a carteira em todo lançamento novo, mas os lançamentos criados antes desta
-- migration não têm como adivinhar uma — e apagá-los ou inventar uma carteira
-- para eles seria pior que deixá-los sem.
-- =============================================================================

create table if not exists public.carteiras (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (length(btrim(nome)) between 1 and 40),
  ordem smallint not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  -- Alvo da FK composta das movimentações.
  unique (id, usuario_id),
  -- Duas "Santander" na lista seriam indistinguíveis no seletor.
  unique (usuario_id, nome)
);

create index if not exists carteiras_usuario_idx
  on public.carteiras (usuario_id, ordem);

alter table public.carteiras enable row level security;

create policy "carteiras: ler as próprias"
  on public.carteiras for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "carteiras: criar as próprias"
  on public.carteiras for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "carteiras: atualizar as próprias"
  on public.carteiras for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "carteiras: excluir as próprias"
  on public.carteiras for delete to authenticated
  using (usuario_id = (select auth.uid()));

create trigger carteiras_atualizado_em
  before update on public.carteiras
  for each row execute function public.tocar_atualizado_em();

-- =============================================================================
-- Ligação com as movimentações
--
-- FK COMPOSTA com `usuario_id`, como as de modelo: uma FK simples não passa
-- por RLS e deixaria alguém apontar para a carteira de outra pessoa.
-- =============================================================================

alter table public.transacoes
  add column if not exists carteira_id uuid;

alter table public.transacoes
  drop constraint if exists transacoes_carteira_fkey;

alter table public.transacoes
  add constraint transacoes_carteira_fkey
  foreign key (carteira_id, usuario_id)
  references public.carteiras (id, usuario_id)
  -- Excluir a carteira não apaga o histórico: os lançamentos ficam "Sem
  -- carteira" e continuam somando no caixa.
  on delete set null (carteira_id);

create index if not exists transacoes_carteira_idx
  on public.transacoes (usuario_id, carteira_id);

alter table public.investimentos
  add column if not exists carteira_id uuid;

alter table public.investimentos
  drop constraint if exists investimentos_carteira_fkey;

alter table public.investimentos
  add constraint investimentos_carteira_fkey
  foreign key (carteira_id, usuario_id)
  references public.carteiras (id, usuario_id)
  on delete set null (carteira_id);

create index if not exists investimentos_carteira_idx
  on public.investimentos (usuario_id, carteira_id);
