import type { Metadata } from "next";

import { CascaDeAcesso } from "@/components/auth/CascaDeAcesso";
import { FormularioRecuperar } from "@/components/auth/formularios";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function PaginaDeRecuperacao() {
  return (
    <CascaDeAcesso
      titulo="Recuperar o acesso"
      descricao="Informe o e-mail da conta e enviamos um link para você criar uma senha nova."
    >
      <FormularioRecuperar />
    </CascaDeAcesso>
  );
}
