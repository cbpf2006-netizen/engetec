import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_SESSAO, sessaoValida } from "@/lib/auth-painel";
import BarraPainel from "@/components/painel/BarraPainel";
import "../painel.css";

export const metadata: Metadata = {
  title: "Painel — Engetec",
  robots: { index: false, follow: false },
};

/* O painel não pode ser servido de cache: o que o administrador vê
   precisa ser o estado atual do banco, não uma versão antiga. */
export const dynamic = "force-dynamic";

/* O middleware já barra quem não está logado. Esta segunda checagem
   existe porque uma tela financeira não deve depender de uma única
   camada de proteção. */
export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!sessaoValida(cookieStore.get(COOKIE_SESSAO)?.value)) {
    redirect("/painel/login");
  }

  return (
    <div className="painel-shell">
      <BarraPainel />
      <main className="painel-conteudo">{children}</main>
    </div>
  );
}
