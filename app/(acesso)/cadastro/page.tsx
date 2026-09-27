import type { Metadata } from "next";

import { CascaDeAcesso } from "@/components/auth/CascaDeAcesso";
import { FormularioCadastro } from "@/components/auth/formularios";

export const metadata: Metadata = { title: "Criar conta" };

export default async function PaginaDeCadastro({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const bruto = Array.isArray(parametros.ref) ? parametros.ref[0] : parametros.ref;
  // Vem do link de indicação (/comecar?ref=código); repassado adiante para
  // pré-selecionar "quem te indicou" no formulário.
  const codigoDeIndicacao = bruto?.trim().toLowerCase() || undefined;

  return (
    <CascaDeAcesso
      titulo="Criar sua conta"
      descricao="Leva menos de um minuto. Você começa com tudo em branco e monta as suas categorias e carteiras do seu jeito."
    >
      <FormularioCadastro codigoDeIndicacao={codigoDeIndicacao} />
    </CascaDeAcesso>
  );
}
