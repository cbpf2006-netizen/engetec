-- =============================================================================
-- Remove a lista pública de indicadores
--
-- "Quem te indicou" deixou de ser uma lista aberta de todo mundo com acesso
-- liberado — agora só mostra o nome de quem compartilhou o link (ou a conta
-- administradora, por padrão) e a opção "Nenhum". Sem uso, listar_indicadores()
-- só continuaria expondo nome de todo cliente pago pra qualquer chamada
-- anônima — por isso sai, e não só de código.
-- =============================================================================

drop function if exists public.listar_indicadores();
