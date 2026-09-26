import type { Metadata } from "next";
import Link from "next/link";

import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { ListaDeUsuarios } from "@/components/app/ListaDeUsuarios";
import { listarUsuarios, type UsuarioAdmin } from "@/lib/dados/admin";
import { exigirAdmin } from "@/lib/dados/sessao";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Administrar" };

/* Só o administrador entra aqui: `exigirAdmin` devolve 404 para todo o resto,
   e o Postgres recusa a leitura mesmo que alguém contorne a página. */

const ABAS = [
  { valor: "usuarios", rotulo: "Usuários" },
  { valor: "pendentes", rotulo: "Usuários pendentes" },
] as const;

/** Quem lê primeiro: a própria conta (fixada no topo), depois os demais
    administradores, depois o resto do mais novo para o mais antigo. */
function ordenar(usuarios: UsuarioAdmin[], meuId: string): UsuarioAdmin[] {
  const peso = (usuario: UsuarioAdmin) =>
    usuario.id === meuId ? 0 : usuario.papel === "admin" ? 1 : 2;

  return [...usuarios].sort(
    (a, b) => peso(a) - peso(b) || b.criado_em.localeCompare(a.criado_em)
  );
}

export default async function PaginaAdministrar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const eu = await exigirAdmin();

  const parametros = await searchParams;
  const bruto = Array.isArray(parametros.aba) ? parametros.aba[0] : parametros.aba;
  const aba = bruto === "pendentes" ? "pendentes" : "usuarios";

  const todos = await listarUsuarios();
  const ativos = ordenar(
    todos.filter((usuario) => usuario.acesso === "liberado"),
    eu.id
  );
  const pendentes = todos.filter((usuario) => usuario.acesso === "pendente");

  const contagens = { usuarios: ativos.length, pendentes: pendentes.length };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo="Administrar"
        apoio="Quem usa o Raiz e quem está esperando a liberação do acesso."
      />

      <Bloco
        titulo={aba === "pendentes" ? "Usuários pendentes" : "Usuários"}
        descricao={
          aba === "pendentes"
            ? "Aguardam o pagamento. Libere depois de conferi-lo, ou recuse o cadastro."
            : "Quem já tem acesso ao Raiz."
        }
        semPadding
      >
        <div className="px-5 pb-4">
          <div
            role="tablist"
            aria-label="Filtrar usuários"
            className="rolagem-fina flex items-center gap-0.5 overflow-x-auto rounded-xl bg-secondary p-1"
          >
            {ABAS.map((opcao) => (
              <Link
                key={opcao.valor}
                role="tab"
                aria-selected={aba === opcao.valor}
                href={opcao.valor === "usuarios" ? "/administrar" : "/administrar?aba=pendentes"}
                scroll={false}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-all duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  aba === opcao.valor
                    ? "bg-card text-foreground shadow-cartao ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opcao.rotulo}
                <span className="numero text-xs text-muted-foreground">
                  {contagens[opcao.valor]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border">
          <ListaDeUsuarios
            usuarios={aba === "pendentes" ? pendentes : ativos}
            meuId={eu.id}
            modo={aba}
            vazio={
              aba === "pendentes"
                ? {
                    titulo: "Nenhum usuário pendente",
                    descricao: "Quando alguém se cadastrar e aguardar o pagamento, aparece aqui.",
                  }
                : { titulo: "Nenhum usuário ainda", descricao: "Quem tiver o acesso liberado aparece aqui." }
            }
          />
        </div>
      </Bloco>
    </div>
  );
}
