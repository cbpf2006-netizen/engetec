import { CartaoIndicadorEsqueleto } from "@/components/app/CartaoIndicador";
import { EsqueletoDeGrafico, EsqueletoDeLista } from "@/components/app/EstadoVazio";
import { Skeleton } from "@/components/ui/skeleton";

/* Esqueleto com a mesma estrutura das páginas do app: título, barra de
   período, quatro cartões, gráfico e lista. Blocos com a altura certa evitam o
   pulo de layout quando o conteúdo real chega — que é o ponto de ter
   esqueleto, e não um spinner no meio da tela. */
export default function Carregando() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6" aria-busy="true" aria-label="Carregando">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Skeleton className="h-[4.5rem] rounded-2xl sm:h-16" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <CartaoIndicadorEsqueleto key={indice} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-2xl bg-card pt-5 ring-1 ring-border xl:col-span-2">
          <div className="flex flex-col gap-2 px-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
          <EsqueletoDeGrafico />
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-card py-5 ring-1 ring-border">
          <div className="flex flex-col gap-2 px-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="grid place-items-center px-5">
            <Skeleton className="size-40 rounded-full" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card pt-5 ring-1 ring-border">
        <div className="flex flex-col gap-2 px-5 pb-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="border-t border-border">
          <EsqueletoDeLista />
        </div>
      </div>
    </div>
  );
}
