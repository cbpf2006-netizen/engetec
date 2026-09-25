import { formatBRL } from "@/lib/formato";
import type { PontoDaSerie } from "@/lib/financeiro";

export default function GraficoFluxo({
  pontos,
  rotulos,
}: {
  pontos: PontoDaSerie[];
  rotulos: string[];
}) {
  if (pontos.length === 0) {
    return <p className="painel-vazio">Sem movimentações pagas neste período.</p>;
  }

  const maior = Math.max(1, ...pontos.map((p) => Math.max(p.receitas, p.despesas)));

  return (
    <div className="grafico-fluxo">
      {pontos.map((ponto, i) => (
        <div className="grafico-coluna" key={ponto.periodo}>
          <div className="grafico-barras" title={`Acumulado: ${formatBRL(ponto.acumulado)}`}>
            <span
              className="grafico-barra grafico-barra-receita"
              style={{ height: `${(ponto.receitas / maior) * 100}%` }}
            />
            <span
              className="grafico-barra grafico-barra-despesa"
              style={{ height: `${(ponto.despesas / maior) * 100}%` }}
            />
          </div>
          <span className="grafico-rotulo">{rotulos[i]}</span>
        </div>
      ))}
    </div>
  );
}
