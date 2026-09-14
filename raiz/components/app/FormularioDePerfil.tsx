"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { atualizarPerfil } from "@/lib/acoes/perfil";
import type { Perfil } from "@/lib/tipos";

export function FormularioDePerfil({ perfil }: { perfil: Perfil }) {
  const [nome, setNome] = useState(perfil.nome ?? "");
  const [enviando, iniciar] = useTransition();
  const mudou = nome.trim() !== (perfil.nome ?? "").trim();

  function enviar() {
    iniciar(async () => {
      const resultado = await atualizarPerfil({ nome });
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Nome atualizado.");
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        enviar();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="perfil-nome">Nome</Label>
        <Input
          id="perfil-nome"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          maxLength={60}
          className="h-11 max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          É como o app te chama no painel e na barra lateral.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="perfil-email">E-mail</Label>
        <Input
          id="perfil-email"
          value={perfil.email}
          disabled
          readOnly
          className="h-11 max-w-sm"
        />
        <p className="text-xs text-muted-foreground">
          O e-mail é a identificação da conta e não pode ser alterado por aqui.
        </p>
      </div>

      <Button type="submit" size="lg" className="self-start" disabled={!mudou || enviando}>
        {enviando ? "Salvando…" : "Salvar"}
      </Button>
    </form>
  );
}
