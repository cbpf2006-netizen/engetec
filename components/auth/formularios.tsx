"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { Aviso, BotaoEnviar, CampoSenha, CampoTexto } from "./campos";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lerEmailSalvo } from "@/lib/login-salvo";
import { mascaraTelefone } from "@/lib/formato";
import { createClient } from "@/lib/supabase/client";
import type { Indicador } from "@/lib/tipos";
import {
  cadastrar,
  definirNovaSenha,
  entrar,
  pedirRecuperacao,
  type EstadoFormulario,
} from "@/lib/acoes/autenticacao";

/* =============================================================================
   Formulários de acesso

   Todos usam `useActionState` com a Server Action como `action` do <form>:
   o envio funciona mesmo antes do JavaScript hidratar, e o estado de erro
   volta do servidor já pronto para exibir.
   ========================================================================== */

const ERRO_INICIAL: EstadoFormulario = null;

/** O e-mail salvo só muda quando a pessoa sai da conta — em outra tela, ou
    seja, com esta desmontada. Não há o que assinar. */
const semAssinatura = () => () => {};

export function FormularioEntrar({
  destino,
  linkInvalido,
}: {
  destino?: string;
  linkInvalido?: boolean;
}) {
  const [estado, acao] = useActionState(entrar, ERRO_INICIAL);

  // E-mail que a pessoa pediu para lembrar ao sair. O servidor não enxerga o
  // localStorage, então renderiza vazio e o navegador preenche na hidratação.
  const emailSalvo = useSyncExternalStore(semAssinatura, lerEmailSalvo, () => "");

  return (
    <form action={acao} className="flex flex-col gap-4">
      {linkInvalido && !estado?.erro && (
        <Aviso tipo="erro">
          Esse link já foi usado ou expirou. Peça um novo e-mail para continuar.
        </Aviso>
      )}
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      {destino && <input type="hidden" name="destino" value={destino} />}

      <CampoTexto
        key={emailSalvo}
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="username"
        placeholder="voce@exemplo.com"
        defaultValue={emailSalvo}
        required
        autoFocus={!emailSalvo}
        erro={estado?.campo === "email" ? estado.erro : undefined}
      />

      <CampoSenha
        autoComplete="current-password"
        autoFocus={Boolean(emailSalvo)}
        required
        acao={
          <Link
            href="/recuperar"
            className="rounded text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Esqueci a senha
          </Link>
        }
      />

      <BotaoEnviar carregando="Entrando…">Entrar</BotaoEnviar>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}

const SEM_INDICADOR = "__nenhum__";

export function FormularioCadastro({
  nomeDeIndicacao,
}: {
  /** Nome do link /comecar?ref=nome, se foi por ele que a pessoa chegou. */
  nomeDeIndicacao?: string;
}) {
  const [estado, acao] = useActionState(cadastrar, ERRO_INICIAL);

  // Controlados: o React 19 limpa os campos não controlados depois de cada
  // envio, e errar a confirmação da senha não pode apagar o resto do cadastro.
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // "Quem te indicou" vem de uma lista fechada — só contas com acesso
  // liberado — em vez de um nome digitado à mão. Carregada do banco porque o
  // cadastro ainda não tem sessão nenhuma (a lista é pública de propósito, ver
  // supabase/migrations/0008_indicacao_por_nome.sql). A escolha vale pelo
  // nome mesmo (exatamente como cadastrado), não por um código.
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [nomeEscolhido, setNomeEscolhido] = useState(SEM_INDICADOR);

  useEffect(() => {
    let vivo = true;

    createClient()
      .rpc("listar_indicadores")
      .then(({ data }) => {
        if (!vivo || !data) return;
        const lista = data as Indicador[];
        setIndicadores(lista);

        if (nomeDeIndicacao && lista.some((i) => i.nome === nomeDeIndicacao)) {
          setNomeEscolhido(nomeDeIndicacao);
        }
      });

    return () => {
      vivo = false;
    };
  }, [nomeDeIndicacao]);

  if (estado?.aviso) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso tipo="sucesso">{estado.aviso}</Aviso>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Depois de confirmar, o acesso é liberado assim que o pagamento for confirmado.
        </p>
        <Link
          href="/login"
          className="rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Ir para a tela de entrada
        </Link>
      </div>
    );
  }

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      <CampoTexto
        id="nome"
        rotulo="Nome"
        autoComplete="name"
        placeholder="Como podemos te chamar"
        required
        autoFocus
        maxLength={60}
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        erro={estado?.campo === "nome" ? estado.erro : undefined}
      />

      <CampoTexto
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        required
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        erro={estado?.campo === "email" ? estado.erro : undefined}
      />

      <CampoTexto
        id="telefone"
        rotulo="Telefone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(11) 91234-5678"
        required
        value={telefone}
        onChange={(evento) => setTelefone(mascaraTelefone(evento.target.value))}
        dica="Só para contato."
        erro={estado?.campo === "telefone" ? estado.erro : undefined}
      />

      <CampoSenha
        autoComplete="new-password"
        required
        minLength={8}
        dica="Pelo menos 8 caracteres."
        erro={estado?.campo === "senha" ? estado.erro : undefined}
      />

      <CampoSenha
        id="confirmacao"
        rotulo="Confirmar senha"
        autoComplete="new-password"
        required
        minLength={8}
        erro={estado?.campo === "confirmacao" ? estado.erro : undefined}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="quem-indicou">Quem te indicou?</Label>
        <Select
          value={nomeEscolhido}
          onValueChange={(valor) => setNomeEscolhido(String(valor))}
        >
          <SelectTrigger id="quem-indicou" className="w-full">
            <SelectValue placeholder="Selecione quem te indicou" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SEM_INDICADOR}>Ninguém me indicou</SelectItem>
            {indicadores.map((indicador) => (
              <SelectItem key={indicador.id} value={indicador.nome}>
                {indicador.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="hidden"
          name="nome_indicador"
          value={nomeEscolhido === SEM_INDICADOR ? "" : nomeEscolhido}
        />
        {estado?.campo === "nome_indicador" && (
          <p className="text-xs text-destructive">{estado.erro}</p>
        )}
      </div>

      <BotaoEnviar carregando="Criando conta…">Criar conta</BotaoEnviar>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function FormularioRecuperar() {
  const [estado, acao] = useActionState(pedirRecuperacao, ERRO_INICIAL);

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}
      {estado?.aviso && <Aviso tipo="sucesso">{estado.aviso}</Aviso>}

      <CampoTexto
        id="email"
        rotulo="E-mail da conta"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        required
        autoFocus
      />

      <BotaoEnviar carregando="Enviando…">Enviar link de recuperação</BotaoEnviar>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Voltar para a entrada
        </Link>
      </p>
    </form>
  );
}

export function FormularioNovaSenha() {
  const [estado, acao] = useActionState(definirNovaSenha, ERRO_INICIAL);

  return (
    <form action={acao} className="flex flex-col gap-4">
      {estado?.erro && <Aviso tipo="erro">{estado.erro}</Aviso>}

      <CampoSenha
        rotulo="Nova senha"
        autoComplete="new-password"
        required
        minLength={8}
        autoFocus
        dica="Pelo menos 8 caracteres."
        erro={estado?.campo === "senha" ? estado.erro : undefined}
      />

      <CampoSenha
        id="confirmacao"
        rotulo="Repita a nova senha"
        autoComplete="new-password"
        required
        minLength={8}
        erro={estado?.campo === "confirmacao" ? estado.erro : undefined}
      />

      <BotaoEnviar carregando="Salvando…">Salvar nova senha</BotaoEnviar>
    </form>
  );
}
