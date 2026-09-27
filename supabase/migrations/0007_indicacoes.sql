-- =============================================================================
-- Indicações
--
-- Cada conta ganha um código de indicação próprio (`codigo_indicacao`), gerado
-- no cadastro. O link que a pessoa compartilha (/comecar?ref=CODIGO) leva quem
-- clica à página de apresentação, não direto ao app — o cadastro de lá já
-- chega com o código, e o novo cadastro guarda o QUEM indicou como referência
-- (`indicado_por_id`), não mais como texto livre.
--
-- Quem se cadastra sem link escolhe o indicador de uma LISTA fechada — só
-- contas com acesso liberado aparecem — em vez de digitar um nome qualquer.
-- Isso é o que `listar_indicadores()` entrega, sem sessão nenhuma (o cadastro
-- ainda não tem uma).
--
-- `indicado_por` (texto) continua existindo: é o nome resolvido no momento do
-- cadastro, guardado ao lado do id, para a área Administrar continuar lendo
-- um texto pronto sem precisar de mais um JOIN.
-- =============================================================================

alter table public.perfis
  add column if not exists codigo_indicacao text,
  add column if not exists indicado_por_id uuid references auth.users (id) on delete set null;

alter table public.perfis drop constraint if exists perfis_codigo_indicacao_key;
alter table public.perfis
  add constraint perfis_codigo_indicacao_key unique (codigo_indicacao);

-- Backfill: toda conta que já existia ganha um código.
update public.perfis
   set codigo_indicacao = lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
 where codigo_indicacao is null;

alter table public.perfis alter column codigo_indicacao set not null;

-- =============================================================================
-- Trava dos campos de acesso: acrescenta indicado_por_id e codigo_indicacao à
-- lista que o próprio dono da conta não pode alterar via UPDATE (mesma trava
-- de supabase/migrations/0005_acesso_e_administracao.sql, com dois campos a
-- mais).
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
       or new.indicado_por is distinct from old.indicado_por
       or new.indicado_por_id is distinct from old.indicado_por_id
       or new.codigo_indicacao is distinct from old.codigo_indicacao
     )
  then
    raise exception 'Campo protegido.' using errcode = '42501';
  end if;

  return new;
end;
$$;

-- =============================================================================
-- Cadastro: gera o código de quem se cadastra e resolve quem indicou
--
-- O metadado passa a ser `codigo_indicacao` (o código de QUEM indicou, nunca
-- mais um nome livre). Resolvido aqui, com o privilégio do trigger: um código
-- que não bate com ninguém de acesso liberado simplesmente não vira indicação
-- — sem erro para quem está se cadastrando.
-- =============================================================================

create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_telefone text;
  v_codigo text;
  v_indicador_id uuid;
  v_indicador_nome text;
  v_meu_codigo text;
  v_tentativas int := 0;
begin
  v_telefone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefone', ''), '\D', '', 'g');
  if v_telefone !~ '^[0-9]{10,11}$' then
    v_telefone := null;
  end if;

  v_codigo := nullif(lower(btrim(coalesce(new.raw_user_meta_data ->> 'codigo_indicacao', ''))), '');

  if v_codigo is not null then
    select p.id, coalesce(p.nome, 'Sem nome')
      into v_indicador_id, v_indicador_nome
      from public.perfis p
     where p.codigo_indicacao = v_codigo and p.acesso = 'liberado';
  end if;

  -- Colisão do código próprio é astronomicamente improvável (16^8 combinações
  -- para umas poucas dezenas de contas), mas a trava existe para não deixar o
  -- cadastro inteiro falhar se acontecer.
  loop
    v_meu_codigo := lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.perfis (id, nome, telefone, indicado_por, indicado_por_id, codigo_indicacao)
      values (
        new.id,
        nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''),
        v_telefone,
        v_indicador_nome,
        v_indicador_id,
        v_meu_codigo
      )
      on conflict (id) do nothing;
      exit;
    exception when unique_violation then
      v_tentativas := v_tentativas + 1;
      if v_tentativas >= 5 then
        raise;
      end if;
    end;
  end loop;

  return new;
end;
$$;

-- =============================================================================
-- Indicadores — quem pode aparecer na lista de "quem te indicou"
--
-- Só id, nome e o próprio código: nada de e-mail, telefone ou qualquer outro
-- dado. Executável sem sessão (anon): o cadastro ainda não tem uma.
-- =============================================================================

create or replace function public.listar_indicadores()
returns table (id uuid, nome text, codigo_indicacao text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, coalesce(p.nome, 'Sem nome'), p.codigo_indicacao
    from public.perfis p
   where p.acesso = 'liberado'
   order by p.nome nulls last;
$$;

revoke all on function public.listar_indicadores() from public;
grant execute on function public.listar_indicadores() to anon, authenticated;

-- =============================================================================
-- Minhas indicações — quem cada pessoa indicou, e se já pagou
-- =============================================================================

create or replace function public.minhas_indicacoes()
returns table (id uuid, nome text, acesso text, criado_em timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, coalesce(p.nome, 'Sem nome'), p.acesso, p.criado_em
    from public.perfis p
   where p.indicado_por_id = (select auth.uid())
   order by p.criado_em desc;
$$;

revoke all on function public.minhas_indicacoes() from public, anon;
grant execute on function public.minhas_indicacoes() to authenticated;

-- =============================================================================
-- Indicador padrão — quem aparece pré-selecionado em "quem te indicou" quando
-- ninguém chegou por um link de indicação (a conta administradora, dona do
-- produto, em vez de "ninguém"). Se não houver administrador liberado, o
-- cadastro simplesmente cai de volta em "ninguém me indicou".
-- =============================================================================

create or replace function public.codigo_indicacao_padrao()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.codigo_indicacao
    from public.perfis p
   where p.papel = 'admin' and p.acesso = 'liberado'
   order by p.criado_em asc
   limit 1;
$$;

revoke all on function public.codigo_indicacao_padrao() from public;
grant execute on function public.codigo_indicacao_padrao() to anon, authenticated;
