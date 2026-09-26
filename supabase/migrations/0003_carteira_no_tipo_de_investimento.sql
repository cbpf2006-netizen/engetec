-- =============================================================================
-- A carteira de um investimento passa a ser do TIPO, não do aporte
--
-- A pessoa escolhe a carteira uma vez, ao criar o tipo ("CDB" → Santander), e
-- todo aporte e resgate desse tipo herda. Guardar a carteira também em cada
-- lançamento criaria duas verdades: trocar a carteira do tipo deixaria os
-- aportes antigos apontando para a antiga.
--
-- Entradas e saídas continuam com `carteira_id` na própria transação — ali
-- cada lançamento pode ter saído de uma carteira diferente.
-- =============================================================================

alter table public.modelos
  add column if not exists carteira_id uuid;

alter table public.modelos
  drop constraint if exists modelos_carteira_fkey;

alter table public.modelos
  add constraint modelos_carteira_fkey
  foreign key (carteira_id, usuario_id)
  references public.carteiras (id, usuario_id)
  -- Excluir a carteira não apaga o tipo: ele fica "sem carteira".
  on delete set null (carteira_id);

-- Só tipos de investimento têm carteira.
alter table public.modelos
  drop constraint if exists modelos_carteira_so_investimento;

alter table public.modelos
  add constraint modelos_carteira_so_investimento
  check (carteira_id is null or fluxo = 'investimento');

create index if not exists modelos_carteira_idx
  on public.modelos (usuario_id, carteira_id)
  where carteira_id is not null;

-- A coluna criada na 0002 fica sem função. Estava vazia em todas as contas
-- (a interface nunca chegou a gravá-la em produção), então sai sem perda.
alter table public.investimentos
  drop constraint if exists investimentos_carteira_fkey;

drop index if exists public.investimentos_carteira_idx;

alter table public.investimentos
  drop column if exists carteira_id;
