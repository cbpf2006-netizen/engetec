import { cn } from "@/lib/utils";
import { iniciais } from "@/lib/formato";
import type { Perfil } from "@/lib/tipos";

/* =============================================================================
   Avatar

   A foto quando existe; sem ela, as iniciais do nome e do sobrenome. É o
   mesmo círculo nos dois casos, então trocar ou remover a foto não muda o
   tamanho nem o alinhamento de nada ao redor.
   ========================================================================== */

const TAMANHOS = {
  sm: "size-9 text-[0.8125rem]",
  md: "size-11 text-base",
  lg: "size-24 text-3xl",
} as const;

export function Avatar({
  perfil,
  tamanho = "sm",
  className,
}: {
  perfil: Pick<Perfil, "nome" | "email" | "foto_url">;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}) {
  const base = cn(
    "grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent font-semibold text-accent-foreground",
    TAMANHOS[tamanho],
    className
  );

  if (perfil.foto_url) {
    return (
      <span className={base} aria-hidden="true">
        {/* Foto pública de 384px já recortada em quadrado; next/image só
            acrescentaria uma camada de otimização sem ganho. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={perfil.foto_url} alt="" className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={base}>
      {iniciais(perfil.nome, perfil.email)}
    </span>
  );
}
