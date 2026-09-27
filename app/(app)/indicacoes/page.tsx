import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, Clock, Gift, UserRound, Users } from "lucide-react";

import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { CartaoIndicador } from "@/components/app/CartaoIndicador";
import { EstadoVazio } from "@/components/app/EstadoVazio";
import { LinkDeIndicacao } from "@/components/app/LinkDeIndicacao";
import { minhasIndicacoes } from "@/lib/dados/indicacoes";
import { perfilAtual } from "@/lib/dados/sessao";
import { data as formatarData } from "@/lib/formato";
import { VALOR_POR_INDICACAO } from "@/lib/pagamento";

export const metadata: Metadata = { title: "Indicações" };

export default async function PaginaDeIndicacoes() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");

  const indicados = await minhasIndicacoes();
  const pagando = indicados.filter((i) => i.acesso === "liberado");
  const aguardando = indicados.filter((i) => i.acesso === "pendente");

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo="Indicações"
        apoio="Compartilhe o Raiz e ganhe por cada pessoa que você trouxer."
      />

      <Bloco
        titulo="Seu link de indicação"
        descricao="Quem entra por ele já chega sabendo o que é o Raiz — e, ao criar a conta, você já aparece como quem indicou."
      >
        <LinkDeIndicacao nome={perfil.nome?.trim() || perfil.email.split("@")[0]} />
      </Bloco>

      <CartaoIndicador
        rotulo="Você ganha por indicação"
        quantia={VALOR_POR_INDICACAO}
        icone={Gift}
        tom="entrada"
        contexto="Por cada pessoa que você indicar e que pagar o acesso."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ContagemDeIndicados
          rotulo="Indicados pagando"
          quantidade={pagando.length}
          icone={BadgeCheck}
          tom="entrada"
        />
        <ContagemDeIndicados
          rotulo="Aguardando pagamento"
          quantidade={aguardando.length}
          icone={Clock}
          tom="alerta"
        />
      </div>

      <Bloco
        titulo="Quem você indicou"
        descricao={
          indicados.length > 0
            ? "Do mais recente para o mais antigo."
            : "Compartilhe o link acima — quem se cadastrar por ele aparece aqui."
        }
        semPadding
      >
        {indicados.length === 0 ? (
          <EstadoVazio
            icone={Users}
            titulo="Ninguém ainda"
            descricao="Assim que alguém se cadastrar pelo seu link, aparece nesta lista."
            compacto
          />
        ) : (
          <ul className="divide-y divide-border">
            {indicados.map((indicado) => (
              <li key={indicado.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <UserRound className="size-4" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{indicado.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    Cadastro em {formatarData(indicado.criado_em.slice(0, 10))}
                  </span>
                </div>
                <span
                  className={
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium " +
                    (indicado.acesso === "liberado"
                      ? "bg-entrada-suave text-entrada-texto"
                      : "bg-alerta-suave text-alerta-texto")
                  }
                >
                  {indicado.acesso === "liberado" ? "Pagando" : "Aguardando pagamento"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Bloco>

      {perfil.indicado_por && (
        <Bloco titulo="Quem te indicou">
          <p className="text-sm text-foreground">{perfil.indicado_por}</p>
        </Bloco>
      )}
    </div>
  );
}

/* Contagem simples, não é dinheiro — por isso não usa <CartaoIndicador>, que
   sempre formata o número como valor em reais. */
function ContagemDeIndicados({
  rotulo,
  quantidade,
  icone: Icone,
  tom,
}: {
  rotulo: string;
  quantidade: number;
  icone: typeof BadgeCheck;
  tom: "entrada" | "alerta";
}) {
  const cores =
    tom === "entrada"
      ? { fundo: "bg-entrada-suave", texto: "text-entrada-texto" }
      : { fundo: "bg-alerta-suave", texto: "text-alerta-texto" };

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-5 shadow-cartao ring-1 ring-border">
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${cores.fundo} ${cores.texto}`}>
        <Icone className="size-[1.05rem]" aria-hidden="true" />
      </span>
      <div className="flex flex-col">
        <span className="numero text-2xl leading-tight font-semibold text-foreground">
          {quantidade}
        </span>
        <span className="text-sm text-muted-foreground">{rotulo}</span>
      </div>
    </div>
  );
}
