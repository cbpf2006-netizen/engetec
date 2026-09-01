---
name: engetec-design-system
description: Sistema de design da Engetec (instalações elétricas, Araruama/RJ). Fonte única de verdade visual para qualquer interface da marca. Use SEMPRE que for criar, alterar, revisar ou estender qualquer página, seção, componente ou landing page da Engetec — home, sobre, serviços, projetos, contato, formulários, galerias, novas seções. Define tokens de cor, tipografia, espaçamento, superfícies, raios, componentes, animação, responsividade e acessibilidade. Não improvise valores visuais sem consultar esta skill.
version: 1.0.0
user-invocable: true
---

# Engetec Design System

Você é o design lead da Engetec. Este documento é a especificação visual completa. Ele é **normativo, não sugestivo**. Todo valor visual que você escrever deve sair daqui ou ser derivado das escalas daqui.

Este sistema é um port estrutural de um design system de terminal financeiro de alta densidade. A **estrutura, filosofia, proporções, ritmo, hierarquia e comportamento foram preservados integralmente**. O que foi adaptado é a identidade cromática, a linguagem decorativa e a política de imagens, para servir uma empresa de engenharia elétrica.

---

## 1. Design Philosophy

A Engetec se apresenta como **painel de instrumentação industrial**: tela quase preta em grafite quente, conteúdo carregado por brancos e prateados acromáticos, e cor cromática **racionada** — vermelho para ação e identidade, amarelo como pontuação luminosa. A interface é esparsa e cinematográfica. A escala vem da tipografia, não do volume de elementos.

Cinco princípios que governam toda decisão:

1. **Cor é racionada.** Conteúdo é acromático (branco, névoa, prata). Vermelho e amarelo aparecem em quantidade mínima e sempre com função. Se um elemento pode ser prateado, ele é prateado.
2. **Profundidade vem de superfície, nunca de sombra.** A hierarquia é uma pilha de grafites (profundo → base → elevado). Nada tem `box-shadow`. A sensação é de camadas de metal empilhadas, não de papel levantado.
3. **Peso único no display.** Todos os títulos em weight 500. Sem bold, sem light. A confiança vem do tracking negativo agressivo em escala, não de peso.
4. **Rótulos são instrumentação.** Todo eyebrow/kicker é maiúsculo, monoespaçado, com tracking positivo largo. Isso é a assinatura do sistema e aparece em toda seção estruturada.
5. **Espaço é intencional.** Densidade é *spacious*. Seções respiram em 68px+. Colunas de texto param em ~600px. Não preencha espaço disponível só porque ele existe.

O sistema deve transmitir: **engenharia + energia + segurança + precisão + tecnologia + profissionalismo.**
Nunca: festivo, infantil, promocional, barato.

### Adaptações declaradas em relação ao sistema de origem

Registre estas quatro decisões, elas são deliberadas e não devem ser revertidas:

| Origem | Engetec | Justificativa |
|---|---|---|
| Pilha de superfícies em teal saturado | Pilha de grafite com viés quente para o vermelho da marca | A regra é "pilha de 3 níveis numa mesma família de matiz". Grafite de baixa croma lê como ferro e instrumentação; teal lia como água. |
| Rótulos maiúsculos na face de display | Rótulos maiúsculos em monoespaçada | A intenção declarada na origem era "ler como etiqueta de instrumentação técnica". Mono entrega essa intenção literalmente para uma marca de engenharia. |
| Gradiente assinatura preenchendo o CTA | Gradiente assinatura restrito a fios, arestas, trilhos e regras de 3px | Um gradiente vermelho→amarelo não sustenta texto acessível em nenhuma direção. A regra preservada é "gradiente é o gesto cromático racionado", não "gradiente é fundo de botão". |
| Sem fotografia, só grafismo abstrato | Fotografia real da empresa é prioritária, grafismo abstrato é suporte | Empresa de serviço de campo prova competência com obra registrada. O grafismo abstrato permanece como elemento de balanço de coluna. |

---

## 2. Color System

### Tokens semânticos

Nunca escreva hexadecimal em componente. Use sempre o token.

```css
/* Marca */
--color-primary:            #e01b22;  /* vermelho Engetec — ação e identidade */
--color-primary-dark:       #b01218;  /* hover/pressed do primário */
--color-primary-light:      #ff4b4f;  /* texto vermelho sobre superfície elevada, ícones */

--color-secondary:          #ffc400;  /* amarelo — pontuação luminosa */
--color-secondary-dark:     #d9a600;
--color-secondary-light:    #ffdb5c;

--color-accent:             #f7941d;  /* âmbar — SOMENTE meio de gradiente */

/* Superfícies (a pilha de grafite) */
--color-background-deep:    #100d0c;  /* nível -1: poço recuado, rodapé */
--color-background:         #171413;  /* nível 0: canvas da página */
--color-surface:            #221d1b;  /* nível 1: card elevado */
--color-surface-raised:     #2e2724;  /* nível 2: hairline, chip, estado hover de card */
--color-surface-inactive:   #6e6866;  /* aço: estado inativo, nunca texto */

/* Texto */
--color-text-primary:       #ffffff;  /* títulos, nav, traço de ícone */
--color-text-emphasis:      #fbf6f4;  /* corpo enfatizado, rótulos de seção */
--color-text-secondary:     #b6adab;  /* corpo padrão, descrições */
--color-text-tertiary:      #efedec;  /* citações, depoimentos */
--color-text-muted:         #6e6866;  /* desabilitado, metadados */

/* Bordas */
--color-border:             rgba(255, 255, 255, 0.10);
--color-border-strong:      rgba(255, 255, 255, 0.18);
--color-border-hairline:    rgba(255, 255, 255, 0.055);

/* Gradientes — uso restrito, ver seção 2.4 */
--gradient-corrente:  linear-gradient(90deg, #e01b22 0%, #f7941d 58%, #ffc400 100%);
--gradient-descarga:  linear-gradient(90deg, #ffc400 0%, #ffdb5c 40%, #fff3c4 100%);
```

### 2.1 Papel de cada cor

| Token | Onde usar | Onde NUNCA usar |
|---|---|---|
| `--color-primary` | CTA primário, rótulo de seção (o traço antes do texto), numeração de item, ícone ativo, regra de 3px no topo de seção crítica | Corpo de texto, fundo de seção inteira, fundo de card |
| `--color-secondary` | Estatísticas grandes, contadores, numerais de destaque, anel de foco, item de nav ativo sobre escuro, ícone de diferencial | Corpo de texto, fundo de botão com texto branco, mais de 2 elementos por dobra |
| `--color-accent` | Exclusivamente como parada intermediária de gradiente | Qualquer superfície sólida, texto, ícone |
| `--color-text-primary` | H1–H4, nav, traço de ícone | Parágrafo corrido |
| `--color-text-secondary` | Todo parágrafo corrido, descrição de card | Título |

### 2.2 Proporção cromática obrigatória

Em qualquer viewport preenchida:

- **~92%** da área é grafite + acromático.
- **~6%** é vermelho.
- **~2%** é amarelo.

O amarelo é sempre menos frequente que o vermelho. Se você contar mais de **dois** elementos amarelos numa dobra, remova até sobrar dois. Vermelho e amarelo nunca aparecem em quantidades comparáveis — isso derruba o sistema para "infantil".

### 2.3 Contraste verificado

Todos os pares abaixo foram medidos. Use-os. Não invente pares novos sem medir.

| Combinação | Ratio | Uso permitido |
|---|---|---|
| `#ffffff` sobre `--color-background` | 18.1:1 | Qualquer texto |
| `#fbf6f4` sobre `--color-background` | 17.4:1 | Qualquer texto |
| `#b6adab` sobre `--color-background` | 9.2:1 | Qualquer texto |
| `#b6adab` sobre `--color-surface` | 8.5:1 | Qualquer texto |
| `#ffc400` sobre `--color-background` | 11.3:1 | Qualquer texto, estatísticas |
| `#ffffff` sobre `--color-primary` | 4.8:1 | Texto normal (AA) — é assim que o CTA primário funciona |
| `#e01b22` sobre `--color-background` | 3.8:1 | **Somente** texto grande (≥24px ou ≥19px bold), ícones, bordas, traços |
| `#6e6866` sobre `--color-background` | 3.3:1 | **Somente** bordas e estados desabilitados. Nunca texto. |

Regra derivada: **vermelho nunca é cor de texto pequeno sobre escuro.** Para texto vermelho pequeno use `--color-primary-light` (#ff4b4f, 5.9:1) ou não use vermelho.

### 2.4 Gradientes

O gradiente é o gesto cromático de assinatura. Ele é **racionado ao extremo**.

**PERMITIDO:**
- Regra horizontal de 2–3px no topo de uma seção de conversão.
- Trilho de progresso da seção "processo".
- Hairline de 1px na aresta de um card em destaque.
- Sublinhado animado do link ativo.
- Traço do rótulo de seção quando a seção é a principal da página (máximo uma por página).

**PROIBIDO:**
- Fundo de qualquer seção.
- Fundo de qualquer card.
- Preenchimento de botão.
- Texto com gradiente (`background-clip: text`) — banido sem exceção.
- Qualquer superfície maior que 4px de espessura numa das dimensões.
- Mais de **três** ocorrências de gradiente por página.

Se você precisa de uma superfície colorida, use `--color-primary` sólido.

---

## 3. Typography System

### Faces

| Papel | Família | Token | Pesos | Substituto se ausente |
|---|---|---|---|---|
| Display + corpo | **Archivo** | `--font-display` / `--font-sans` | 400, 500 | Inter, DM Sans, Satoshi |
| Instrumentação | **IBM Plex Mono** | `--font-mono` | 400, 500 | ui-monospace, SFMono-Regular |

Duas famílias. Nunca introduza uma terceira. Ambas já estão carregadas via `next/font/google` em `app/layout.tsx` — não adicione dependência de fonte.

### Estratégia de peso — regra central do sistema

- **500** para todos os títulos (H1–H4), rótulos, botões, nav, estatísticas.
- **400** para todo corpo de texto e UI auxiliar.
- **600, 700, 800: banidos.** **300, 200: banidos.**

A confiança tipográfica vem do tracking negativo em escala, não de peso. Se um título parece fraco, aumente o tamanho e feche o tracking — não engorde o peso.

### Regra de tracking

| Contexto | Tracking |
|---|---|
| Display 86px+ | `-0.046em` |
| Display 61–96px | `-0.04em` |
| Heading 36px | `-0.03em` |
| Subheading 24px | `-0.02em` |
| Corpo 14–20px | `0` |
| Rótulo maiúsculo 20px | `+0.08em` |
| Rótulo maiúsculo 12px | `+0.12em` |
| Caption maiúscula 10px | `+0.15em` |

Tracking positivo só existe em texto **maiúsculo**. Nunca aplique tracking positivo em texto de caixa mista.

### Regra de line-height

Contraste rígido, é o que define o ritmo tipográfico do sistema:

- **1.0** para tudo acima de 36px.
- **1.3** para 24px.
- **1.4** para corpo (14–20px).
- **1.43** para UI de 14px.

Nunca use valores intermediários. Nunca use 1.5 ou 1.6 em display.

---

## 4. Type Scale

```css
--text-caption:      10px;  --leading-caption: 1.4;   --tracking-caption: 0.15em;  /* MAIÚSCULA */
--text-label:        12px;  --leading-label: 1.4;     --tracking-label: 0.12em;    /* MAIÚSCULA */
--text-meta:         13px;  --leading-meta: 1.4;      --tracking-meta: 0.055em;    /* MAIÚSCULA */
--text-ui:           14px;  --leading-ui: 1.43;
--text-body:         16px;  --leading-body: 1.4;
--text-label-lg:     20px;  --leading-label-lg: 1.4;  --tracking-label-lg: 0.08em; /* MAIÚSCULA */
--text-subheading:   24px;  --leading-subheading: 1.3; --tracking-subheading: -0.02em;
--text-heading:      36px;  --leading-heading: 1;      --tracking-heading: -0.03em;
--text-heading-lg:   61px;  --leading-heading-lg: 1;   --tracking-heading-lg: -0.04em;
--text-display:      96px;  --leading-display: 1;      --tracking-display: -0.04em;
--text-kinetic:     240px;  --leading-kinetic: 1;      --tracking-kinetic: -0.046em;
```

### Mapa de papel

| Papel | Token | Família | Peso | Caixa |
|---|---|---|---|---|
| Título de página (H1) | `--text-display` fluido | display | 500 | mista |
| Título de seção (H2) | `--text-heading-lg` fluido | display | 500 | mista |
| Título de card (H3) | `--text-heading` | display | 500 | mista |
| Subtítulo (H4) | `--text-subheading` | display | 500 | mista |
| Corpo | `--text-body` | display | 400 | mista |
| UI / botão / nav | `--text-ui` | display | 400 | mista |
| Rótulo de seção | `--text-label` | **mono** | 500 | MAIÚSCULA |
| Rótulo de estatística | `--text-meta` | **mono** | 400 | MAIÚSCULA |
| Numeração de item (01, 02) | `--text-label` | **mono** | 500 | — |
| Estatística grande | `--text-kinetic` reduzido / `--text-heading-lg` | display | 500 | — |

### Fluidez obrigatória

Títulos nunca são tamanho fixo. Sempre `clamp()`:

```css
h1 { font-size: clamp(2.5rem, 1.4rem + 4.6vw, 6rem); }   /* 40px → 96px */
h2 { font-size: clamp(2rem,   1.3rem + 2.9vw, 3.8rem); } /* 32px → 61px */
h3 { font-size: clamp(1.5rem, 1.2rem + 1.3vw, 2.25rem); }/* 24px → 36px */
```

Texto cinético (o marcador de seção gigante) é opcional e no máximo **um por página**:
```css
.kinetic { font-size: clamp(4.5rem, 2rem + 12vw, 15rem); }
```

### Largura de linha

- Corpo: máximo **68ch**, alvo 60–65ch.
- Título: máximo **17ch**.
- Rótulo: uma linha, sempre.

---

## 5. Spacing System

**Unidade base: 4px. Densidade: spacious.**

```css
--spacing-4: 4px;    --spacing-8: 8px;    --spacing-12: 12px;  --spacing-16: 16px;
--spacing-20: 20px;  --spacing-24: 24px;  --spacing-28: 28px;  --spacing-32: 32px;
--spacing-36: 36px;  --spacing-40: 40px;  --spacing-48: 48px;  --spacing-64: 64px;
--spacing-80: 80px;  --spacing-120: 120px; --spacing-140: 140px; --spacing-160: 160px;
```

**Você só pode usar valores desta escala.** Se precisar de algo entre dois degraus, escolha um dos dois. Não crie 18px, 30px, 52px.

### Aplicação canônica

| Contexto | Valor |
|---|---|
| Gap entre elementos irmãos | `--spacing-20` |
| Gap entre grupos dentro de um bloco | `--spacing-32` |
| Padding interno de card | `--spacing-36` (compacto) a `--spacing-48` (padrão) |
| Padding vertical de poço recuado | `--spacing-120` |
| Gap entre seções | `--spacing-64` mínimo, `--spacing-80` padrão |
| Padding vertical de seção | `--spacing-120` desktop, `--spacing-80` tablet, `--spacing-64` mobile |
| Rótulo → título | `--spacing-24` |
| Título → corpo | `--spacing-28` |
| Corpo → CTA | `--spacing-40` |
| Gap de coluna em nav | `--spacing-16` a `--spacing-24` |

---

## 6. Layout System

```css
--page-max-width: 1440px;
--content-max-width: 1140px;   /* conteúdo dentro do gutter */
--prose-max-width: 600px;      /* coluna de leitura */
--section-gap: 68px;
--gutter-desktop: 40px;
--gutter-tablet: 32px;
--gutter-mobile: 20px;
```

### Regras

1. **Full-bleed escuro, conteúdo contido.** O fundo vai de borda a borda; o conteúdo para em 1440px com gutter.
2. **Texto lê em coluna estreita.** Parágrafos param em ~600px mesmo quando o container é largo. Não estique texto de ponta a ponta.
3. **Assimetria é a norma em seções de conteúdo.** O grid padrão de seção rica é duas colunas desiguais: conteúdo à esquerda (7/12), elemento visual ou decoração à direita (5/12). Nunca 6/6 em seção de conteúdo — 6/6 é para pares comparativos (missão/visão).
4. **Grid de 12 colunas** para composições. Grid auto-fit `minmax(280px, 1fr)` para listas homogêneas.
5. **Nunca preencha por preencher.** Coluna vazia é composição válida. Se o lado direito não tem conteúdo real, deixe vazio ou coloque a geometria decorativa — não invente um card.
6. **Ritmo de bandas.** Seções alternam entre `--color-background` e `--color-background-deep`. A alternância é sutil por design: é meio passo de profundidade, não contraste.

---

## 7. Border Radius

**Vocabulário completo de forma. Exatamente dois valores. Nada mais existe.**

```css
--radius-card:  16px;  /* cards, painéis, imagens, containers de conteúdo */
--radius-small:  6px;  /* botões, inputs, chips, botões de ícone, badges */
```

- Nada acima de 16px. **Sem pill, sem `border-radius: 9999px`** — nem em botão, nem em avatar, nem em badge. O sistema é *sharp-rounded*, não arredondado.
- Nada entre 6 e 16. Não existe 8, 10, 12.
- Exceção única: um indicador circular puramente decorativo com diâmetro ≤12px (ponto de status, nó de diagrama) pode ser `50%`.

---

## 8. Surface System

Quatro níveis. Toda hierarquia visual sai daqui.

| Nível | Token | Valor | Papel |
|---|---|---|---|
| −1 | `--color-background-deep` | `#100d0c` | Poço recuado. Rodapé, painel de CTA final, bloco que deve "afundar". |
| 0 | `--color-background` | `#171413` | Canvas da página. Tudo flutua sobre isso. |
| 1 | `--color-surface` | `#221d1b` | Card elevado. Painéis de conteúdo, cards de feature. |
| 2 | `--color-surface-raised` | `#2e2724` | Hairline, chip, hover de card de nível 1. |

### Regras de profundidade

1. **Zero `box-shadow` no sistema.** Nenhum. Nem `0 1px 2px`. A profundidade é sempre mudança de superfície.
2. **Nunca pule níveis.** Um card nível 1 pode conter um chip nível 2. Não coloque nível 2 diretamente sobre nível −1.
3. **Nunca aninhe cards.** Card dentro de card é sempre erro. Use divisores, espaço ou hairline.
4. **Separação sem card:** para agrupar sem elevar, use `border-top: 1px solid var(--color-border)` ou espaço. A maioria dos agrupamentos não precisa de card.
5. **Hairline grid:** para grades de itens, use `display: grid; gap: 1px; background: var(--color-border-hairline)` com cada célula em `--color-background`. Isso cria uma malha técnica de 1px sem borda em cada célula.
6. **Sem glassmorphism** exceto no header fixo, onde `backdrop-filter: blur(14px)` sobre `--color-background` a 92% de opacidade é permitido e obrigatório.

---

## 9. Component System

Toda dimensão abaixo é normativa.

### 9.1 Primary CTA

- Fundo `--color-primary` sólido. Texto `--color-text-primary`. **Nunca gradiente.**
- Altura 52px (`lg`) / 44px (`md`). Padding horizontal 28px / 20px.
- `--radius-small` (6px). **Nunca pill.**
- Tipografia: `--text-ui` (14px), weight 500, caixa mista.
- Ícone opcional à esquerda, 18–20px, `currentColor`.
- Estados:
  - `default`: `--color-primary`
  - `hover`: `--color-primary-dark`, transição 160ms
  - `active`: `transform: scale(0.975)`
  - `focus-visible`: `outline: 2px solid var(--color-secondary); outline-offset: 3px`
  - `disabled`: `opacity: 0.55; cursor: not-allowed`, sem transform no active
- Máximo **um** CTA primário visível por dobra.

### 9.2 Secondary CTA

- Fundo transparente. `border: 1px solid var(--color-border-strong)`. Texto `--color-text-primary`.
- Mesmas dimensões e raio do primário.
- `hover`: borda e texto viram `--color-secondary`.
- Usado ao lado do primário, nunca sozinho como ação principal.

### 9.3 Ghost / Text Button

- Sem fundo, sem borda, sem padding horizontal.
- Texto `--color-text-secondary`, `--text-ui`.
- `hover`: `--color-text-primary` + sublinhado de 2px em `--color-primary` que cresce da esquerda (`transform: scaleX(0) → scaleX(1)`, origem esquerda, 260ms).
- Para ações de menor prioridade e links de "ver todos".

### 9.4 Arrow Icon Button

- 32×32px, `--radius-small`, fill `rgba(224, 27, 34, 0.14)`.
- Seta diagonal (↗) branca, traço 1.5px.
- Sempre posicionado à direita ou no canto superior direito do título do card, como gatilho de "ir para".
- `hover`: fill vira `--color-primary`, ícone desloca `translate(2px, -2px)`.

### 9.5 Ghost Navigation Link

- `--text-label` (12px), mono, weight 400, MAIÚSCULA, tracking `0.12em`.
- Ativo: `--color-text-primary`. Inativo: `--color-text-secondary`.
- Sem padding horizontal. `column-gap: 16px` a `24px` entre itens.
- Estado ativo marcado por hairline de 2px em `--color-secondary` embaixo.

### 9.6 Uppercase Section Label

Assinatura do sistema. Aparece acima de **toda** H2 de seção estruturada.

- `--text-label` (12px) ou `--text-label-lg` (20px), mono, weight 500, MAIÚSCULA.
- Cor `--color-text-secondary` ou `--color-text-emphasis`.
- Precedido por um traço de 28×2px em `--color-primary`, com `gap: 10px`.
- Em telas ≤420px: 10px, tracking `0.11em`, traço 18px.

```html
<p class="rotulo">SERVIÇOS EXECUTADOS</p>
```

### 9.7 Hero Headline

- `clamp(2.5rem, 1.4rem + 4.6vw, 6rem)`, weight 500, `line-height: 1`, tracking `-0.04em`.
- Cor `--color-text-primary`. Máximo 17ch de largura, **máximo 3 linhas**.
- Subtexto: `--text-body`, `--color-text-secondary`, máximo 20 palavras, máximo 2 linhas.
- CTA visível sem rolar em viewport de 800px de altura.

### 9.8 Oversized Kinetic Text

- `clamp(4.5rem, 2rem + 12vw, 15rem)`, weight 500, `line-height: 1`, tracking `-0.046em`.
- Cor `--color-text-primary` a 6–10% de opacidade, ou `--color-surface-raised`.
- Marcador ambiental de seção, atrás ou ao lado do conteúdo. **Máximo um por página.**
- Sempre `aria-hidden="true"` quando for puramente decorativo.

### 9.9 Surface Card

- Fundo `--color-surface`, `--radius-card` (16px), padding `--spacing-36`.
- Sem sombra, sem borda.
- Título `--text-heading` (36px) weight 500 `--color-text-primary`, `line-height: 1`.
- Corpo `--text-body` weight 400 `--color-text-secondary`.
- `hover` (se clicável): fundo vira `--color-surface-raised`, 280ms. Sem translate, sem sombra, sem escala do card.

### 9.10 Recessed Card

- Fundo `--color-background-deep`, `--radius-card`, padding vertical `--spacing-120`.
- Poço mais profundo da interface. Para painéis de CTA final e blocos adjacentes ao rodapé.
- Respiração máxima é a característica: não comprima o padding vertical.

### 9.11 Feature Row Card

- Fundo transparente, `--radius-card`, padding `--spacing-48` vertical / `--spacing-36` horizontal.
- Separado dos irmãos por `border-bottom: 1px solid var(--color-border)`, não por gap de card.
- Conteúdo: título (H3) + descrição + Arrow Icon Button à direita.
- `hover`: título vira `--color-secondary`, seta desloca.
- Use para listagens de serviço/divisão. É o padrão preferido sobre grade de cards idênticos.

### 9.12 Statistic Counter

Tratamento de ênfase assinatura do sistema.

- Numeral: `clamp(3rem, 2rem + 4vw, 5.4rem)`, weight 500, `line-height: 1`, tracking `-0.046em`, cor **`--color-secondary`**.
- Rótulo abaixo: `--text-meta` (13px), mono, MAIÚSCULA, tracking `0.055em`, cor `--color-text-emphasis`.
- Grade de 3 colunas, divididas por `border-left: 1px solid var(--color-border)`.
- Anima contando de 0 ao entrar na viewport (ver seção 12).
- **Só estatística usa amarelo em escala.** Nenhum outro elemento grande é amarelo.

### 9.13 Navigation Bar

- `position: fixed`, largura total, altura 88px no topo → 68px após rolagem, transição 300ms.
- No topo: fundo transparente, sem borda.
- Após rolar 16px: fundo `--color-background` a 92%, `backdrop-filter: blur(14px)`, `border-bottom: 1px solid var(--color-border)`.
- Logo à esquerda (altura 36–44px), nav ao centro, CTA primário à direita.
- Mobile (<1024px): logo + CTA compacto + botão hambúrguer 44×44px com borda `--color-border`.
- Menu mobile: painel full-screen `--color-background-deep`, itens em `--text-heading` weight 500, numerados em mono, entrada escalonada de 55ms, fecha com `Escape` e ao navegar.

### 9.14 Footer

- Fundo `--color-background-deep`, padding vertical `--spacing-120`.
- Grid de 4 colunas: marca+descrição (1.4fr), navegação, serviços, contato.
- Títulos de coluna: `--text-label` mono MAIÚSCULA `--color-text-primary`.
- Links: `--text-ui` `--color-text-secondary`, hover `--color-secondary`.
- Barra inferior separada por `border-top: 1px solid var(--color-border-hairline)`, `--text-ui` reduzido.

### 9.15 Photo Frame

Componente novo, criado pela política de imagens da Engetec.

- `--radius-card` (16px), `overflow: hidden`, `object-fit: cover`.
- Proporções permitidas: `4/5` (retrato), `4/3` (padrão), `16/10` (largura), `3/1` (faixa). Nenhuma outra.
- Scrim obrigatório quando houver texto sobreposto:
  `linear-gradient(to top, rgba(16,13,12,0.92) 0%, rgba(16,13,12,0.62) 38%, rgba(16,13,12,0.12) 72%)`
- Cantos técnicos opcionais: dois brackets de 18×18px, borda 2px `--color-secondary`, no canto superior esquerdo e inferior direito, `z-index: 2`.
- `hover` (se clicável): `scale(1.04)` na imagem, 700ms, `ease-out`. O container não se move.
- Sem filtro, sem duotone, sem overlay colorido. A foto é documento, não decoração.

### 9.16 Gallery

- Grid assimétrico de 12 colunas com `auto-rows` fixa (ex.: `17rem`).
- Composição padrão: item 1 `col-span-4 row-span-2` (retrato alto), item 2 `col-span-8`, itens 3 e 4 `col-span-4`.
- Legenda sobre o scrim, `--text-ui` weight 500 branco, canto inferior esquerdo, padding 20px.
- Lightbox via `<dialog>` nativo com `showModal()`. Navegação por seta esquerda/direita, fecha com `Escape` e clique no backdrop.
- Mobile: coluna única, proporções `3/4` e `4/3` alternadas.

### 9.17 Form

- Label **acima** do input, `--text-ui` weight 500 `--color-text-primary`. Nunca placeholder como label.
- Input: altura 48px, `--radius-small`, fundo `--color-surface`, `border: 1px solid var(--color-border)`, texto `--color-text-primary`, placeholder `--color-text-muted`.
- `hover`: borda `--color-border-strong`. `focus`: borda `--color-primary`.
- Erro: borda `--color-primary`, mensagem abaixo em `--color-primary-light`, ligada por `aria-describedby`.
- Validação **no blur**, nunca a cada tecla.
- Textarea: `resize: vertical`, mínimo 5 linhas.
- Campo obrigatório marcado com asterisco `--color-primary` e `aria-hidden="true"`.

### 9.18 Circuit Rail — elemento decorativo

Substitui a esfera de partículas do sistema de origem.

- Hairline de 1–2px com `--gradient-corrente`, correndo horizontal no topo de uma seção ou ligando etapas de um processo.
- Pode carregar um "pulso de corrente": um ponto de 4px em `--color-secondary` percorrendo o trilho via `offset-path`, ciclo de 3–5s, `opacity` entrando e saindo nas pontas.
- Máximo **um** trilho animado por página.

### 9.19 Bus-bar Geometry — ilustração decorativa

Substitui o diagrama molecular do sistema de origem.

- Formas planas: círculos brancos/prata, linhas conectoras finas (1px), retângulos de barramento, nós.
- Traço `--color-text-secondary` a 30–50% de opacidade. Sem preenchimento complexo, sem gradiente, sem sombra.
- Ocupa a coluna direita (5/12) de uma seção assimétrica, como balanço.
- SVG inline, `aria-hidden="true"`, `currentColor`.

### 9.20 Technical Mesh — fundo

- Grade de 96×96px em `--color-border-hairline`, 1px.
- Aplicada como camada de fundo em hero e seções de destaque, `position: absolute; inset: 0`.
- Nunca sobre uma seção com foto de fundo.

---

## 10. Section Rules

Toda seção estruturada segue esta anatomia:

```
[ rótulo maiúsculo mono com traço vermelho ]
[ H2 fluido, weight 500, máx 17ch ]
[ parágrafo opcional, máx 600px, --color-text-secondary ]
[ espaço --spacing-48 ]
[ conteúdo ]
```

Regras:

1. Padding vertical `--spacing-120` desktop / `--spacing-80` tablet / `--spacing-64` mobile.
2. Alternância de superfície entre seções consecutivas (nível 0 ↔ nível −1).
3. Uma seção por página pode carregar a regra de 3px com `--gradient-corrente` no topo. É a seção de conversão.
4. Nunca duas seções consecutivas com a mesma estrutura de grade. Varie: assimétrica → grade → lista → assimétrica.
5. `scroll-margin-top: 96px` em toda seção com âncora.

---

## 11. Icon Rules

- Grade de 24×24, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`.
- `stroke-width: 1.5`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Geometria precisa e fina. Sem ícones "desenhados à mão", sem preenchimento sólido exceto glifos de marca (WhatsApp, Instagram) e o raio da identidade.
- Tamanhos permitidos: 16, 18, 20, 24, 28px. Nenhum outro.
- Cor: `--color-text-secondary` em repouso, `--color-primary` ou `--color-secondary` quando ativo/em destaque.
- Ícone nunca aparece sozinho sem rótulo ou `aria-label`.
- Todo SVG decorativo: `aria-hidden="true" focusable="false"`.

---

## 12. Animation Rules

### Tokens de movimento

```css
--ease-out:   cubic-bezier(0.23, 1, 0.32, 1);   /* padrão para entrada e saída */
--ease-inout: cubic-bezier(0.65, 0, 0.35, 1);   /* só para loops contínuos */
--duration-fast:   160ms;  /* feedback de botão, cor */
--duration-medium: 260ms;  /* hover de card, sublinhado */
--duration-slow:   620ms;  /* revelação por scroll */
--duration-image:  700ms;  /* zoom de foto */
```

### Regras absolutas

1. **Anime somente `transform` e `opacity`.** Nunca `width`, `height`, `top`, `left`, `margin`, `padding`, `background-position`.
2. **Nunca `ease-in` em UI.** Entrada e saída usam `--ease-out`.
3. **UI abaixo de 300ms.** Só revelação por scroll e zoom de imagem passam disso.
4. **Nunca parta de `scale(0)`.** Escala mínima de entrada é `0.965`.
5. **Toda animação precisa de motivo:** feedback, mudança de estado, continuidade espacial, ou evitar salto brusco. "Fica legal" não é motivo.
6. **Nunca anime ação iniciada por teclado.**

### Padrões canônicos

| Padrão | Especificação |
|---|---|
| Revelação por scroll | `opacity 0→1` + `translateY(18px→0)`, `--duration-slow`, `--ease-out`, `IntersectionObserver` com `threshold: 0.08` e `rootMargin: "0px 0px -12% 0px"`, desconecta após revelar |
| Escalonamento de lista | 70ms entre itens, máximo 6 itens escalonados, depois revele em bloco |
| Entrada de hero | `translateY(18px→0)` + fade, 720ms, atrasos de 60/140/220/300ms para rótulo/título/corpo/CTA |
| Hover de botão | cor em `--duration-fast` |
| Press de botão | `scale(0.975)` |
| Hover de card | mudança de superfície em `--duration-medium`, sem transform |
| Hover de foto | `scale(1.04)` em `--duration-image` |
| Sublinhado de link | `scaleX(0→1)` origem esquerda, `--duration-medium` |
| Contador | `easeOutExpo`, 1400ms, dispara em `threshold: 0.4`, uma única vez |
| Trilho de processo | `scaleX(0→1)` origem esquerda, `--duration-slow` |
| Pulso de corrente | `offset-distance 0→100%`, 3–5s, loop, `--ease-inout` |

### Reduced motion — obrigatório

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  [data-revelar] { opacity: 1; transform: none; }
  html { scroll-behavior: auto; }
}
```

Todo componente animado deve renderizar **completo e correto** com movimento reduzido. Contadores mostram o valor final imediatamente. Elementos revelados aparecem posicionados. Nenhum conteúdo pode ficar invisível.

---

## 13. Imagery Rules

**A Engetec prioriza fotografia real da empresa.** Esta é a divergência declarada em relação ao sistema de origem.

Hierarquia de imagem:

1. **Foto real de obra, equipe ou instalação executada** — sempre a primeira escolha.
2. **Foto ilustrativa** — aceitável apenas em card de serviço, nunca em galeria de obras. Nunca apresentada como trabalho executado.
3. **Geometria abstrata** (seção 9.19) — quando não há foto adequada.
4. **Nada** — coluna vazia é melhor que imagem de preenchimento.

Regras de tratamento:

- Todas as fotos passam pelo **Photo Frame** (9.15). Sem exceção.
- Proporção sempre de um dos quatro valores permitidos.
- `alt` descritivo do que a foto mostra, em português, nunca "imagem" ou o nome do arquivo.
- Foto de fundo de seção: opacidade 25–30% + gradiente de escurecimento. O texto sempre lê a 4.5:1 mínimo sobre a região onde ele cai.
- **Nunca** aplique filtro, duotone, overlay colorido ou correção de cor que altere a realidade da obra.
- Foto de baixa resolução nunca ocupa espaço grande. Se a resolução não sustenta o slot, use a foto num slot menor e outra imagem no slot grande.
- `next/image` com `fill` + `sizes` correto, `priority` só na imagem acima da dobra.

---

## 14. Responsive Rules

### Breakpoints

```
mobile   : 360 – 639px
tablet   : 640 – 1023px
laptop   : 1024 – 1279px
desktop  : 1280 – 1439px
wide     : 1440px+
```

Testar obrigatoriamente em: 1920, 1440, 1366, 1280, 1024, 768, 430, 414, 390, 375, 360.

### O que muda em cada faixa

| Aspecto | Desktop | Tablet | Mobile |
|---|---|---|---|
| Gutter | 40px | 32px | 20px |
| Padding de seção | 120px | 80px | 64px |
| Grade de conteúdo | 12 col assimétrica | 2 col ou empilhada | 1 col |
| H1 | até 96px | ~56px | 40px |
| H2 | até 61px | ~40px | 32px |
| Título de card (H3) | 36px | 28px | 24px |
| Corpo | 16px | 16px | 16px (nunca reduza) |
| Rótulo | 12px | 12px | 10px, tracking 0.11em |
| Padding de card | 48px | 36px | 24px |
| Nav | links inline | hambúrguer + CTA | hambúrguer + CTA |
| Galeria | grid assimétrico | 2 col | 1 col |
| Estatísticas | 3 col com divisor vertical | 3 col | 1 col empilhada com divisor horizontal |

### Regras

1. **Mobile tem composição própria**, não é o desktop encolhido. Uma seção assimétrica de duas colunas vira empilhada com a imagem depois do CTA, não uma coluna espremida.
2. **Corpo nunca desce abaixo de 16px** em nenhuma tela.
3. **Alvo de toque mínimo 44×44px** em qualquer viewport de toque.
4. **Zero scroll horizontal**, sempre. `overflow-x: clip` no `body` é rede de segurança, não solução — encontre o elemento que estoura.
5. Conteúdo largo (tabela, diagrama, bloco de código) rola dentro do próprio container com `overflow-x: auto`.
6. `dvh` em vez de `vh` para altura de viewport.

---

## 15. Accessibility Rules

1. **Contraste:** corpo ≥ 4.5:1, texto grande (≥24px ou ≥19px weight 500) ≥ 3:1, indicador de foco e borda de controle ≥ 3:1. Use a tabela da seção 2.3.
2. **Foco visível:** `outline: 2px solid var(--color-secondary); outline-offset: 3px`. Nunca `outline: none` sem substituto em `:focus-visible`.
3. **Teclado:** toda ação alcançável e operável por teclado. Modal com `<dialog>` nativo + `showModal()` (traps de foco e `inert` de graça). `Escape` fecha.
4. **Semântica:** `<header> <nav> <main> <section> <article> <footer>`. Hierarquia de heading sem pular nível. Um `<h1>` por página.
5. **Skip link** para `#conteudo` como primeiro elemento focável.
6. **`aria-current="page"`** no item de nav ativo.
7. **Rótulo em todo controle de formulário**, ligado por `htmlFor`/`id`. Erro ligado por `aria-describedby` e `aria-invalid`.
8. **`alt` em toda imagem informativa**, `alt=""` + `aria-hidden` em decorativa.
9. **Ícone sozinho exige `aria-label`.**
10. **`prefers-reduced-motion` respeitado** em todo componente.
11. **`lang="pt-BR"`** no `<html>`.
12. Estética nunca justifica quebrar qualquer item desta lista.

---

## 16. NON-NEGOTIABLE RULES

Estas regras não admitem exceção. Se uma implementação as viola, a implementação está errada.

1. **Não invente identidade visual nova.** Não existe "uma variação para esta página".
2. **Não use cor fora do sistema.** Nada de azul, verde, roxo, laranja além do `--color-accent` em gradiente. Nada de cinza neutro puro — os neutros do sistema têm viés quente.
3. **Não escreva hexadecimal em componente.** Sempre token.
4. **Não crie espaçamento fora da escala.** Nada de 18px, 30px, 52px.
5. **Não crie raio fora de 6px e 16px.** Nada de pill, nada de 8/10/12/24px.
6. **Não use `box-shadow`.** Profundidade é superfície.
7. **Não use weight 600+ nem 300−.** Só 400 e 500.
8. **Não use gradiente como fundo, preenchimento de botão ou texto.** Só fio, aresta, trilho e regra de até 4px.
9. **Não use amarelo em texto corrido nem em mais de dois elementos por dobra.**
10. **Não use vermelho em texto pequeno sobre fundo escuro.** 3.8:1 não passa.
11. **Não aninhe cards.**
12. **Não anime `width`, `height`, `top`, `left`, `margin` ou `padding`.**
13. **Não ultrapasse 300ms em animação de UI.**
14. **Não crie componente por estética.** Todo componente resolve um problema de conteúdo.
15. **Não permita scroll horizontal em nenhuma largura.**
16. **Não sacrifique responsividade, acessibilidade ou performance por efeito visual.**
17. **Não invente conteúdo institucional.** Sem depoimento falso, número inventado, certificação inexistente ou cliente fictício. Se o dado não existe, o componente é estruturado para receber depois.
18. **Não use Lorem ipsum.**

---

## 17. Priority Hierarchy

Quando duas decisões conflitarem, a de cima vence. Nunca sacrifique um item superior por um inferior.

1. Identidade da Engetec
2. Regras estruturais deste sistema
3. Hierarquia visual
4. UX
5. Legibilidade
6. Acessibilidade
7. Responsividade
8. Performance
9. Decoração

Exemplo de aplicação: se o gradiente de assinatura (9, decoração) prejudica o contraste do texto (6, acessibilidade), o gradiente sai.

---

## 18. Do's

- **FAÇA** usar o token semântico de superfície para diferenciar níveis.
- **FAÇA** manter todo título em weight 500 e fechar o tracking conforme a escala.
- **FAÇA** abrir toda seção estruturada com o rótulo maiúsculo mono e o traço vermelho.
- **FAÇA** usar amarelo exclusivamente em estatísticas grandes, foco e item ativo.
- **FAÇA** parar o parágrafo em 600px mesmo com container largo.
- **FAÇA** montar seções assimétricas 7/5, não 6/6.
- **FAÇA** usar `line-height: 1` acima de 36px e `1.4` no corpo.
- **FAÇA** priorizar fotografia real da empresa sobre qualquer grafismo.
- **FAÇA** usar `<dialog>` nativo para lightbox e modal.
- **FAÇA** desconectar o `IntersectionObserver` depois de revelar.
- **FAÇA** verificar o contraste antes de fixar qualquer par novo de cores.
- **FAÇA** deixar coluna vazia quando não houver conteúdo real para ela.

## 19. Don'ts

- **NÃO FAÇA** escolher cor arbitrária fora dos tokens.
- **NÃO FAÇA** criar raio novo sem justificativa — o vocabulário tem exatamente dois valores.
- **NÃO FAÇA** usar sombra para elevar nada.
- **NÃO FAÇA** aplicar gradiente em fundo, botão ou texto.
- **NÃO FAÇA** grade de cards idênticos quando uma lista com hairline resolve melhor.
- **NÃO FAÇA** rótulo maiúsculo em toda seção sem estrutura — ele marca seção, não decora.
- **NÃO FAÇA** texto em caixa alta em parágrafo.
- **NÃO FAÇA** empilhar mais de dois elementos amarelos numa dobra.
- **NÃO FAÇA** hero com mais de 3 linhas de título.
- **NÃO FAÇA** animação sem motivo funcional.
- **NÃO FAÇA** `outline: none` sem substituto em `:focus-visible`.
- **NÃO FAÇA** reduzir o corpo abaixo de 16px em mobile.
- **NÃO FAÇA** usar travessão (—) em texto de interface. Use vírgula, dois-pontos ou ponto.
- **NÃO FAÇA** jargão de marketing: "soluções inovadoras", "excelência incomparável", "referência absoluta".

---

## 20. Implementation Guidelines

### Onde os tokens vivem

Fonte única: **`app/design-tokens.css`**, importado por `app/globals.css`. Nenhum outro arquivo declara token de cor, tipografia, espaçamento, raio ou transição.

A cópia canônica está em `reference/tokens.css` desta skill. Se `app/design-tokens.css` divergir dela, a skill é a verdade e o projeto deve ser corrigido.

### Stack do projeto

- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4.
- Tailwind v4 configurado via `@theme inline` no CSS, sem `tailwind.config`.
- Fontes via `next/font/google`: Archivo + IBM Plex Mono. **Não adicione fonte nova.**
- **Não instale biblioteca de animação.** Todo movimento é CSS + `IntersectionObserver`.
- **Não instale biblioteca de componentes.** Componentes são escritos à mão seguindo a seção 9.

### Convenções de código

- Componentes em `components/<área>/<Nome>.tsx`, nomes em português.
- Dados institucionais centralizados em `lib/empresa.ts`. Componente nunca hardcoda telefone, endereço, e-mail ou lista de serviços.
- Server Component por padrão. `"use client"` só quando houver estado, efeito ou evento.
- Classe Tailwind referencia token: `bg-[var(--color-surface)]`, não `bg-neutral-900`.
- Um componente reutilizável para revelação (`Revelar`), um para contador (`Contador`), um para botão (`Botao`/`BotaoLink`). Não reimplemente.

### Ordem de trabalho ao criar uma página nova

1. Escreva o conteúdo real primeiro. Sem conteúdo, não há hierarquia.
2. Defina a sequência de seções e a alternância de superfície.
3. Monte a estrutura semântica com tokens, sem estilizar detalhe.
4. Aplique a escala tipográfica e o espaçamento.
5. Adicione movimento por último, só onde há motivo.
6. Rode a checklist da seção 21.

---

## 21. Quality Checklist

Antes de considerar qualquer trabalho visual concluído, verifique item a item. Um item falho invalida a entrega.

**Cor**
- [ ] Nenhum hexadecimal fora de `design-tokens.css`
- [ ] Proporção ~92% neutro / ~6% vermelho / ~2% amarelo respeitada
- [ ] Máximo dois elementos amarelos por dobra
- [ ] Todo par de cores usado está na tabela de contraste ou foi medido
- [ ] Nenhum vermelho em texto pequeno sobre escuro
- [ ] Máximo três gradientes na página, nenhum como fundo ou texto

**Tipografia**
- [ ] Só weight 400 e 500
- [ ] Título em `line-height: 1`, corpo em `1.4`
- [ ] Tracking negativo em display, positivo só em maiúscula
- [ ] Todo título usa `clamp()`
- [ ] Parágrafo ≤ 68ch, título ≤ 17ch
- [ ] Rótulo de seção em mono maiúscula com traço vermelho

**Espaço e forma**
- [ ] Todo valor de espaçamento vem da escala
- [ ] Só raios 6px e 16px, nenhum pill
- [ ] Zero `box-shadow`
- [ ] Nenhum card aninhado
- [ ] Alternância de superfície entre seções consecutivas

**Layout**
- [ ] Conteúdo contido em 1440px com gutter correto
- [ ] Seção de conteúdo rica é assimétrica, não 6/6
- [ ] Nenhuma coluna preenchida com conteúdo inventado

**Movimento**
- [ ] Só `transform` e `opacity` animados
- [ ] Animação de UI ≤ 300ms
- [ ] `prefers-reduced-motion` testado e conteúdo 100% visível
- [ ] Máximo um trilho animado e um texto cinético por página

**Responsivo**
- [ ] Sem scroll horizontal em 1920, 1440, 1366, 1280, 1024, 768, 430, 414, 390, 375, 360
- [ ] Mobile tem composição própria, não desktop comprimido
- [ ] Corpo ≥ 16px em toda tela
- [ ] Alvo de toque ≥ 44px

**Acessibilidade**
- [ ] Foco visível em todo elemento interativo
- [ ] Navegação completa por teclado, `Escape` fecha overlays
- [ ] Hierarquia de heading sem pular nível, um `<h1>`
- [ ] `alt` correto em toda imagem, decorativa com `aria-hidden`
- [ ] Formulário com label acima, erro ligado por `aria-describedby`

**Conteúdo**
- [ ] Zero Lorem ipsum
- [ ] Zero dado, depoimento, número ou certificação inventada
- [ ] Zero travessão em texto de interface
- [ ] Zero jargão de marketing

**Técnico**
- [ ] `next build` limpo
- [ ] ESLint limpo
- [ ] Zero erro no console do navegador
