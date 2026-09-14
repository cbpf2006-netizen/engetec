import { Database } from "lucide-react";

import LogoRaiz from "@/components/marca/LogoRaiz";

/* =============================================================================
   Banco ainda sem schema

   Aparece quando o projeto Supabase responde mas as tabelas não existem — ou
   seja, a migration ainda não foi aplicada. Um erro genérico aqui mandaria
   quem está instalando caçar a causa no console; esta tela diz exatamente o
   que falta e onde.
   ========================================================================== */

const PASSOS = [
  {
    titulo: "Abra o SQL Editor do seu projeto no Supabase",
    detalhe: "Painel do projeto → SQL Editor → New query.",
  },
  {
    titulo: "Cole o conteúdo de supabase/migrations/0001_init.sql",
    detalhe: "O arquivo está na raiz deste projeto, dentro da pasta supabase.",
  },
  {
    titulo: "Execute e recarregue esta página",
    detalhe:
      "O script cria as tabelas, liga o Row Level Security e prepara os modelos padrão de cada nova conta.",
  },
];

export function ConfiguracaoPendente() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-8 px-5 py-12">
      <LogoRaiz />

      <div className="flex flex-col gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-alerta-suave text-alerta-texto">
          <Database className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Falta criar as tabelas no Supabase
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A conexão com o projeto funciona, mas o banco ainda está vazio. São três passos, uma vez
          só.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {PASSOS.map((passo, indice) => (
          <li key={passo.titulo} className="flex gap-3.5 rounded-2xl bg-card p-4 ring-1 ring-border">
            <span className="numero grid size-7 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-semibold">
              {indice + 1}
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{passo.titulo}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{passo.detalhe}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Se preferir linha de comando: <code className="numero">npx supabase login</code>, depois{" "}
        <code className="numero">npx supabase link --project-ref SEU_REF</code> e{" "}
        <code className="numero">npx supabase db push</code>.
      </p>
    </div>
  );
}
