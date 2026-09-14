import type { Metadata } from "next";

import { CascaDeAcesso } from "@/components/auth/CascaDeAcesso";
import { FormularioCadastro } from "@/components/auth/formularios";

export const metadata: Metadata = { title: "Criar conta" };

export default function PaginaDeCadastro() {
  return (
    <CascaDeAcesso
      titulo="Criar sua conta"
      descricao="Leva menos de um minuto. Já começamos com os modelos de entrada, saída e investimento prontos para usar."
    >
      <FormularioCadastro />
    </CascaDeAcesso>
  );
}
