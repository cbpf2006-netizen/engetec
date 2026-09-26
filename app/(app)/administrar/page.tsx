import type { Metadata } from "next";
import Link from "next/link";

import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { ListaDeUsuarios } from "@/components/app/ListaDeUsuarios";
import { listarUsuarios } from "@/lib/dados/admin";
import { exigirAdmin } from "@/lib/dados/sessao";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Administrar" };

/* Só o administrador entra aqui: `exigirAdmin` devolve 404 para todo o resto,
   e o Postgres recusa a leitura mesmo que alguém contorne a página. */

const ABAS = [
  { valor: "todos", rotulo: "Todos os usuários" },
  { valor: "pendentes", rotulo: "Usuários pendentes" },
] as const;

export default async function PaginaAdministrar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigirAdmin();

  const parametros = await searchParams;
  const bruto = Array.isArray(parametros.aba) ? parametros.aba[0] : parametros.aba;
  const aba = bruto === "pendentes" ? "pendentes" : "todos";

  const usuarios = await listarUsuarios();
  const pendentes = usuarios.filter((usuario) => usuario.acesso === "pendente");
  const visiveis = aba === "pendentes" ? pendentes : usuarios;

  const contagens = { todos: usuarios.length, pendentes: pendentes.length };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo="Administrar"
        apoio="Quem usa o Raiz e quem está esperando a liberação do acesso."
      />

      <Bloco
        titulo={aba === "pendentes" ? "Usuários pendentes" : "Todos os usuários"}
        descricao={
          aba === "pendentes"
            ? "Aguardam o pagamento. Libere depois de conferi-lo."
            : "Todas as contas, com o status de acesso de cada uma."
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
                href={opcao.valor === "todos" ? "/administrar" : "/administrar?aba=pendentes"}
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
            usuarios={visiveis}
            vazio={
              aba === "pendentes"
                ? {
                    titulo: "Nenhum usuário pendente",
                    descricao:
                      "Quando alguém se cadastrar e aguardar o pagamento, aparece aqui.",
                  }
                : { titulo: "Nenhum usuário ainda", descricao: "As contas criadas aparecem aqui." }
            }
          />
        </div>
      </Bloco>
    </div>
  );
}
