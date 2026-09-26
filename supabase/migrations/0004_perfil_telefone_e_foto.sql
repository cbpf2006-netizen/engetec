-- =============================================================================
-- Perfil: telefone e foto
--
-- `telefone` guarda só os dígitos (DDD + número, 10 ou 11) — a máscara é da
-- interface. `foto_path` é o caminho do arquivo no bucket `avatars`; a URL
-- pública é derivada dele, não gravada, para trocar de domínio de storage não
-- exigir migração de dados.
--
-- O bucket é público para leitura (a foto aparece no menu de toda tela e não
-- vale a pena assinar uma URL a cada renderização), mas só o dono escreve: as
-- policies exigem que a primeira pasta do caminho seja o próprio `auth.uid()`.
-- O nome do arquivo muda a cada envio, o que dispensa invalidar cache.
-- =============================================================================

alter table public.perfis
  add column if not exists telefone text,
  add column if not exists foto_path text;

alter table public.perfis drop constraint if exists perfis_telefone_formato;
alter table public.perfis
  add constraint perfis_telefone_formato
  check (telefone is null or telefone ~ '^[0-9]{10,11}$');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 524288, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars: ler os proprios" on storage.objects;
create policy "avatars: ler os proprios"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars: enviar os proprios" on storage.objects;
create policy "avatars: enviar os proprios"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars: atualizar os proprios" on storage.objects;
create policy "avatars: atualizar os proprios"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "avatars: excluir os proprios" on storage.objects;
create policy "avatars: excluir os proprios"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
