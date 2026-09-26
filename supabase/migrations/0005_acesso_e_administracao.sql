-- =============================================================================
-- Acesso pago e administração
--
-- Cada conta nasce PENDENTE. O administrador libera o acesso à mão, depois de
-- confirmar o pagamento. Enquanto pendente, a conta consegue entrar (o e-mail
-- foi confirmado) mas não lê nem escreve em nenhuma tabela do domínio.
--
-- Onde isto é garantido: no BANCO, não só na tela. Uma policy RESTRITIVA em
-- cada tabela exige `tem_acesso()`; ela se soma (AND) às policies permissivas
-- que já existiam, sem reescrevê-las. Esconder a interface não bastaria: a
-- chave anon e o token de sessão ficam no navegador, e qualquer pessoa pode
-- chamar a API do Supabase direto.
--
-- `papel` e `acesso` são protegidos por trigger: a policy de update do perfil
-- deixa a pessoa editar a própria linha, e sem essa trava ela poderia se
-- promover a administrador com um UPDATE.
-- =============================================================================

alter table public.perfis
  add column if not exists papel text not null default 'usuario',
  add column if not exists acesso text not null default 'pendente',
  add column if not exists indicado_por text,
  add column if not exists liberado_em timestamptz,
  add column if not exists liberado_por uuid references auth.users (id) on delete set null;

alter table public.perfis drop constraint if exists perfis_papel_valido;
alter table public.perfis
  add constraint perfis_papel_valido check (papel in ('admin', 'usuario'));

alter table public.perfis drop constraint if exists perfis_acesso_valido;
alter table public.perfis
  add constraint perfis_acesso_valido check (acesso in ('pendente', 'liberado'));

alter table public.perfis drop constraint if exists perfis_indicado_por_tamanho;
alter table public.perfis
  add constraint perfis_indicado_por_tamanho
  check (indicado_por is null or length(indicado_por) between 1 and 80);

-- Contas criadas antes do trigger `ao_criar_usuario` não têm linha em `perfis`.
-- Sem ela, a policy restritiva abaixo trancaria essas contas para fora do app
-- (nenhuma linha => `tem_acesso()` falso). Cria o perfil que faltava.
insert into public.perfis (id, nome, acesso, liberado_em)
select u.id, nullif(btrim(u.raw_user_meta_data ->> 'nome'), ''), 'liberado', now()
from auth.users u
where not exists (select 1 from public.perfis p where p.id = u.id);

-- Quem já existia antes desta migration usa o app: fica liberado. O default
-- 'pendente' vale só para as contas criadas daqui em diante.
update public.perfis
   set acesso = 'liberado', liberado_em = coalesce(liberado_em, now())
 where acesso = 'pendente';

-- A conta mais antiga é a do dono do app: vira administradora.
update public.perfis
   set papel = 'admin'
 where id = (select id from auth.users order by created_at asc limit 1);

-- =============================================================================
-- Funções de permissão
-- =============================================================================

create or replace function public.e_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
     where id = (select auth.uid()) and papel = 'admin'
  );
$$;

create or replace function public.tem_acesso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
     where id = (select auth.uid()) and acesso = 'liberado'
  );
$$;

revoke all on function public.e_admin() from public, anon;
revoke all on function public.tem_acesso() from public, anon;
grant execute on function public.e_admin() to authenticated;
grant execute on function public.tem_acesso() to authenticated;

-- =============================================================================
-- Trava dos campos de acesso
--
-- SECURITY INVOKER de propósito: `current_user` é o papel de quem executa o
-- UPDATE. Vindo da API (chave anon + sessão) é `authenticated`; dentro de
-- `admin_liberar_acesso` (security definer) é o dono da função.
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
     )
  then
    raise exception 'Campo protegido.' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists perfis_proteger_acesso on public.perfis;
create trigger perfis_proteger_acesso
  before update on public.perfis
  for each row execute function public.proteger_campos_de_acesso();

-- =============================================================================
-- Nenhuma tabela do domínio sem acesso liberado
-- =============================================================================

create policy "acesso liberado" on public.modelos
  as restrictive for all to authenticated
  using ((select public.tem_acesso()))
  with check ((select public.tem_acesso()));

create policy "acesso liberado" on public.transacoes
  as restrictive for all to authenticated
  using ((select public.tem_acesso()))
  with check ((select public.tem_acesso()));

create policy "acesso liberado" on public.investimentos
  as restrictive for all to authenticated
  using ((select public.tem_acesso()))
  with check ((select public.tem_acesso()));

create policy "acesso liberado" on public.contas
  as restrictive for all to authenticated
  using ((select public.tem_acesso()))
  with check ((select public.tem_acesso()));

create policy "acesso liberado" on public.carteiras
  as restrictive for all to authenticated
  using ((select public.tem_acesso()))
  with check ((select public.tem_acesso()));

-- =============================================================================
-- Administração
-- =============================================================================

create or replace function public.admin_listar_usuarios()
returns table (
  id uuid,
  nome text,
  email text,
  telefone text,
  indicado_por text,
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
         p.indicado_por,
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

create or replace function public.admin_liberar_acesso(p_usuario uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.e_admin() then
    raise exception 'Sem permissão.' using errcode = '42501';
  end if;

  update public.perfis
     set acesso = 'liberado',
         liberado_em = now(),
         liberado_por = (select auth.uid())
   where id = p_usuario and acesso = 'pendente';

  if not found then
    raise exception 'Usuário não encontrado ou já liberado.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_listar_usuarios() from public, anon;
revoke all on function public.admin_liberar_acesso(uuid) from public, anon;
grant execute on function public.admin_listar_usuarios() to authenticated;
grant execute on function public.admin_liberar_acesso(uuid) to authenticated;

-- =============================================================================
-- Cadastro: telefone e "quem indicou" vêm dos metadados do signUp
--
-- Só nome, telefone e indicação são lidos dos metadados. `papel` e `acesso`
-- NUNCA: os metadados são escritos pelo próprio cliente no cadastro, e ler
-- privilégio de lá seria entregar a chave do cofre a quem se cadastra.
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
