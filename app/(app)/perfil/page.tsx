import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TituloDaPagina } from "@/components/app/Bloco";
import { PerfilCompleto } from "@/components/app/PerfilCompleto";
import { perfilAtual } from "@/lib/dados/sessao";

export const metadata: Metadata = { title: "Perfil" };

export default async function PaginaDePerfil() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");

  return (
    <div className="flex max-w-2xl flex-col gap-5 sm:gap-6">
      <TituloDaPagina titulo="Perfil" apoio="Sua foto, seus dados de contato e o acesso à conta." />
      <PerfilCompleto perfil={perfil} />
    </div>
  );
}
