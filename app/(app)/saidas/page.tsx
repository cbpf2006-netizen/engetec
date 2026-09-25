import type { Metadata } from "next";

import { PaginaDeFluxo } from "@/components/app/PaginaDeFluxo";
import { resolverPeriodo } from "@/lib/periodo";

export const metadata: Metadata = { title: "Saídas" };

export default async function PaginaDeSaidas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PaginaDeFluxo fluxo="saida" periodo={resolverPeriodo(await searchParams)} />;
}
