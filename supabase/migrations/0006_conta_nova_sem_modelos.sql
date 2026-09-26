-- =============================================================================
-- Conta nova nasce vazia
--
-- Antes, todo cadastro recebia 18 modelos prontos (entrada, saída e
-- investimento). Agora a conta começa sem modelo, sem tipo de investimento e
-- sem carteira: quem se cadastra cria o que precisa, e a taxonomia é dele
-- desde o primeiro lançamento.
--
-- O perfil continua sendo criado aqui (nome, telefone e indicação vindos dos
-- metadados do cadastro). Só as linhas em `modelos` saem.
-- =============================================================================

create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_telefone text;
  v_indicado text;
begin
  v_telefone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'telefone', ''), '\D', '', 'g');
  if v_telefone !~ '^[0-9]{10,11}$' then
    v_telefone := null;
  end if;

  v_indicado := nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'indicado_por', '')), 80), '');

  insert into public.perfis (id, nome, telefone, indicado_por)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''),
    v_telefone,
    v_indicado
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Contas pendentes já criadas: nunca puderam usar o app (a policy restritiva de
-- acesso barra tudo), então os modelos que receberam são só o padrão antigo e
-- saem sem perder nada. Contas com acesso liberado não são tocadas.
delete from public.modelos m
 using public.perfis p
 where p.id = m.usuario_id
   and p.acesso = 'pendente';
