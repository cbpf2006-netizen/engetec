"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, MoreHorizontal, Pencil, Plus, Receipt, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SeloModelo } from "@/components/Icone";
import { Bloco } from "./Bloco";
import { DialogoConfirmar } from "./DialogoConfirmar";
import { DialogoConta } from "./DialogoConta";
import { EstadoVazio } from "./EstadoVazio";
import { data as formatarData, moeda } from "@/lib/formato";
import { hoje } from "@/lib/periodo";
import { alternarPagamento, excluirConta } from "@/lib/acoes/contas";
import {
  FILTROS_CONTA,
  type ContaComModelo,
  type FiltroContas,
  type Modelo,
  type SituacaoConta,
} from "@/lib/tipos";

/* =============================================================================
   Contas a pagar — filtros e lista

   O filtro vive na URL (`?f=atrasado`), como o período nas outras abas: dá
   para voltar, recarregar e compartilhar o mesmo recorte.

   A situação de cada conta é mostrada por cor E por texto ("Atrasada",
   "Paga"), nunca só pela cor. A ação principal de cada linha é um botão com
   caixa de marcação — pagar é o que se faz aqui, e não deveria estar escondido
   dentro de um menu.
   ========================================================================== */

const ESTILO_DA_SITUACAO: Record<SituacaoConta, { texto: string; selo: string; barra: string }> = {
  pendente: {
    texto: "Pendente",
    selo: "bg-secondary text-muted-foreground",
    barra: "bg-alerta",
  },
  atrasado: {
    texto: "Atrasada",
    selo: "bg-saida-suave text-saida-texto",
    barra: "bg-saida",
  },
  pago: {
    texto: "Paga",
    selo: "bg-entrada-suave text-entrada-texto",
    barra: "bg-entrada",
  },
};

export function ListaDeContas({
  contas,
  modelos,
  filtro,
  contagens,
}: {
  contas: ContaComModelo[];
  modelos: Modelo[];
  filtro: FiltroContas;
  contagens: Record<FiltroContas, number>;
}) {
  const [criando, setCriando] = useState(false);
  const [emEdicao, setEmEdicao] = useState<ContaComModelo | null>(null);
  const [paraExcluir, setParaExcluir] = useState<ContaComModelo | null>(null);

  return (
    <>
      <Bloco
        titulo="Contas"
        descricao="Compromissos em aberto e já pagos."
        acao={
          <Button size="sm" onClick={() => setCriando(true)}>
            <Plus />
            Nova conta
          </Button>
        }
        semPadding
      >
        <div className="px-5 pb-4">
          <Filtros filtro={filtro} contagens={contagens} />
        </div>

        <div className="border-t border-border">
          {contas.length === 0 ? (
            <EstadoVazio
              icone={Receipt}
              titulo={
                filtro === "todas"
                  ? "Nenhuma conta cadastrada"
                  : `Nenhuma conta ${FILTROS_CONTA.find((f) => f.valor === filtro)?.rotulo.toLowerCase()}`
              }
              descricao={
                filtro === "todas"
                  ? "Cadastre o que vence todo mês — aluguel, energia, cartão — e o app avisa o que está próximo."
                  : "Troque o filtro para ver as outras contas."
              }
              acao={
                filtro === "todas" ? (
                  <Button onClick={() => setCriando(true)}>
                    <Plus />
                    Adicionar conta
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {contas.map((conta) => (
                <Linha
                  key={conta.id}
                  conta={conta}
                  aoEditar={() => setEmEdicao(conta)}
                  aoExcluir={() => setParaExcluir(conta)}
                />
              ))}
            </ul>
          )}
        </div>
      </Bloco>

      <DialogoConta modelos={modelos} aberto={criando} aoMudarAberto={setCriando} />

      <DialogoConta
        modelos={modelos}
        conta={emEdicao ?? undefined}
        aberto={emEdicao !== null}
        aoMudarAberto={(aberto) => !aberto && setEmEdicao(null)}
      />

      <DialogoConfirmar
        aberto={paraExcluir !== null}
        aoMudarAberto={(aberto) => !aberto && setParaExcluir(null)}
        titulo={`Excluir "${paraExcluir?.nome ?? ""}"?`}
        descricao={
          paraExcluir?.status === "pago"
            ? "A conta e a saída criada pelo pagamento serão apagadas, e o valor volta para o seu saldo."
            : "A conta sai da sua lista de compromissos. Não há como desfazer."
        }
        mensagemDeSucesso="Conta excluída."
        acao={async () =>
          paraExcluir
            ? excluirConta(paraExcluir.id)
            : { ok: false as const, erro: "Nada selecionado." }
        }
      />
    </>
  );
}

function Filtros({
  filtro,
  contagens,
}: {
  filtro: FiltroContas;
  contagens: Record<FiltroContas, number>;
}) {
  const router = useRouter();
  const caminho = usePathname();
  const busca = useSearchParams();
  const [pendente, iniciar] = useTransition();

  function aplicar(valor: FiltroContas) {
    const parametros = new URLSearchParams(busca.toString());
    if (valor === "todas") parametros.delete("f");
    else parametros.set("f", valor);

    iniciar(() => {
      router.push(`${caminho}${parametros.size ? `?${parametros}` : ""}`, { scroll: false });
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Filtrar contas"
      data-pendente={pendente || undefined}
      className="rolagem-fina flex items-center gap-0.5 overflow-x-auto rounded-xl bg-secondary p-0.5"
    >
      {FILTROS_CONTA.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          role="tab"
          aria-selected={filtro === opcao.valor}
          onClick={() => aplicar(opcao.valor)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-[0.625rem] px-3 py-1.5 text-[0.8125rem] font-medium whitespace-nowrap transition-all duration-150",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            filtro === opcao.valor
              ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opcao.rotulo}
          <span className="numero text-xs text-muted-foreground">{contagens[opcao.valor]}</span>
        </button>
      ))}
    </div>
  );
}

function Linha({
  conta,
  aoEditar,
  aoExcluir,
}: {
  conta: ContaComModelo;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  const estilo = ESTILO_DA_SITUACAO[conta.situacao];
  const [alternando, iniciar] = useTransition();
  const paga = conta.status === "pago";

  function alternar() {
    iniciar(async () => {
      const resultado = await alternarPagamento(conta.id, !paga, hoje());
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success(
        paga
          ? "Pagamento desfeito. A saída correspondente foi removida."
          : `${conta.nome} marcada como paga. A saída entrou no seu caixa.`
      );
    });
  }

  return (
    <li className="group flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-secondary/40">
      <button
        type="button"
        onClick={alternar}
        disabled={alternando}
        aria-label={paga ? `Desfazer pagamento de ${conta.nome}` : `Marcar ${conta.nome} como paga`}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-lg border transition-all duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "active:scale-90 disabled:opacity-50",
          paga
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-input hover:border-primary hover:bg-accent"
        )}
      >
        {paga && <Check className="size-3.5" aria-hidden="true" />}
      </button>

      {conta.modelo ? (
        <SeloModelo icone={conta.modelo.icone} cor={conta.modelo.cor} tamanho="sm" />
      ) : (
        <span aria-hidden="true" className={cn("h-8 w-1 shrink-0 rounded-full", estilo.barra)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-sm font-medium",
            paga && "text-muted-foreground line-through decoration-1"
          )}
        >
          {conta.nome}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className={cn("rounded-md px-1.5 py-0.5 font-medium", estilo.selo)}>
            {estilo.texto}
          </span>
          <span>
            {paga && conta.pago_em
              ? `Pago em ${formatarData(conta.pago_em)}`
              : conta.vencimento
                ? `Vence ${formatarData(conta.vencimento)}`
                : "Sem vencimento"}
          </span>
          {conta.observacao && <span className="truncate">· {conta.observacao}</span>}
        </span>
      </div>

      <span
        className={cn(
          "numero shrink-0 text-sm font-semibold",
          paga ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {moeda(conta.valor)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
              aria-label={`Ações de ${conta.nome}`}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={alternar}>
            {paga ? <RotateCcw /> : <Check />}
            {paga ? "Desfazer pagamento" : "Marcar como paga"}
          </DropdownMenuItem>
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
