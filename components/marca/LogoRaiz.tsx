import { cn } from "@/lib/utils";

/* Glifo-assinatura: uma raiz se ramificando a partir de um caule —
   o mesmo traço aparece (menor, mais discreto) em estados vazios e
   de carregamento pelo app inteiro. */
function GlifoRaiz({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3v8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 11.5c0 3.5-3 3.8-3.6 7.2M12 11.5c0 4 3.4 4.2 4 8M12 11.5c-1.4 2-4.6 2.4-6.2 5.4M12 11.5c1.6 1.6 4.8 1.3 6.6 3.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

export default function LogoRaiz({
  tamanho = "md",
  className,
}: {
  tamanho?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight text-foreground",
        tamanho === "md" ? "text-xl" : "text-base",
        className
      )}
    >
      <GlifoRaiz className={cn("text-primary", tamanho === "md" ? "size-6" : "size-5")} />
      Raiz
    </span>
  );
}
