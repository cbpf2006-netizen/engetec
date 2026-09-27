import type { Metadata } from "next";

import { CascaDeAcesso } from "@/components/auth/CascaDeAcesso";
import { FormularioCadastro } from "@/components/auth/formularios";
import { createClient } from "@/lib/supabase/server";

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
  let codigoDeIndicacao = bruto?.trim().toLowerCase() || undefined;

  // Sem link de indicação: pré-seleciona a conta administradora em vez de
  // "ninguém me indicou" (ver public.codigo_indicacao_padrao()).
  if (!codigoDeIndicacao) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("codigo_indicacao_padrao");
    codigoDeIndicacao = (data as string | null) ?? undefined;
  }

  return (
    <CascaDeAcesso
      titulo="Criar sua conta"
      descricao="Leva menos de um minuto. Você começa com tudo em branco e monta as suas categorias e carteiras do seu jeito."
    >
      <FormularioCadastro codigoDeIndicacao={codigoDeIndicacao} />
    </CascaDeAcesso>
  );
}
