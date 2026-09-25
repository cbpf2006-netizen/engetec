"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BarraPainel() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await fetch("/api/painel/logout", { method: "POST" });
    router.push("/painel/login");
    router.refresh();
  }

  return (
    <header className="painel-barra">
      <span className="painel-marca">Engetec · Painel financeiro</span>
      <button type="button" className="btn btn-ghost" onClick={sair} disabled={saindo}>
        {saindo ? "Saindo…" : "Sair"}
      </button>
    </header>
  );
}
