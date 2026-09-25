"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import { SelecaoDeModelo } from "./SelecaoDeModelo";
import { mascaraMoeda, paraNumero } from "@/lib/formato";
import { hoje } from "@/lib/periodo";
import { atualizarConta, criarConta } from "@/lib/acoes/contas";
import type { ContaComModelo, Modelo } from "@/lib/tipos";

/* =============================================================================
   Diálogo de conta a pagar

   O modelo é opcional aqui (diferente de um lançamento): dá para anotar "IPTU"
   antes de decidir em que categoria isso entra. Quando existe, é ele que a
   saída herda no dia do pagamento.
   ========================================================================== */

export function DialogoConta({
  modelos,
  aberto,
  aoMudarAberto,
  conta,
}: {
  modelos: Modelo[];
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  conta?: ContaComModelo;
}) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{conta ? "Editar conta" : "Nova conta a pagar"}</DialogTitle>
          <DialogDescription>
            Uma conta a pagar é um compromisso: ela só entra nas suas saídas no dia em que for
            marcada como paga.
          </DialogDescription>
        </DialogHeader>

        {aberto && (
          <Formulario
            key={conta?.id ?? "nova"}
            modelos={modelos}
            conta={conta}
            aoConcluir={() => aoMudarAberto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type Erros = Partial<Record<"nome" | "valor" | "vencimento", string>>;

function Formulario({
  modelos,
  conta,
  aoConcluir,
}: {
  modelos: Modelo[];
  conta?: ContaComModelo;
  aoConcluir: () => void;
}) {
  const [nome, setNome] = useState(conta?.nome ?? "");
  const [valor, setValor] = useState(
    conta ? mascaraMoeda(String(Math.round(conta.valor * 100))) : ""
  );
  const [vencimento, setVencimento] = useState(conta?.vencimento ?? hoje());
  const [modeloId, setModeloId] = useState<string | null>(conta?.modelo_id ?? null);
  const [observacao, setObservacao] = useState(conta?.observacao ?? "");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, iniciar] = useTransition();

  function enviar() {
    const problemas: Erros = {};
    const numero = paraNumero(valor);

    if (!nome.trim()) problemas.nome = "Dê um nome para a conta.";
    if (!valor.trim() || !Number.isFinite(numero) || numero <= 0) {
      problemas.valor = "Informe um valor maior que zero.";
    }
    if (!vencimento) problemas.vencimento = "Informe o vencimento.";

    setErros(problemas);
    if (Object.keys(problemas).length > 0) return;

    const dados = {
      nome,
      valor: numero,
      vencimento,
      modelo_id: modeloId ?? "",
      observacao: observacao.trim() || null,
    };

    iniciar(async () => {
      const resultado = conta ? await atualizarConta(conta.id, dados) : await criarConta(dados);

      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }

      toast.success(conta ? "Conta atualizada." : "Conta adicionada.");
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="conta-nome">Nome da conta</Label>
        <Input
          id="conta-nome"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          placeholder="Ex.: Aluguel, energia, cartão"
          maxLength={60}
          autoFocus
          aria-invalid={erros.nome ? true : undefined}
          className="h-11"
        />
        {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
      </div>

      <CampoValor valor={valor} aoMudar={setValor} erro={erros.valor} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="conta-vencimento">Vencimento</Label>
        <Input
          id="conta-vencimento"
          type="date"
          value={vencimento}
          onChange={(evento) => setVencimento(evento.target.value)}
          aria-invalid={erros.vencimento ? true : undefined}
          className="h-11"
        />
        {erros.vencimento && <p className="text-xs text-destructive">{erros.vencimento}</p>}
      </div>

      <SelecaoDeModelo
        fluxo="saida"
        modelos={modelos}
        selecionado={modeloId}
        aoSelecionar={(id) => setModeloId(id === modeloId ? null : id)}
      />
      <p className="-mt-3 text-xs text-muted-foreground">
        Opcional. Ao marcar como paga, a saída entra com este modelo.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor="conta-observacao">
          Observação <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="conta-observacao"
          value={observacao}
          onChange={(evento) => setObservacao(evento.target.value)}
          maxLength={280}
          rows={2}
          placeholder="Número do boleto, parcela, quem cobra"
        />
      </div>

      <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
        <Button type="button" variant="outline" size="lg" onClick={aoConcluir} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? "Salvando…" : conta ? "Salvar alterações" : "Adicionar conta"}
        </Button>
      </DialogFooter>
    </form>
  );
}
