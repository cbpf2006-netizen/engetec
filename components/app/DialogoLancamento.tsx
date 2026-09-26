"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CampoValor } from "./CampoValor";
import { SelecaoDeCarteira } from "./SelecaoDeCarteira";
import { SelecaoDeModelo } from "./SelecaoDeModelo";
import { useCarteiras } from "./CarteirasProvider";
import { mascaraMoeda, moeda, paraNumero } from "@/lib/formato";
import { hoje, somarDias } from "@/lib/periodo";
import {
  atualizarInvestimento,
  atualizarTransacao,
  criarInvestimento,
  criarTransacao,
} from "@/lib/acoes/lancamentos";
import type { Fluxo, Modelo, OperacaoInvestimento } from "@/lib/tipos";

/* =============================================================================
   Diálogo de lançamento — entrada, saída e investimento

   Um componente para os três fluxos, porque o formulário é o mesmo: valor,
   modelo, data, observação. Investimento acrescenta aporte/resgate. Três
   diálogos quase idênticos divergiriam no primeiro ajuste.

   A validação acontece no envio, não a cada tecla: acusar "valor inválido"
   enquanto a pessoa ainda está digitando o primeiro dígito é ruído. O
   servidor revalida tudo de novo — o formulário não é a autoridade.
   ========================================================================== */

export type LancamentoParaEditar = {
  id: string;
  modelo_id: string | null;
  carteira_id: string | null;
  valor: number;
  data: string;
  observacao: string | null;
  operacao?: OperacaoInvestimento;
};

const TITULOS: Record<Fluxo, { novo: string; editar: string; descricao: string }> = {
  entrada: {
    novo: "Nova entrada",
    editar: "Editar entrada",
    descricao: "Dinheiro que entrou no seu caixa.",
  },
  saida: {
    novo: "Nova saída",
    editar: "Editar saída",
    descricao: "Dinheiro que saiu do seu caixa.",
  },
  investimento: {
    novo: "Novo investimento",
    editar: "Editar investimento",
    descricao: "Aporte sai do caixa e vira patrimônio; resgate faz o caminho de volta.",
  },
};

export function DialogoLancamento({
  fluxo,
  modelos,
  aberto,
  aoMudarAberto,
  lancamento,
}: {
  fluxo: Fluxo;
  modelos: Modelo[];
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  lancamento?: LancamentoParaEditar;
}) {
  const titulos = TITULOS[fluxo];
  const editando = Boolean(lancamento);

  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? titulos.editar : titulos.novo}</DialogTitle>
          <DialogDescription>{titulos.descricao}</DialogDescription>
        </DialogHeader>

        {aberto && (
          <Formulario
            key={lancamento?.id ?? "novo"}
            fluxo={fluxo}
            modelos={modelos}
            lancamento={lancamento}
            aoConcluir={() => aoMudarAberto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type Erros = Partial<Record<"valor" | "modelo_id" | "carteira_id" | "data", string>>;

function Formulario({
  fluxo,
  modelos,
  lancamento,
  aoConcluir,
}: {
  fluxo: Fluxo;
  modelos: Modelo[];
  lancamento?: LancamentoParaEditar;
  aoConcluir: () => void;
}) {
  const agora = hoje();
  const carteiras = useCarteiras();

  const [valor, setValor] = useState(
    lancamento ? mascaraMoeda(String(Math.round(lancamento.valor * 100))) : ""
  );
  const [modeloId, setModeloId] = useState<string | null>(
    lancamento?.modelo_id ?? (modelos.length === 1 ? modelos[0].id : null)
  );
  const [carteiraId, setCarteiraId] = useState<string | null>(
    lancamento?.carteira_id ?? (carteiras.length === 1 ? carteiras[0].id : null)
  );
  const [data, setData] = useState(lancamento?.data ?? agora);
  const [observacao, setObservacao] = useState(lancamento?.observacao ?? "");
  const [operacao, setOperacao] = useState<OperacaoInvestimento>(
    lancamento?.operacao ?? "aporte"
  );
  const [erros, setErros] = useState<Erros>({});
  const [enviando, iniciar] = useTransition();

  function validar(): Erros {
    const problemas: Erros = {};
    const numero = paraNumero(valor);

    if (!valor.trim() || !Number.isFinite(numero) || numero <= 0) {
      problemas.valor = "Informe um valor maior que zero.";
    }
    if (!modeloId) {
      problemas.modelo_id =
        fluxo === "investimento" ? "Escolha o tipo de investimento." : "Escolha um modelo.";
    }
    // Investimento herda a carteira do tipo, escolhida quando o tipo foi criado.
    if (fluxo !== "investimento" && !carteiraId) problemas.carteira_id = "Escolha a carteira.";
    if (!data) problemas.data = "Informe a data.";

    return problemas;
  }

  function enviar() {
    const problemas = validar();
    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    const dados = {
      modelo_id: modeloId,
      valor: paraNumero(valor),
      data,
      observacao: observacao.trim() || null,
      ...(fluxo === "investimento" ? { operacao } : { fluxo, carteira_id: carteiraId }),
    };

    iniciar(async () => {
      const resultado = lancamento
        ? fluxo === "investimento"
          ? await atualizarInvestimento(lancamento.id, dados)
          : await atualizarTransacao(lancamento.id, dados)
        : fluxo === "investimento"
          ? await criarInvestimento(dados)
          : await criarTransacao(dados);

      if (!resultado.ok) {
        toast.error(resultado.erro);
        if (resultado.campo) setErros({ [resultado.campo]: resultado.erro } as Erros);
        return;
      }

      toast.success(
        lancamento
          ? "Lançamento atualizado."
          : `${moeda(paraNumero(valor))} registrado${fluxo === "saida" ? " como saída" : fluxo === "entrada" ? " como entrada" : ""}.`
      );
      aoConcluir();
    });
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(evento) => {
        evento.preventDefault();
        enviar();
      }}
    >
      <CampoValor valor={valor} aoMudar={setValor} erro={erros.valor} autoFoco />

      {fluxo === "investimento" && (
        <div className="flex flex-col gap-2">
          <Label>Operação</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["aporte", "resgate"] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                role="radio"
                aria-checked={operacao === opcao}
                onClick={() => setOperacao(opcao)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  operacao === opcao
                    ? "border-transparent bg-investimento-suave text-investimento-texto ring-2 ring-investimento"
                    : "border-input text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {opcao === "aporte" ? "Aporte" : "Resgate"}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {operacao === "aporte"
              ? "Sai do caixa livre e entra no total investido."
              : "Volta do total investido para o caixa livre."}
          </p>
        </div>
      )}

      <SelecaoDeModelo
        fluxo={fluxo}
        modelos={modelos}
        selecionado={modeloId}
        aoSelecionar={(id) => {
          setModeloId(id);
          setErros((atual) => ({ ...atual, modelo_id: undefined }));
        }}
        erro={erros.modelo_id}
      />

      {fluxo !== "investimento" && (
        <SelecaoDeCarteira
          carteiras={carteiras}
          selecionada={carteiraId}
          aoSelecionar={(id) => {
            setCarteiraId(id);
            setErros((atual) => ({ ...atual, carteira_id: undefined }));
          }}
          erro={erros.carteira_id}
        />
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="campo-data">Data</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="campo-data"
            type="date"
            value={data}
            max="2100-12-31"
            onChange={(evento) => setData(evento.target.value)}
            aria-invalid={erros.data ? true : undefined}
            className="h-10 w-auto flex-1"
          />
          {[
            { rotulo: "Hoje", valor: agora },
            { rotulo: "Ontem", valor: somarDias(agora, -1) },
          ].map((atalho) => (
            <Button
              key={atalho.rotulo}
              type="button"
              variant={data === atalho.valor ? "secondary" : "ghost"}
              size="sm"
              className="rounded-lg"
              onClick={() => setData(atalho.valor)}
            >
              {atalho.rotulo}
            </Button>
          ))}
        </div>
        {erros.data && <p className="text-xs text-destructive">{erros.data}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="campo-observacao">
          Observação <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="campo-observacao"
          value={observacao}
          onChange={(evento) => setObservacao(evento.target.value)}
          maxLength={280}
          rows={2}
          placeholder="Um detalhe para lembrar depois"
        />
      </div>

      <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
        <Button type="button" variant="outline" size="lg" onClick={aoConcluir} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? "Salvando…" : lancamento ? "Salvar alterações" : "Registrar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
