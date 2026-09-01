/**
 * Dados institucionais da Engetec.
 *
 * Tudo aqui vem de material oficial da empresa (site engetecrj.com.br e
 * fotografias dos trabalhos executados). Nenhum dado foi presumido.
 * Campos ainda sem fonte confiável ficam de fora em vez de serem preenchidos.
 */

export const empresa = {
  nome: "Engetec",
  nomeCompleto: "Engetec Soluções em Serviços Elétricos",
  tagline: "Soluções em Serviços Elétricos",
  cidade: "Araruama",
  estado: "RJ",
  regiao: "Araruama e região dos Lagos",
  anosAtuacao: 5,
  clientes: 100,
  telefone: "(22) 99715-7096",
  telefoneLink: "+5522997157096",
  whatsapp: "5522997157096",
  email: "comercial@engetecrj.com.br",
  instagram: "https://www.instagram.com/engetec_projetos",
  instagramHandle: "@engetec_projetos",
  endereco: {
    logradouro: "Estrada Araruama Rio Bonito, Lot 11A",
    bairro: "Paracatu",
    cidade: "Araruama",
    estado: "RJ",
    completo:
      "Estrada Araruama Rio Bonito, Lot 11A, Paracatu, Araruama - RJ",
  },
  site: "https://engetec.vercel.app",
} as const;

export const mensagemPadraoWhatsapp =
  "Olá! Gostaria de solicitar um orçamento com a Engetec.";

/** Monta o link do WhatsApp com mensagem pré-preenchida. */
export function linkWhatsapp(mensagem: string = mensagemPadraoWhatsapp) {
  return `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export type Servico = {
  id: string;
  numero: string;
  nome: string;
  resumo: string;
  descricao: string;
  itens: string[];
  imagem: string;
  alt: string;
};

/**
 * Os serviços foram identificados a partir das fotografias de obra da própria
 * empresa e do escopo que ela declara (instalações elétricas residenciais e
 * comerciais). Não há descrição textual de serviços na fonte oficial.
 */
export const servicos: Servico[] = [
  {
    id: "instalacoes-prediais",
    numero: "01",
    nome: "Instalações elétricas residenciais e comerciais",
    resumo:
      "Circuitos, pontos, iluminação e infraestrutura elétrica para casas, lojas e empresas.",
    descricao:
      "Execução da instalação elétrica completa, da infraestrutura de eletrodutos ao acabamento. Atendemos obras novas, reformas e ampliações, dimensionando cada circuito para a carga real do imóvel.",
    itens: [
      "Instalação de circuitos e pontos elétricos",
      "Infraestrutura para reformas e obras novas",
      "Iluminação residencial e comercial",
      "Adequação de instalações antigas",
    ],
    imagem: "/img/obra-4.jpg",
    alt: "Técnico da Engetec executando instalação elétrica em painel de distribuição",
  },
  {
    id: "quadros-e-paineis",
    numero: "02",
    nome: "Quadros de distribuição e painéis elétricos",
    resumo:
      "Montagem e instalação de quadros, barramentos e disjuntores de baixa tensão.",
    descricao:
      "Montagem, instalação e adequação de quadros de distribuição e painéis de comando, incluindo barramentos, disjuntores de caixa moldada e cabeamento de potência para cargas comerciais.",
    itens: [
      "Montagem de quadros de distribuição",
      "Painéis de comando e proteção",
      "Barramentos e disjuntores de potência",
      "Cabeamento e identificação de circuitos",
    ],
    imagem: "/img/servicos-instalacoes.png",
    alt: "Eletricista trabalhando em quadro de disjuntores com circuitos identificados",
  },
  {
    id: "energia-solar",
    numero: "03",
    nome: "Energia solar fotovoltaica",
    resumo:
      "Instalação de sistemas fotovoltaicos em telhados residenciais e comerciais.",
    descricao:
      "Instalação de módulos fotovoltaicos, estruturas de fixação e toda a parte elétrica do sistema, do arranjo dos painéis até a conexão ao quadro do imóvel.",
    itens: [
      "Instalação de módulos fotovoltaicos",
      "Estruturas de fixação em telhado",
      "Parte elétrica e conexão ao quadro",
      "Projetos residenciais e comerciais",
    ],
    imagem: "/img/obra-2.jpg",
    alt: "Técnico da Engetec instalando painéis solares em telhado",
  },
  {
    id: "redes-e-postes",
    numero: "04",
    nome: "Redes elétricas, postes e padrão de entrada",
    resumo:
      "Rede aérea, instalação de postes e padrão de entrada de energia.",
    descricao:
      "Serviços em rede elétrica aérea, instalação e substituição de postes e execução do padrão de entrada de energia, com equipe treinada para trabalho em altura.",
    itens: [
      "Rede elétrica aérea",
      "Instalação e troca de postes",
      "Padrão de entrada de energia",
      "Trabalho em altura com equipe treinada",
    ],
    imagem: "/img/obra-3.jpg",
    alt: "Equipe da Engetec instalando poste de energia elétrica",
  },
];

export type Diferencial = {
  titulo: string;
  texto: string;
  icone:
    | "experiencia"
    | "equipe"
    | "seguranca"
    | "atendimento"
    | "qualidade"
    | "inovacao";
};

export const diferenciais: Diferencial[] = [
  {
    icone: "experiencia",
    titulo: "Experiência comprovada",
    texto:
      "Mais de 100 clientes atendidos em projetos e instalações desde a fundação da empresa.",
  },
  {
    icone: "equipe",
    titulo: "Equipe qualificada",
    texto:
      "Profissionais capacitados e atualizados nas normas e tecnologias do setor elétrico.",
  },
  {
    icone: "seguranca",
    titulo: "Segurança como prioridade",
    texto:
      "Cada etapa é executada com foco em segurança, do planejamento à entrega do serviço.",
  },
  {
    icone: "atendimento",
    titulo: "Atendimento personalizado",
    texto:
      "A solução é dimensionada para a necessidade real de cada cliente, sem pacote pronto.",
  },
  {
    icone: "qualidade",
    titulo: "Materiais e execução",
    texto:
      "Compromisso com materiais de qualidade e execução bem feita em todas as instalações.",
  },
  {
    icone: "inovacao",
    titulo: "Tecnologias atuais",
    texto:
      "Uso de tecnologias e soluções modernas aplicadas ao que o projeto realmente exige.",
  },
];

export const valores = [
  "Compromisso com a qualidade em todas as instalações",
  "Segurança como prioridade máxima",
  "Inovação constante em tecnologias",
  "Atuação transparente e responsável",
  "Excelência no atendimento ao cliente",
];

export const missao =
  "Oferecer soluções elétricas eficientes e seguras, com uma abordagem personalizada para cada cliente, utilizando tecnologias avançadas e materiais de qualidade.";

export const visao =
  "Ser referência no mercado de instalações elétricas e a primeira opção para quem busca qualidade, inovação e segurança em projetos elétricos.";

export type Etapa = {
  numero: string;
  titulo: string;
  texto: string;
};

export const processo: Etapa[] = [
  {
    numero: "01",
    titulo: "Você entra em contato",
    texto:
      "Chame pelo WhatsApp ou telefone e conte o que precisa. Fotos do local ajudam bastante.",
  },
  {
    numero: "02",
    titulo: "Entendemos a necessidade",
    texto:
      "A equipe avalia o escopo do serviço, as condições da instalação e o que o projeto exige.",
  },
  {
    numero: "03",
    titulo: "Avaliação e orçamento",
    texto:
      "Definimos a solução adequada e apresentamos o orçamento do serviço.",
  },
  {
    numero: "04",
    titulo: "Execução do serviço",
    texto:
      "O trabalho é executado por equipe qualificada, com foco em segurança e acabamento.",
  },
];

export type Foto = { src: string; alt: string; legenda: string };

export const galeria: Foto[] = [
  {
    src: "/img/obra-3.jpg",
    alt: "Equipe da Engetec instalando poste de energia elétrica em obra",
    legenda: "Instalação de poste e padrão de entrada",
  },
  {
    src: "/img/obra-2.jpg",
    alt: "Instalação de módulos fotovoltaicos em telhado",
    legenda: "Sistema fotovoltaico em telhado",
  },
  {
    src: "/img/obra-4.jpg",
    alt: "Técnico conectando cabos de potência em painel elétrico",
    legenda: "Painel elétrico de baixa tensão",
  },
  {
    src: "/img/obra-1.jpg",
    alt: "Eletricista trabalhando em rede elétrica aérea no alto de um poste",
    legenda: "Serviço em rede elétrica aérea",
  },
];

export const navegacao = [
  { href: "/", rotulo: "Início" },
  { href: "/servicos", rotulo: "Serviços" },
  { href: "/sobre", rotulo: "Sobre" },
  { href: "/contato", rotulo: "Contato" },
];
