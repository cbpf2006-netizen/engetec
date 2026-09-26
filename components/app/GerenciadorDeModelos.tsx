"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeloModelo } from "@/components/Icone";
import { Bloco } from "./Bloco";
import { DialogoConfirmar } from "./DialogoConfirmar";
import { useCarteiras } from "./CarteirasProvider";
import { SelecaoDeCarteira } from "./SelecaoDeCarteira";
import { EscolhaDeCor, EscolhaDeIcone } from "./SelecaoDeModelo";
import {
  alternarArquivoDoModelo,
  atualizarModelo,
  criarModelo,
  excluirModelo,
} from "@/lib/acoes/modelos";
import { ROTULO_FLUXO_PLURAL, type Fluxo, type Modelo } from "@/lib/tipos";

/* =============================================================================
   Gerenciador de modelos

   Os modelos são a taxonomia que a pessoa inventa para o próprio dinheiro, e
   por isso ficam junto do fluxo a que pertencem, não numa tela de
   configurações distante.

   Arquivar x excluir é uma distinção deliberada:
     · arquivar tira o modelo dos seletores e preserva o nome no histórico;
     · excluir apaga o modelo, e os lançamentos antigos passam a aparecer como
       "Sem modelo" (o banco anula a referência, nunca apaga o lançamento).
   O diálogo de exclusão diz isso, porque é o tipo de consequência que ninguém
   adivinha.
   ========================================================================== */

const TITULOS: Record<Fluxo, { titulo: string; descricao: string; botao: string }> = {
  entrada: {
    titulo: "Modelos de entrada",
    descricao: "As categorias que você usa ao registrar dinheiro que entra.",
    botao: "Novo modelo de entrada",
  },
  saida: {
    titulo: "Modelos de saída",
    descricao: "As categorias que organizam seus gastos.",
    botao: "Novo modelo de saída",
  },
  investimento: {
    titulo: "Tipos de investimento",
    descricao: "Como você separa a sua carteira.",
    botao: "Novo tipo de investimento",
  },
};

export function GerenciadorDeModelos({
  fluxo,
  modelos,
  usoPorModelo,
}: {
  fluxo: Fluxo;
  /** Inclui arquivados — eles aparecem no fim, esmaecidos. */
  modelos: Modelo[];
  /** Quantos lançamentos cada modelo tem, para avisar antes de excluir. */
  usoPorModelo: Record<string, number>;
}) {
  const textos = TITULOS[fluxo];
  const [emEdicao, setEmEdicao] = useState<Modelo | null>(null);
  const [criando, setCriando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<Modelo | null>(null);

  const ativos = modelos.filter((m) => !m.arquivado);
  const arquivados = modelos.filter((m) => m.arquivado);

  return (
    <>
      <Bloco
        titulo={textos.titulo}
        descricao={textos.descricao}
        acao={
          <Button variant="outline" size="sm" onClick={() => setCriando(true)}>
            <Plus />
            <span className="hidden sm:inline">{textos.botao}</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        }
        semPadding
      >
        <ul className="divide-y divide-border border-t border-border">
          {[...ativos, ...arquivados].map((modelo) => (
            <Linha
              key={modelo.id}
              fluxo={fluxo}
              modelo={modelo}
              usos={usoPorModelo[modelo.id] ?? 0}
              aoEditar={() => setEmEdicao(modelo)}
              aoExcluir={() => setParaExcluir(modelo)}
            />
          ))}
        </ul>

        {modelos.length === 0 && (
          <p className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
            Nenhum modelo de {ROTULO_FLUXO_PLURAL[fluxo].toLowerCase()} ainda.
          </p>
        )}
      </Bloco>

      <DialogoDeModelo
        fluxo={fluxo}
        aberto={criando}
        aoMudarAberto={setCriando}
      />

      <DialogoDeModelo
        fluxo={fluxo}
        modelo={emEdicao ?? undefined}
        aberto={emEdicao !== null}
        aoMudarAberto={(aberto) => !aberto && setEmEdicao(null)}
      />

      <DialogoConfirmar
        aberto={paraExcluir !== null}
        aoMudarAberto={(aberto) => !aberto && setParaExcluir(null)}
        titulo={`Excluir o modelo "${paraExcluir?.nome ?? ""}"?`}
        descricao={
          paraExcluir ? (
            (usoPorModelo[paraExcluir.id] ?? 0) > 0 ? (
              <>
                {usoPorModelo[paraExcluir.id]} lançamento
                {usoPorModelo[paraExcluir.id] > 1 ? "s usam" : " usa"} este modelo. Os lançamentos
                continuam existindo, mas passam a aparecer como &ldquo;Sem modelo&rdquo;. Se quer
                apenas parar de usá-lo, arquive em vez de excluir.
              </>
            ) : (
              "Nenhum lançamento usa este modelo."
            )
          ) : null
        }
        mensagemDeSucesso="Modelo excluído."
        acao={async () =>
          paraExcluir
            ? excluirModelo(paraExcluir.id)
            : { ok: false as const, erro: "Nada selecionado." }
        }
      />
    </>
  );
}

function Linha({
  fluxo,
  modelo,
  usos,
  aoEditar,
  aoExcluir,
}: {
  fluxo: Fluxo;
  modelo: Modelo;
  usos: number;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  const [alternando, iniciar] = useTransition();

  function alternarArquivo() {
    iniciar(async () => {
      const resultado = await alternarArquivoDoModelo(modelo.id, !modelo.arquivado);
      if (!resultado.ok) toast.error(resultado.erro);
      else toast.success(modelo.arquivado ? "Modelo reativado." : "Modelo arquivado.");
    });
  }

  return (
    <li
      className={cn(
        "group flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-secondary/40",
        modelo.arquivado && "opacity-60"
      )}
    >
      <SeloModelo icone={modelo.icone} cor={modelo.cor} tamanho="sm" />

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2 truncate text-sm font-medium">
          {modelo.nome}
          {modelo.arquivado && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
              Arquivado
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {usos === 0 ? "Sem lançamentos" : usos === 1 ? "1 lançamento" : `${usos} lançamentos`}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
              disabled={alternando}
              aria-label={`Ações do modelo ${modelo.nome}`}
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={aoEditar}>
            <Pencil />
            Editar
          </DropdownMenuItem>
          {fluxo === "investimento" && (
            <DropdownMenuItem onClick={alternarArquivo}>
              {modelo.arquivado ? <ArchiveRestore /> : <Archive />}
              {modelo.arquivado ? "Reativar" : "Arquivar"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onClick={aoExcluir}>
            <Trash2 />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

/* =============================================================================
   Diálogo de criação / edição
   ========================================================================== */

function DialogoDeModelo({
  fluxo,
  modelo,
  aberto,
  aoMudarAberto,
}: {
  fluxo: Fluxo;
  modelo?: Modelo;
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modelo ? "Editar modelo" : TITULOS[fluxo].botao}</DialogTitle>
          <DialogDescription>
            Nome, ícone e cor. A cor é o que identifica o modelo nos gráficos.
          </DialogDescription>
        </DialogHeader>

        {aberto && (
          <FormularioDeModelo
            key={modelo?.id ?? "novo"}
            fluxo={fluxo}
            modelo={modelo}
            aoConcluir={() => aoMudarAberto(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormularioDeModelo({
  fluxo,
  modelo,
  aoConcluir,
}: {
  fluxo: Fluxo;
  modelo?: Modelo;
  aoConcluir: () => void;
}) {
  const [nome, setNome] = useState(modelo?.nome ?? "");
  const [icone, setIcone] = useState(modelo?.icone ?? "circulo");
  const [cor, setCor] = useState(modelo?.cor ?? "verde");
  const carteiras = useCarteiras();
  const [carteiraId, setCarteiraId] = useState<string | null>(
    modelo?.carteira_id ?? (carteiras.length === 1 ? carteiras[0].id : null)
  );
  const [erroCarteira, setErroCarteira] = useState<string | undefined>();
  const [erro, setErro] = useState<string | undefined>();
  const [enviando, iniciar] = useTransition();

  function enviar() {
    if (!nome.trim()) {
      setErro("Dê um nome ao modelo.");
      return;
    }
    // A carteira só é perguntada aqui, na criação do tipo: os aportes herdam.
    if (fluxo === "investimento" && !carteiraId) {
      setErroCarteira("Escolha a carteira.");
      return;
    }

    iniciar(async () => {
      const dados = {
        fluxo,
        nome,
        icone,
        cor,
        ...(fluxo === "investimento" ? { carteira_id: carteiraId } : {}),
      };
      const resultado = modelo
        ? await atualizarModelo(modelo.id, dados)
        : await criarModelo(dados);

      if (!resultado.ok) {
        setErro(resultado.erro);
        toast.error(resultado.erro);
        return;
      }

      toast.success(modelo ? "Modelo atualizado." : `Modelo "${nome.trim()}" criado.`);
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
        <Label htmlFor="modelo-nome">Nome</Label>
        <div className="flex items-center gap-3">
          <SeloModelo icone={icone} cor={cor} tamanho="lg" />
          <Input
            id="modelo-nome"
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value);
              setErro(undefined);
            }}
            maxLength={40}
            autoFocus
            placeholder="Ex.: Mercado"
            aria-invalid={erro ? true : undefined}
            className="h-11"
          />
        </div>
        {erro && <p className="text-xs text-destructive">{erro}</p>}
      </div>

      <EscolhaDeIcone fluxo={fluxo} valor={icone} aoMudar={setIcone} />
      <EscolhaDeCor fluxo={fluxo} valor={cor} aoMudar={setCor} />

      {fluxo === "investimento" && (
        <SelecaoDeCarteira
          carteiras={carteiras}
          selecionada={carteiraId}
          aoSelecionar={(id) => {
            setCarteiraId(id);
            setErroCarteira(undefined);
          }}
          erro={erroCarteira}
        />
      )}

      <DialogFooter className="-mx-5 -mb-5 px-5 py-4">
        <Button type="button" variant="outline" size="lg" onClick={aoConcluir} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? "Salvando…" : modelo ? "Salvar" : "Criar modelo"}
        </Button>
      </DialogFooter>
    </form>
  );
}
