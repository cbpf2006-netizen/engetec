"use client";

import { useMemo, useState, type ReactNode } from "react";
import { MoreHorizontal, Pencil, Trash2, Wallet } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SeloModelo } from "@/components/Icone";
import { Valor } from "./Valor";
import { DialogoConfirmar } from "./DialogoConfirmar";
import { DialogoLancamento } from "./DialogoLancamento";
import { capitalizar, data as formatarData, dataPorExtenso, diaDaSemana } from "@/lib/formato";
import { hoje, somarDias } from "@/lib/periodo";
import { excluirInvestimento, excluirTransacao } from "@/lib/acoes/lancamentos";
import type { Carteira, Fluxo, Modelo, OperacaoInvestimento } from "@/lib/tipos";

/* =============================================================================
   Lista de lançamentos

   Agrupada por dia. Uma lista longa de linhas iguais obriga a ler a data de
   cada uma para saber "quando foi isso"; com o dia como cabeçalho, a data é
   lida uma vez e as linhas ficam livres para mostrar o que importa.

   Editar e excluir vivem num menu por linha em vez de dois ícones sempre
   visíveis: ações destrutivas não precisam de destaque permanente, e no
   celular dois alvos de 44px por linha não caberiam.
   ========================================================================== */

export type ItemDaLista = {
  id: string;
  modelo: Modelo | null;
  carteira: Carteira | null;
  valor: number;
  data: string;
  observacao: string | null;
  operacao?: OperacaoInvestimento;
};

export function ListaDeLancamentos({
  fluxo,
  itens,
  modelos,
  vazio,
}: {
  fluxo: Fluxo;
  itens: ItemDaLista[];
  modelos: Modelo[];
  vazio: ReactNode;
}) {
  const [emEdicao, setEmEdicao] = useState<ItemDaLista | null>(null);
  const [paraExcluir, setParaExcluir] = useState<ItemDaLista | null>(null);

  const dias = useMemo(() => agruparPorDia(itens), [itens]);

  if (itens.length === 0) return <>{vazio}</>;

  return (
    <>
      <div className="flex flex-col">
        {dias.map((dia) => (
          <section key={dia.data}>
            <header className="flex items-baseline justify-between gap-3 bg-secondary/40 px-5 py-2">
              <h3 className="text-xs font-medium text-muted-foreground">{rotuloDoDia(dia.data)}</h3>
              <span className="numero text-xs text-muted-foreground">{dia.itens.length === 1 ? "1 lançamento" : `${dia.itens.length} lançamentos`}</span>
            </header>

            <ul className="divide-y divide-border">
              {dia.itens.map((item) => (
                <Linha
                  key={item.id}
                  item={item}
                  fluxo={fluxo}
                  aoEditar={() => setEmEdicao(item)}
                  aoExcluir={() => setParaExcluir(item)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <DialogoLancamento
        fluxo={fluxo}
        modelos={modelos}
        aberto={emEdicao !== null}
        aoMudarAberto={(aberto) => !aberto && setEmEdicao(null)}
        lancamento={
          emEdicao
            ? {
                id: emEdicao.id,
                modelo_id: emEdicao.modelo?.id ?? null,
                carteira_id: emEdicao.carteira?.id ?? null,
                valor: emEdicao.valor,
                data: emEdicao.data,
                observacao: emEdicao.observacao,
                operacao: emEdicao.operacao,
              }
            : undefined
        }
      />

      <DialogoConfirmar
        aberto={paraExcluir !== null}
        aoMudarAberto={(aberto) => !aberto && setParaExcluir(null)}
        titulo="Excluir este lançamento?"
        descricao={
          paraExcluir ? (
            <>
              {paraExcluir.modelo?.nome ?? "Sem modelo"} de{" "}
              <strong className="numero text-foreground">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  paraExcluir.valor
                )}
              </strong>{" "}
              em {formatarData(paraExcluir.data)}. Os totais e os gráficos são recalculados na hora,
              e não há como desfazer.
            </>
          ) : null
        }
        mensagemDeSucesso="Lançamento excluído."
        acao={async () => {
          if (!paraExcluir) return { ok: false as const, erro: "Nada selecionado." };
          return fluxo === "investimento"
            ? excluirInvestimento(paraExcluir.id)
            : excluirTransacao(paraExcluir.id);
        }}
      />
    </>
  );
}

function Linha({
  item,
  fluxo,
  aoEditar,
  aoExcluir,
}: {
  item: ItemDaLista;
  fluxo: Fluxo;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  // Resgate é dinheiro voltando: pinta como entrada, mesmo estando na aba de
  // investimentos.
  const fluxoVisual: Fluxo =
    item.operacao === "resgate" ? "entrada" : fluxo === "investimento" ? "investimento" : fluxo;

  return (
    <li className="group flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-secondary/40">
      <SeloModelo
        icone={item.modelo?.icone ?? "circulo"}
        cor={item.modelo?.cor ?? "cinza"}
        tamanho="md"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {item.modelo?.nome ?? "Sem modelo"}
          </span>
          {item.operacao === "resgate" && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
              Resgate
            </span>
          )}
        </div>

        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          {item.carteira && (
            <>
              <Wallet className="size-3 shrink-0" aria-hidden="true" />
              <span className="shrink-0">{item.carteira.nome}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="truncate">
            {item.observacao ?? capitalizar(diaDaSemana(item.data))}
          </span>
        </p>
      </div>

      <Valor
        quantia={item.valor}
        fluxo={fluxoVisual}
        sinal={fluxoVisual !== "investimento"}
        className="shrink-0"
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "shrink-0 text-muted-foreground transition-opacity",
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 sm:aria-expanded:opacity-100"
              )}
              aria-label={`Ações do lançamento de ${item.modelo?.nome ?? "sem modelo"}`}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={aoEditar}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={aoExcluir}>
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function agruparPorDia(itens: ItemDaLista[]): { data: string; itens: ItemDaLista[] }[] {
  const mapa = new Map<string, ItemDaLista[]>();
  for (const item of itens) {
    const lista = mapa.get(item.data);
    if (lista) lista.push(item);
    else mapa.set(item.data, [item]);
  }
  return [...mapa.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([data, itensDoDia]) => ({ data, itens: itensDoDia }));
}

function rotuloDoDia(data: string): string {
  const agora = hoje();
  if (data === agora) return "Hoje";
  if (data === somarDias(agora, -1)) return "Ontem";
  return capitalizar(`${diaDaSemana(data)}, ${dataPorExtenso(data)}`);
}
