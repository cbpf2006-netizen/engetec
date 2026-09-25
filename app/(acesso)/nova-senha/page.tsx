import type { Metadata } from "next";

import { CascaDeAcesso } from "@/components/auth/CascaDeAcesso";
import { FormularioNovaSenha } from "@/components/auth/formularios";

export const metadata: Metadata = { title: "Nova senha" };

/* Rota protegida de propósito: só chega aqui quem veio pelo link de
   recuperação, que já criou a sessão em /auth/confirmar. Sem sessão, o proxy
   manda para o login antes desta página renderizar. */
export default function PaginaDeNovaSenha() {
  return (
    <CascaDeAcesso
      titulo="Criar uma nova senha"
      descricao="Escolha uma senha que você não usa em outro lugar. Depois de salvar, você já entra no app."
    >
      <FormularioNovaSenha />
    </CascaDeAcesso>
  );
}
