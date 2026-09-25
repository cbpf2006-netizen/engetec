import type { Metadata } from "next";
import { CircleAlert, Clock, Receipt } from "lucide-react";

import { TituloDaPagina } from "@/components/app/Bloco";
import { CartaoIndicador } from "@/components/app/CartaoIndicador";
import { ListaDeContas } from "@/components/app/ListaDeContas";
import { listarContas } from "@/lib/dados/contas";
import { listarModelos } from "@/lib/dados/modelos";
import { resumirContas } from "@/lib/financas";
import { hoje, somarDias } from "@/lib/periodo";
import { ehFiltroConta, type FiltroContas } from "@/lib/tipos";

export const metadata: Metadata = { title: "Contas a pagar" };

const DIAS_DE_AVISO = 7;

export default async function PaginaDeContas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const bruto = Array.isArray(parametros.f) ? parametros.f[0] : parametros.f;
  const filtro: FiltroContas = ehFiltroConta(bruto) ? bruto : "todas";

  /* Esta página não usa a barra de período de propósito: uma conta a pagar
     não pertence a um mês fechado — o que importa é o que está em aberto
     agora, independentemente de quando foi cadastrada. */
  const [todas, modelos] = await Promise.all([listarContas("todas"), listarModelos("saida")]);

  const agora = hoje();
  const resumo = resumirContas(todas, agora, somarDias(agora, DIAS_DE_AVISO));

  const contagens: Record<FiltroContas, number> = {
    todas: todas.length,
    pendente: todas.filter((c) => c.situacao === "pendente").length,
    atrasado: todas.filter((c) => c.situacao === "atrasado").length,
    pago: todas.filter((c) => c.situacao === "pago").length,
  };

  const visiveis = filtro === "todas" ? todas : todas.filter((c) => c.situacao === filtro);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <TituloDaPagina
        titulo="Contas a pagar"
        apoio="Compromissos que ainda não saíram do caixa. Ao marcar como paga, a saída é lançada automaticamente."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <CartaoIndicador
          rotulo="Total a pagar"
          quantia={resumo.aPagar}
          icone={Receipt}
          destaque
          contexto={
            contagens.pendente + contagens.atrasado === 0
              ? "Nada em aberto."
              : `${contagens.pendente + contagens.atrasado} conta${contagens.pendente + contagens.atrasado > 1 ? "s" : ""} em aberto.`
          }
        />

        <CartaoIndicador
          rotulo="Vencendo em breve"
          quantia={resumo.venceEmBreve}
          icone={Clock}
          tom="alerta"
          contexto={`Próximos ${DIAS_DE_AVISO} dias · ${resumo.quantidadeEmBreve} conta${resumo.quantidadeEmBreve === 1 ? "" : "s"}.`}
        />

        <CartaoIndicador
          rotulo="Contas atrasadas"
          quantia={resumo.atrasado}
          icone={CircleAlert}
          tom={resumo.quantidadeAtrasada > 0 ? "saida" : "neutro"}
          contexto={
            resumo.quantidadeAtrasada === 0
              ? "Nenhuma conta passou do prazo."
              : `${resumo.quantidadeAtrasada} conta${resumo.quantidadeAtrasada > 1 ? "s" : ""} com vencimento no passado.`
          }
        />
      </div>

      <ListaDeContas
        contas={visiveis}
        modelos={modelos}
        filtro={filtro}
        contagens={contagens}
      />
    </div>
  );
}
