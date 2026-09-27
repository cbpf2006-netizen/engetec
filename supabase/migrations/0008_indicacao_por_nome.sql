-- =============================================================================
-- Indicação por nome, não por código
--
-- O link de indicação (/comecar?ref=...) passa a levar o NOME de quem indicou,
-- exatamente como está cadastrado, em vez do código hexadecimal aleatório.
-- `codigo_indicacao` continua existindo na tabela (histórico, unicidade), mas
-- deixa de ser usado por este fluxo.
--
-- Casar por nome é mais frágil que por código (dois usuários podem ter o
-- mesmo nome) — por isso o trigger pega a conta liberada mais antiga com
-- aquele nome exato (comparação sem diferenciar maiúsculas/espaços nas
-- pontas, mas preservando acentos).
-- =============================================================================

create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_telefone text;
  v_nome_indicador text;
  v_indicador_id uuid;
  v_indicador_nome text;
  v_meu_codigo text;
  v_tentativas int := 0;
begin
  v_telefone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefone', ''), '\D', '', 'g');
  if v_telefone !~ '^[0-9]{10,11}$' then
    v_telefone := null;
  end if;

  v_nome_indicador := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nome_indicador', '')), '');

  if v_nome_indicador is not null then
    select p.id, p.nome
      into v_indicador_id, v_indicador_nome
      from public.perfis p
     where lower(btrim(p.nome)) = lower(v_nome_indicador) and p.acesso = 'liberado'
     order by p.criado_em asc
     limit 1;
  end if;

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
-- Indicador padrão pelo nome — quem aparece pré-selecionado quando ninguém
-- chegou por um link de indicação. Substitui codigo_indicacao_padrao().
-- =============================================================================

create or replace function public.nome_indicador_padrao()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.nome
    from public.perfis p
   where p.papel = 'admin' and p.acesso = 'liberado'
   order by p.criado_em asc
   limit 1;
$$;

revoke all on function public.nome_indicador_padrao() from public;
grant execute on function public.nome_indicador_padrao() to anon, authenticated;

drop function if exists public.codigo_indicacao_padrao();

-- =============================================================================
-- Lista de indicadores sem o código: a seleção no cadastro passa a valer pelo
-- nome (`id` só para a key do React).
-- =============================================================================

drop function if exists public.listar_indicadores();

create function public.listar_indicadores()
returns table (id uuid, nome text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, coalesce(p.nome, 'Sem nome')
    from public.perfis p
   where p.acesso = 'liberado'
   order by p.nome nulls last;
$$;

revoke all on function public.listar_indicadores() from public;
grant execute on function public.listar_indicadores() to anon, authenticated;
