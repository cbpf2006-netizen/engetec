-- Caixa da Engetec: lançamentos manuais de receita e despesa.
-- RLS fica ligado sem nenhuma policy — só a service role (usada só no
-- servidor, nunca no navegador) consegue ler ou escrever aqui. A chave
-- pública (anon) não tem acesso nenhum a esta tabela.

create table if not exists public.movimentacoes_financeiras (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  categoria text not null,
  valor numeric(12, 2) not null check (valor > 0),
  observacoes text not null default '',
  forma_pagamento text not null check (
    forma_pagamento in ('dinheiro', 'pix', 'debito', 'credito', 'boleto', 'transferencia')
  ),
  status text not null default 'pago' check (status in ('pendente', 'pago', 'atrasado')),
  criado_em timestamptz not null default now()
);

create index if not exists movimentacoes_financeiras_data_idx
  on public.movimentacoes_financeiras (data);

alter table public.movimentacoes_financeiras enable row level security;
