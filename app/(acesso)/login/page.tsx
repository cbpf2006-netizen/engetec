import type { Metadata } from "next";

import { CascaDeAcesso } from "@/components/auth/CascaDeAcesso";
import { FormularioEntrar } from "@/components/auth/formularios";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaDeLogin({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; erro?: string }>;
}) {
  const { destino, erro } = await searchParams;

  return (
    <CascaDeAcesso
      titulo="Entrar na sua conta"
      descricao="Retome de onde parou: seus lançamentos, saldo e contas continuam aqui."
    >
      <FormularioEntrar
        destino={destino?.startsWith("/") ? destino : undefined}
        linkInvalido={erro === "link-invalido"}
      />
    </CascaDeAcesso>
  );
}
