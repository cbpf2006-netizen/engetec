-- =============================================================================
-- Raiz — schema inicial
--
-- Convenções
--   · Nomes em português, iguais aos do código (lib/tipos.ts).
--   · Dinheiro em numeric(14,2). Nunca float: 0,1 + 0,2 precisa dar 0,30.
--   · Datas de calendário em `date` (sem fuso). O instante de criação, em
--     timestamptz.
--   · Toda tabela do domínio tem `usuario_id` e RLS ligado. A aplicação usa
--     só a chave anon; quem isola os dados é o banco, não a interface.
--
-- Integridade entre usuários
--   Uma chave estrangeira comum não passa por RLS: alguém poderia lançar uma
--   transação apontando para o modelo de outra pessoa. Por isso as FKs são
--   COMPOSTAS, incluindo `usuario_id` (e, onde existe, `fluxo`) — o banco
--   recusa a referência cruzada sem depender de trigger nem da aplicação.
-- =============================================================================

-- =============================================================================
-- Utilitários
-- =============================================================================

create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- =============================================================================
-- perfis
-- =============================================================================

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "perfis: ler o próprio"
  on public.perfis for select to authenticated
  using (id = (select auth.uid()));

create policy "perfis: atualizar o próprio"
  on public.perfis for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.tocar_atualizado_em();

-- =============================================================================
-- modelos  (as "categorias" de entrada, saída e investimento)
-- =============================================================================

create table if not exists public.modelos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  fluxo text not null check (fluxo in ('entrada', 'saida', 'investimento')),
  nome text not null check (length(btrim(nome)) between 1 and 40),
  icone text not null default 'circulo',
  cor text not null default 'verde',
  ordem smallint not null default 0,
  arquivado boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  -- Alvos das FKs compostas das outras tabelas.
  unique (id, usuario_id),
  unique (id, usuario_id, fluxo),
  -- Dois "Alimentação" na mesma aba viram dois pedaços do mesmo gráfico.
  unique (usuario_id, fluxo, nome)
);

create index if not exists modelos_usuario_fluxo_idx
  on public.modelos (usuario_id, fluxo, ordem);

alter table public.modelos enable row level security;

create policy "modelos: ler os próprios"
  on public.modelos for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "modelos: criar os próprios"
  on public.modelos for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "modelos: atualizar os próprios"
  on public.modelos for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "modelos: excluir os próprios"
  on public.modelos for delete to authenticated
  using (usuario_id = (select auth.uid()));

create trigger modelos_atualizado_em
  before update on public.modelos
  for each row execute function public.tocar_atualizado_em();

-- =============================================================================
-- transacoes  (entradas e saídas)
-- =============================================================================

create table if not exists public.transacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  fluxo text not null check (fluxo in ('entrada', 'saida')),
  modelo_id uuid,
  valor numeric(14, 2) not null check (valor > 0),
  data date not null,
  observacao text check (observacao is null or length(observacao) <= 280),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  -- Dono e fluxo do modelo têm de bater com os da transação.
  constraint transacoes_modelo_fkey
    foreign key (modelo_id, usuario_id, fluxo)
    references public.modelos (id, usuario_id, fluxo)
    -- Apagar um modelo não apaga o histórico: a transação fica "Sem modelo"
    -- e continua somando. Só `modelo_id` é anulado (Postgres 15+), porque
    -- `usuario_id` e `fluxo` são NOT NULL.
    on delete set null (modelo_id),

  unique (id, usuario_id)
);

create index if not exists transacoes_usuario_data_idx
  on public.transacoes (usuario_id, data desc);

create index if not exists transacoes_usuario_fluxo_data_idx
  on public.transacoes (usuario_id, fluxo, data desc);

alter table public.transacoes enable row level security;

create policy "transacoes: ler as próprias"
  on public.transacoes for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "transacoes: criar as próprias"
  on public.transacoes for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "transacoes: atualizar as próprias"
  on public.transacoes for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "transacoes: excluir as próprias"
  on public.transacoes for delete to authenticated
  using (usuario_id = (select auth.uid()));

create trigger transacoes_atualizado_em
  before update on public.transacoes
  for each row execute function public.tocar_atualizado_em();

-- =============================================================================
-- investimentos
--
-- `fluxo` é uma coluna fixa em 'investimento'. Existe só para participar da
-- FK composta e garantir que um aporte não possa apontar para um modelo de
-- despesa.
-- =============================================================================

create table if not exists public.investimentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  fluxo text not null default 'investimento' check (fluxo = 'investimento'),
  operacao text not null default 'aporte' check (operacao in ('aporte', 'resgate')),
  modelo_id uuid,
  valor numeric(14, 2) not null check (valor > 0),
  data date not null,
  observacao text check (observacao is null or length(observacao) <= 280),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint investimentos_modelo_fkey
    foreign key (modelo_id, usuario_id, fluxo)
    references public.modelos (id, usuario_id, fluxo)
    on delete set null (modelo_id)
);

create index if not exists investimentos_usuario_data_idx
  on public.investimentos (usuario_id, data desc);

alter table public.investimentos enable row level security;

create policy "investimentos: ler os próprios"
  on public.investimentos for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "investimentos: criar os próprios"
  on public.investimentos for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "investimentos: atualizar os próprios"
  on public.investimentos for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "investimentos: excluir os próprios"
  on public.investimentos for delete to authenticated
  using (usuario_id = (select auth.uid()));

create trigger investimentos_atualizado_em
  before update on public.investimentos
  for each row execute function public.tocar_atualizado_em();

-- =============================================================================
-- contas  (contas a pagar)
--
-- `status` só tem dois estados reais. "Atrasado" é derivado de vencimento <
-- hoje e vive em lib/financas.ts — gravar o terceiro estado deixaria linhas
-- mentindo até alguém rodar uma rotina de virada de dia.
--
-- Marcar como paga cria a saída correspondente em `transacoes` e guarda o
-- vínculo aqui; desmarcar apaga a saída. É o que impede o valor de entrar no
-- caixa duas vezes.
-- =============================================================================

create table if not exists public.contas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (length(btrim(nome)) between 1 and 60),
  modelo_id uuid,
  valor numeric(14, 2) not null check (valor > 0),
  vencimento date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago')),
  pago_em date,
  transacao_id uuid,
  observacao text check (observacao is null or length(observacao) <= 280),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  -- Pago sem data de pagamento (ou o contrário) seria um estado impossível.
  constraint contas_pagamento_coerente check ((status = 'pago') = (pago_em is not null)),

  constraint contas_modelo_fkey
    foreign key (modelo_id, usuario_id)
    references public.modelos (id, usuario_id)
    on delete set null (modelo_id),

  constraint contas_transacao_fkey
    foreign key (transacao_id, usuario_id)
    references public.transacoes (id, usuario_id)
    on delete set null (transacao_id)
);

create index if not exists contas_usuario_vencimento_idx
  on public.contas (usuario_id, vencimento);

create index if not exists contas_usuario_status_idx
  on public.contas (usuario_id, status, vencimento);

alter table public.contas enable row level security;

create policy "contas: ler as próprias"
  on public.contas for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "contas: criar as próprias"
  on public.contas for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "contas: atualizar as próprias"
  on public.contas for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "contas: excluir as próprias"
  on public.contas for delete to authenticated
  using (usuario_id = (select auth.uid()));

create trigger contas_atualizado_em
  before update on public.contas
  for each row execute function public.tocar_atualizado_em();

-- =============================================================================
-- Pagar / estornar conta
--
-- Marcar uma conta como paga são DUAS escritas (criar a saída e atualizar a
-- conta). Feitas de fora, um erro no meio deixaria uma saída solta no caixa
-- ou uma conta paga sem lançamento. Aqui as duas viram uma transação só.
--
-- `security invoker` (o padrão, explicitado de propósito): as consultas de
-- dentro passam por RLS como o usuário que chamou, então não há como pagar a
-- conta de outra pessoa. A data vem da aplicação — o servidor do banco roda
-- em UTC e viraria o dia três horas antes de quem está no Brasil.
-- =============================================================================

create or replace function public.pagar_conta(p_conta uuid, p_data date)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_conta public.contas;
  v_modelo uuid;
  v_transacao uuid;
begin
  select * into v_conta from public.contas where id = p_conta for update;
  if not found then
    raise exception 'Conta não encontrada.' using errcode = 'no_data_found';
  end if;

  if v_conta.status = 'pago' then
    return v_conta.transacao_id;
  end if;

  -- O modelo da conta só serve à saída se for um modelo de saída.
  select m.id into v_modelo
    from public.modelos m
   where m.id = v_conta.modelo_id and m.fluxo = 'saida';

  insert into public.transacoes (usuario_id, fluxo, modelo_id, valor, data, observacao)
  values (
    v_conta.usuario_id,
    'saida',
    v_modelo,
    v_conta.valor,
    p_data,
    'Pagamento de ' || v_conta.nome
  )
  returning id into v_transacao;

  update public.contas
     set status = 'pago',
         pago_em = p_data,
         transacao_id = v_transacao
   where id = p_conta;

  return v_transacao;
end;
$$;

create or replace function public.estornar_conta(p_conta uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_transacao uuid;
begin
  select transacao_id into v_transacao
    from public.contas
   where id = p_conta
     for update;

  if not found then
    raise exception 'Conta não encontrada.' using errcode = 'no_data_found';
  end if;

  update public.contas
     set status = 'pendente',
         pago_em = null,
         transacao_id = null
   where id = p_conta;

  if v_transacao is not null then
    delete from public.transacoes where id = v_transacao;
  end if;
end;
$$;

revoke all on function public.pagar_conta(uuid, date) from public;
revoke all on function public.estornar_conta(uuid) from public;
grant execute on function public.pagar_conta(uuid, date) to authenticated;
grant execute on function public.estornar_conta(uuid) to authenticated;

-- =============================================================================
-- Primeiro acesso: perfil + modelos padrão
--
-- Sem isto, quem acaba de se cadastrar cairia num app sem nenhuma categoria e
-- teria de inventar a própria taxonomia antes do primeiro lançamento. Os
-- modelos são dados do usuário: podem ser renomeados, recoloridos ou
-- apagados depois.
-- =============================================================================

create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''))
  on conflict (id) do nothing;

  insert into public.modelos (usuario_id, fluxo, nome, icone, cor, ordem)
  values
    (new.id, 'entrada', 'Salário',       'salario',     'verde',    1),
    (new.id, 'entrada', 'Freelance',     'notebook',    'ciano',    2),
    (new.id, 'entrada', 'Mesada',        'presente',    'violeta',  3),
    (new.id, 'entrada', 'Outros',        'circulo',     'cinza',    4),

    (new.id, 'saida',   'Alimentação',   'restaurante', 'ambar',    1),
    (new.id, 'saida',   'Moradia',       'casa',        'ciano',    2),
    (new.id, 'saida',   'Transporte',    'carro',       'violeta',  3),
    (new.id, 'saida',   'Lazer',         'lazer',       'rosa',     4),
    (new.id, 'saida',   'Saúde',         'saude',       'turquesa', 5),
    (new.id, 'saida',   'Educação',      'educacao',    'indigo',   6),
    (new.id, 'saida',   'Assinaturas',   'assinatura',  'oliva',    7),
    (new.id, 'saida',   'Outros',        'circulo',     'cinza',    8),

    (new.id, 'investimento', 'Renda fixa', 'cofre',     'verde',    1),
    (new.id, 'investimento', 'Ações',      'grafico',   'ciano',    2),
    (new.id, 'investimento', 'FIIs',       'casa',      'violeta',  3),
    (new.id, 'investimento', 'ETFs',       'banco',     'ambar',    4),
    (new.id, 'investimento', 'Cripto',     'moeda',     'turquesa', 5),
    (new.id, 'investimento', 'Outros',     'circulo',   'cinza',    6)
  on conflict (usuario_id, fluxo, nome) do nothing;

  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.ao_criar_usuario();
