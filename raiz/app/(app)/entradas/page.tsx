import type { Metadata } from "next";

import { PaginaDeFluxo } from "@/components/app/PaginaDeFluxo";
import { resolverPeriodo } from "@/lib/periodo";

export const metadata: Metadata = { title: "Entradas" };

export default async function PaginaDeEntradas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PaginaDeFluxo fluxo="entrada" periodo={resolverPeriodo(await searchParams)} />;
}
