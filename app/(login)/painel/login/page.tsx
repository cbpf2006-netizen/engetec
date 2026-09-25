"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import "../../../painel.css";

/* =============================================================
   ENTRADA DO PAINEL

   Um único administrador, uma única senha (PAINEL_SENHA no
   ambiente) — sem cadastro, sem recuperação por e-mail. O freio de
   tentativas abaixo é só uma segunda camada no navegador: depois de
   5 erros seguidos, trava o formulário por 60s. Não impede alguém
   falando direto com a API, mas impede tentativa manual ou script
   simples nesta tela. localStorage, não estado em memória — um F5
   não pode zerar o contador de graça.
   ============================================================= */

const CHAVE_TENTATIVAS = "engetec:painel-login-tentativas";
const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 60_000;

type EstadoTentativas = { contagem: number; bloqueadoAte: number | null };

function lerTentativas(): EstadoTentativas {
  try {
    const bruto = localStorage.getItem(CHAVE_TENTATIVAS);
    if (!bruto) return { contagem: 0, bloqueadoAte: null };
    return JSON.parse(bruto) as EstadoTentativas;
  } catch {
    return { contagem: 0, bloqueadoAte: null };
  }
}

function gravarTentativas(estado: EstadoTentativas) {
  try {
    localStorage.setItem(CHAVE_TENTATIVAS, JSON.stringify(estado));
  } catch {
    /* localStorage indisponível — segue sem freio local. */
  }
}

function Formulario() {
  const router = useRouter();
  const parametros = useSearchParams();
  const destino = parametros.get("destino") ?? "/painel";

  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);
  const [bloqueadoAte, setBloqueadoAte] = useState<number | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    setBloqueadoAte(lerTentativas().bloqueadoAte);
  }, []);

  useEffect(() => {
    if (!bloqueadoAte) return;
    const id = setInterval(() => setAgora(Date.now()), 500);
    return () => clearInterval(id);
  }, [bloqueadoAte]);

  const bloqueado = !!bloqueadoAte && agora < bloqueadoAte;
  const segundosRestantes = bloqueado ? Math.ceil((bloqueadoAte! - agora) / 1000) : 0;

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    if (bloqueado || entrando) return;

    setEntrando(true);
    setErro(null);

    const resposta = await fetch("/api/painel/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });

    if (resposta.ok) {
      gravarTentativas({ contagem: 0, bloqueadoAte: null });
      router.push(destino);
      router.refresh();
      return;
    }

    const estado = lerTentativas();
    const contagem = estado.contagem + 1;
    const novoEstado: EstadoTentativas = {
      contagem,
      bloqueadoAte: contagem >= MAX_TENTATIVAS ? Date.now() + BLOQUEIO_MS : null,
    };
    gravarTentativas(novoEstado);
    setBloqueadoAte(novoEstado.bloqueadoAte);
    setErro("Senha incorreta.");
    setEntrando(false);
  }

  return (
    <form className="login-cartao" onSubmit={entrar}>
      <h1 className="login-titulo">Painel financeiro</h1>
      <p className="login-subtitulo">Engetec — acesso restrito</p>

      <label className="login-campo">
        <span>Senha</span>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoFocus
          required
          disabled={bloqueado || entrando}
        />
      </label>

      {erro && <p className="login-erro">{erro}</p>}
      {bloqueado && (
        <p className="login-erro">
          Muitas tentativas. Tente de novo em {segundosRestantes}s.
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={bloqueado || entrando}>
        {entrando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export default function PaginaLogin() {
  return (
    <div className="login-tela">
      <Suspense fallback={null}>
        <Formulario />
      </Suspense>
    </div>
  );
}
