# Raiz

Aplicativo de organização financeira pessoal: entradas, saídas, investimentos e
contas a pagar, com saldo, gráficos e histórico por período.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui
(base-nova) · Supabase (Auth + Postgres + RLS) · Recharts · Vercel.

---

## O que você precisa fazer (uma vez)

Tudo o que dava para automatizar já está no repositório. Sobraram dois passos
que dependem de acesso à sua conta.

### 1. Criar as tabelas no Supabase

O arquivo `supabase/migrations/0001_init.sql` cria o schema inteiro: tabelas,
índices, políticas de RLS, as funções de pagar/estornar conta e o gatilho que
prepara cada nova conta com os modelos padrão.

**Pelo painel (mais rápido):**

1. Abra o projeto no Supabase → **SQL Editor** → **New query**.
2. Cole o conteúdo de `supabase/migrations/0001_init.sql`.
3. **Run**.

**Pela linha de comando:**

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npm run db:push
```

O script exige **PostgreSQL 15 ou superior** (usa `ON DELETE SET NULL (coluna)`).
Projetos criados no Supabase nos últimos anos já atendem.

Enquanto o schema não existir, o app abre uma tela explicando esse passo em vez
de dar erro.

### 2. Conferir as URLs de redirecionamento do Auth

Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:3000` em desenvolvimento; o domínio da Vercel
  em produção.
- **Redirect URLs**: adicione `http://localhost:3000/auth/confirmar` e
  `https://SEU-DOMINIO/auth/confirmar`.

Sem isso, o link de confirmação de conta e o de recuperação de senha voltam para
o lugar errado.

> Se quiser testar sem confirmar e-mail, desligue **Confirm email** em
> Authentication → Providers → Email. Com a confirmação ligada, o cadastro
> mostra "abra seu e-mail" em vez de entrar direto.

---

## Rodando localmente

```bash
cp .env.example .env.local   # preencha as duas chaves do Supabase
npm install
npm run dev
```

| Script              | O que faz                                         |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                       |
| `npm run build`     | Build de produção                                 |
| `npm run lint`      | ESLint                                            |
| `npm run tipos`     | `tsc --noEmit`                                    |
| `npm run test`      | Testes das regras financeiras e de período        |
| `npm run verificar` | lint + tipos + testes + build, na ordem            |

---

## Deploy na Vercel

O projeto vive em `engetec/raiz`, uma subpasta do repositório. Na Vercel:

1. **New Project** → importe o repositório.
2. Em **Root Directory**, escolha `raiz`.
3. Framework: Next.js (detectado sozinho).
4. Em **Environment Variables**, adicione as três do `.env.example`
   (`NEXT_PUBLIC_URL_DO_APP` com o domínio final).
5. Deploy. Depois volte ao passo 2 acima e acrescente o domínio da Vercel às
   Redirect URLs do Supabase.

---

## Como o app calcula os números

A regra está escrita e testada em [`lib/financas.ts`](lib/financas.ts). Em
resumo:

```
Caixa(t)      = Σ entradas − Σ saídas − Σ aportes + Σ resgates,  até t
Investido(t)  = Σ aportes − Σ resgates,                          até t
Patrimônio(t) = Caixa(t) + Investido(t)
```

**Investimento é saída de caixa que vira patrimônio.** Ao aportar R$ 1.000, o
dinheiro deixa o caixa livre e reaparece em "investido"; o patrimônio não muda.
É o modelo que responde "quanto eu ainda posso gastar?" sem fingir que o
dinheiro aportado continua disponível.

**Saldo e total investido são estoques**, acumulados desde o primeiro
lançamento até o fim do período escolhido. **Entradas, saídas e aportes são
fluxos**, restritos ao período. Trocar o período move o "até quando", nunca o
começo — um saldo que zera ao virar o mês seria um saldo errado.

**Conta a pagar é compromisso, não movimentação.** Pendente, não entra em soma
nenhuma. Ao marcar como paga, o app cria a saída correspondente na data do
pagamento e guarda o vínculo; ao desmarcar, apaga essa saída. Assim o valor
entra no caixa exatamente uma vez.

---

## Estrutura

```
app/
  (acesso)/          login, cadastro, recuperar, nova-senha
  (app)/             o app em si — layout com barra lateral + as cinco abas
  auth/confirmar/    volta dos links de e-mail (troca código por sessão)
components/
  app/               componentes do produto (cartões, listas, diálogos, barras)
  graficos/          Recharts encapsulado (rosca, barras, linha)
  auth/              formulários de acesso
  ui/                primitivos shadcn/ui
lib/
  financas.ts        REGRAS FINANCEIRAS — fonte única da verdade
  periodo.ts         recorte de período, navegação e baldes de gráfico
  formato.ts         moeda, datas e máscaras em pt-BR
  esquemas.ts        validação (Zod), compartilhada entre formulário e servidor
  catalogo.ts        ícones e cores dos modelos
  dados/             leitura (server-only)
  acoes/             escrita (Server Actions)
  supabase/          clientes de navegador, de servidor e do proxy
supabase/migrations/ schema + RLS
proxy.ts             renovação de sessão e porteiro de rotas
```

### Por que as pastas estão divididas assim

`lib/dados/*` só lê e é `server-only`. `lib/acoes/*` só escreve e são Server
Actions (`"use server"`). Uma Server Action é um endpoint POST acessível
diretamente, então cada uma revalida a sessão e os dados com Zod, mesmo que o
formulário já tenha validado.

Nenhuma tela faz aritmética: as páginas recebem números prontos de
`lib/financas.ts`. É o que garante que o saldo do painel e o saldo da aba de
saídas nunca divirjam.

---

## Segurança

- **RLS ligada em todas as tabelas**, com política por comando e
  `usuario_id = auth.uid()`. O app usa apenas a chave pública (anon); não há
  service role em lugar nenhum.
- **Chaves estrangeiras compostas** (`modelo_id, usuario_id, fluxo`): FK comum
  não passa por RLS, e sem isso alguém poderia lançar uma transação apontando
  para o modelo de outra pessoa.
- **`getUser()` em toda leitura e escrita** — valida o token no servidor do
  Supabase. `getSession()` apenas lê um cookie, que é dado enviado pelo
  navegador.
- **Mensagens de erro não vazam detalhe de banco** nem revelam se um e-mail tem
  conta cadastrada.
- Páginas marcadas com `robots: noindex`.

---

## Acessibilidade e design

- Tema claro e escuro, cada um com seus próprios passos de cor (não é inversão
  automática), respeitando a preferência do sistema.
- Verde e coral — entrada e saída — não se distinguem em daltonismo deutan. Por
  isso a cor nunca aparece sozinha: todo valor leva sinal (+/−), ícone de seta e
  rótulo, e cada gráfico tem a mesma informação em forma de lista.
- Paleta categórica dos gráficos validada para daltonismo nos dois temas
  (8 cores, ordem fixa; a nona categoria vira "Outros").
- Alvos de toque de 44px ou mais, foco visível em tudo, `prefers-reduced-motion`
  respeitado.
- Valores monetários em fonte mono com `tabular-nums`, para uma coluna de
  números alinhar dígito com dígito.

---

## O que ficou preparado, mas não implementado

- **Rentabilidade e saldo de mercado dos investimentos.** A tabela
  `investimentos` já guarda aporte e resgate separadamente; falta apenas uma
  tabela de cotações para calcular retorno.
- **Contas recorrentes.** Hoje cada conta é uma linha; repetir mensalmente é
  acrescentar um campo de recorrência e um gerador.
- **Novas abas** (metas, relatórios): acrescentar um item em
  [`lib/navegacao.ts`](lib/navegacao.ts) já coloca a aba na barra lateral e na
  navegação do celular.
