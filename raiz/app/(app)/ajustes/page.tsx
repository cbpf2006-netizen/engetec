import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Bloco, TituloDaPagina } from "@/components/app/Bloco";
import { FormularioDePerfil } from "@/components/app/FormularioDePerfil";
import { perfilAtual } from "@/lib/dados/sessao";

export const metadata: Metadata = { title: "Ajustes" };

export default async function PaginaDeAjustes() {
  const perfil = await perfilAtual();
  if (!perfil) redirect("/login");

  return (
    <div className="flex max-w-2xl flex-col gap-5 sm:gap-6">
      <TituloDaPagina titulo="Ajustes" apoio="Sua conta e como o app calcula os números." />

      <Bloco titulo="Seus dados" descricao="Como você aparece dentro do Raiz.">
        <FormularioDePerfil perfil={perfil} />
      </Bloco>

      {/* O modelo de caixa não é obvio olhando os cartões: dizer em que
          ordem os números se formam evita a conclusão errada de que o saldo
          "está errado" quando um aporte o reduz. */}
      <Bloco titulo="Como o saldo é calculado" descricao="O modelo usado em todas as telas.">
        <dl className="flex flex-col divide-y divide-border text-sm">
          <div className="flex flex-col gap-1 pb-3">
            <dt className="font-medium">Saldo em caixa</dt>
            <dd className="text-muted-foreground">
              Entradas menos saídas, menos aportes e mais resgates, acumulado desde o primeiro
              lançamento. É o dinheiro que ainda está disponível.
            </dd>
          </div>

          <div className="flex flex-col gap-1 py-3">
            <dt className="font-medium">Total investido</dt>
            <dd className="text-muted-foreground">
              Aportes menos resgates. Um aporte não some do seu dinheiro: sai do caixa livre e passa
              a contar aqui. Sem cotação de mercado — é o valor aportado, não o de mercado.
            </dd>
          </div>

          <div className="flex flex-col gap-1 py-3">
            <dt className="font-medium">Patrimônio</dt>
            <dd className="text-muted-foreground">Saldo em caixa mais total investido.</dd>
          </div>

          <div className="flex flex-col gap-1 py-3">
            <dt className="font-medium">Contas a pagar</dt>
            <dd className="text-muted-foreground">
              Enquanto pendentes, não entram em nenhuma soma — o dinheiro ainda não saiu. Ao marcar
              como paga, o app cria a saída na data do pagamento; ao desmarcar, apaga essa saída.
            </dd>
          </div>

          <div className="flex flex-col gap-1 pt-3">
            <dt className="font-medium">Período</dt>
            <dd className="text-muted-foreground">
              Entradas, saídas e aportes mostram apenas o intervalo escolhido. Saldo, total
              investido e patrimônio acumulam até o fim desse intervalo, porque um saldo que zera
              ao trocar de mês seria um saldo errado.
            </dd>
          </div>
        </dl>
      </Bloco>

      <Bloco titulo="Privacidade" descricao="Quem enxerga seus lançamentos.">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Apenas você. O isolamento é garantido por políticas no próprio banco de dados (Row Level
          Security), então nem um erro na interface daria acesso aos dados de outra conta.
        </p>
      </Bloco>
    </div>
  );
}
