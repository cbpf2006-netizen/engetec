-- =============================================================================
-- Fim da venda: toda conta nasce liberada
--
-- O Raiz deixou de cobrar. Cadastro não passa mais por aprovação de
-- pagamento nem por indicação — a coluna `acesso` continua existindo (para o
-- dia em que o administrador precisar suspender alguém), só que agora toda
-- conta nova já nasce 'liberado'.
--
-- Junto sai o sistema de indicação inteiro: colunas, funções e a lista de
-- indicadores pública. `listar_indicadores()` já tinha saído na 0009.
-- =============================================================================

alter table public.perfis alter column acesso set default 'liberado';

update public.perfis set acesso = 'liberado', liberado_em = coalesce(liberado_em, now())
 where acesso = 'pendente';

-- =============================================================================
-- Trava dos campos de acesso, sem os campos de indicação (saem da tabela
-- logo abaixo).
-- =============================================================================

create or replace function public.proteger_campos_de_acesso()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon')
     and (
       new.papel is distinct from old.papel
       or new.acesso is distinct from old.acesso
       or new.liberado_em is distinct from old.liberado_em
       or new.liberado_por is distinct from old.liberado_por
     )
  then
    raise exception 'Campo protegido.' using errcode = '42501';
  end if;

  return new;
end;
$$;

-- =============================================================================
-- Cadastro simples: nome e telefone só, sem indicação nenhuma
-- =============================================================================

create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_telefone text;
begin
  v_telefone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefone', ''), '\D', '', 'g');
  if v_telefone !~ '^[0-9]{10,11}$' then
    v_telefone := null;
  end if;

  insert into public.perfis (id, nome, telefone, acesso, liberado_em)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''),
    v_telefone,
    'liberado',
    now()
  )
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

-- =============================================================================
-- Administração: sem "liberar acesso" (nunca mais há pendente) e sem
-- indicado_por na listagem
-- =============================================================================

drop function if exists public.admin_liberar_acesso(uuid);
drop function if exists public.admin_listar_usuarios();

create function public.admin_listar_usuarios()
returns table (
  id uuid,
  nome text,
  email text,
  telefone text,
  papel text,
  acesso text,
  email_confirmado boolean,
  criado_em timestamptz,
  liberado_em timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.e_admin() then
    raise exception 'Sem permissão.' using errcode = '42501';
  end if;

  return query
  select p.id,
         p.nome,
         u.email::text,
         p.telefone,
         p.papel,
         p.acesso,
         (u.email_confirmed_at is not null),
         u.created_at,
         p.liberado_em
    from public.perfis p
    join auth.users u on u.id = p.id
   order by u.created_at desc;
end;
$$;

revoke all on function public.admin_listar_usuarios() from public, anon;
grant execute on function public.admin_listar_usuarios() to authenticated;

-- =============================================================================
-- Sistema de indicação: sai por completo
-- =============================================================================

drop function if exists public.nome_indicador_padrao();
drop function if exists public.minhas_indicacoes();

alter table public.perfis drop constraint if exists perfis_codigo_indicacao_key;
alter table public.perfis drop constraint if exists perfis_indicado_por_tamanho;

alter table public.perfis
  drop column if exists indicado_por,
  drop column if exists indicado_por_id,
  drop column if exists codigo_indicacao;
