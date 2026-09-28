import type { Metadata } from "next";

import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { ListaDeUsuarios } from "@/components/app/ListaDeUsuarios";
import { listarUsuarios, type UsuarioAdmin } from "@/lib/dados/admin";
import { exigirAdmin } from "@/lib/dados/sessao";

export const metadata: Metadata = { title: "Administrar" };

/* Só o administrador entra aqui: `exigirAdmin` devolve 404 para todo o resto,
   e o Postgres recusa a leitura mesmo que alguém contorne a página. */

/** Quem lê primeiro: a própria conta (fixada no topo), depois os demais
    administradores, depois o resto do mais novo para o mais antigo. */
function ordenar(usuarios: UsuarioAdmin[], meuId: string): UsuarioAdmin[] {
  const peso = (usuario: UsuarioAdmin) =>
    usuario.id === meuId ? 0 : usuario.papel === "admin" ? 1 : 2;

  return [...usuarios].sort(
    (a, b) => peso(a) - peso(b) || b.criado_em.localeCompare(a.criado_em)
  );
}

export default async function PaginaAdministrar() {
  const eu = await exigirAdmin();
  const usuarios = ordenar(await listarUsuarios(), eu.id);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina titulo="Administrar" apoio="Quem usa o Raiz." />

      <Bloco titulo="Usuários" descricao="Quem já tem acesso ao Raiz." semPadding>
        <ListaDeUsuarios
          usuarios={usuarios}
          meuId={eu.id}
          vazio={{ titulo: "Nenhum usuário ainda", descricao: "Quem se cadastrar aparece aqui." }}
        />
      </Bloco>
    </div>
  );
}
