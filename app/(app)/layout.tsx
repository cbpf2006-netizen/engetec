import { BarraLateral, CabecalhoMobile } from "@/components/app/BarraLateral";
import { NavegacaoInferior } from "@/components/app/NavegacaoInferior";
import { BotoesFlutuantes } from "@/components/app/AcoesDeLancamento";
import { CarteirasProvider } from "@/components/app/CarteirasProvider";
import { ConfiguracaoPendente } from "@/components/app/ConfiguracaoPendente";
import { perfilAtual } from "@/lib/dados/sessao";
import { listarCarteiras } from "@/lib/dados/carteiras";
import { listarModelosPorFluxo } from "@/lib/dados/modelos";
import { schemaAusente } from "@/lib/dados/erros";

/* =============================================================================
   Casca do app

   Desktop: barra lateral fixa à esquerda, conteúdo no resto da tela.
   Celular: cabeçalho no topo, navegação na parte de baixo.

   Os botões flutuantes ficam aqui, e não em cada página, para o atalho de
   lançar entrada/saída existir em qualquer tela — inclusive nas de
   investimentos e contas, onde a pessoa pode lembrar de um gasto no meio de
   outra tarefa.

   Modelos e carteiras são carregados uma vez aqui: o diálogo de lançamento
   precisa dos dois e é um componente cliente, que não pode consultar o banco.
   Os modelos descem por props (cada página já conhece o fluxo do seu bloco);
   as carteiras, por contexto, porque são as mesmas em toda tela.
   ========================================================================== */

export default async function LayoutDoApp({ children }: { children: React.ReactNode }) {
  let perfil: Awaited<ReturnType<typeof perfilAtual>>;
  let modelos: Awaited<ReturnType<typeof listarModelosPorFluxo>>;
  let carteiras: Awaited<ReturnType<typeof listarCarteiras>>;

  try {
    [perfil, modelos, carteiras] = await Promise.all([
      perfilAtual(),
      listarModelosPorFluxo(),
      listarCarteiras(),
    ]);
  } catch (erro) {
    // Projeto conectado, tabelas ausentes: a migration ainda não rodou. Vale
    // uma tela com o passo a passo em vez do erro genérico.
    if (schemaAusente(erro)) return <ConfiguracaoPendente />;
    throw erro;
  }

  // `perfilAtual` redireciona quem não está autenticado; o null aqui é só
  // para o TypeScript.
  if (!perfil) return null;

  return (
    <CarteirasProvider carteiras={carteiras}>
      <div className="flex min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <BarraLateral perfil={perfil} />

        <div className="flex min-w-0 flex-1 flex-col">
          <CabecalhoMobile perfil={perfil} />

          <main className="mx-auto w-full max-w-[68rem] flex-1 px-4 pt-5 pb-32 sm:px-6 lg:px-8 lg:pt-8 lg:pb-16">
            {children}
          </main>
        </div>

        <NavegacaoInferior />
        <BotoesFlutuantes
          modelosDeEntrada={modelos.entrada}
          modelosDeSaida={modelos.saida}
        />
      </div>
    </CarteirasProvider>
  );
}
