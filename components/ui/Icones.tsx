import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

/** Base comum: traço de 1.5, cantos retos, grade de 24. */
function Svg({ children, ...props }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function Raio({ className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M13.4 2 4 13.9h5.8L10.6 22 20 10.1h-5.8z" />
    </svg>
  );
}

export function Escudo(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 2.8 19.2 5.4v5.2c0 4.6-3 8.4-7.2 10.6-4.2-2.2-7.2-6-7.2-10.6V5.4z" />
      <path d="m9 11.7 2.2 2.2 4-4.3" />
    </Svg>
  );
}

export function Capacete(props: Props) {
  return (
    <Svg {...props}>
      <path d="M3.6 17.2h16.8" />
      <path d="M6.4 17.2v-3a5.6 5.6 0 0 1 11.2 0v3" />
      <path d="M10.1 9.1V5.6h3.8v3.5" />
    </Svg>
  );
}

export function Selo(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="9.2" r="6" />
      <path d="m8.6 14.3-1 7 4.4-2.3 4.4 2.3-1-7" />
      <path d="m9.9 9.2 1.6 1.6 2.9-3" />
    </Svg>
  );
}

export function Conversa(props: Props) {
  return (
    <Svg {...props}>
      <path d="M20.5 4.8H3.5v10.7h4.6v4l4.8-4h7.6z" />
      <path d="M7.8 10.1h8.4" />
      <path d="M7.8 7.3h4.6" />
    </Svg>
  );
}

export function Prancheta(props: Props) {
  return (
    <Svg {...props}>
      <path d="M9 4.2H5.2v16.6h13.6V4.2H15" />
      <path d="M9 2.6h6v3.2H9z" />
      <path d="m8.9 13 2.2 2.2 4-4.4" />
    </Svg>
  );
}

export function Circuito(props: Props) {
  return (
    <Svg {...props}>
      <path d="M8.4 8.4h7.2v7.2H8.4z" />
      <path d="M12 2.8v5.6M12 15.6v5.6M2.8 12h5.6M15.6 12h5.6" />
      <path d="M8.4 2.8v2M15.6 2.8v2M8.4 19.2v2M15.6 19.2v2" opacity="0.55" />
    </Svg>
  );
}

export function CasaRaio(props: Props) {
  return (
    <Svg {...props}>
      <path d="M3.4 10.3 12 3.2l8.6 7.1v10.5H3.4z" />
      <path d="M12.9 9.6 9.9 14h3l-.8 3.9 3-4.4h-3z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function Quadro(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4 3.4h16v17.2H4z" />
      <path d="M7.4 7.6h3.4v4H7.4zM13.2 7.6h3.4v4h-3.4z" />
      <path d="M7.4 15.4h9.2" />
    </Svg>
  );
}

export function Sol(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.3 5.3 7 7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
    </Svg>
  );
}

export function Poste(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 4.4v16.2" />
      <path d="M5.6 7.4h12.8" />
      <path d="M8.2 7.4V5.6M15.8 7.4V5.6" />
      <path d="M5.6 7.4c2.6 1.9 4.8 3.1 6.4 3.1s3.8-1.2 6.4-3.1" opacity="0.6" />
      <path d="M9.2 20.6h5.6" />
    </Svg>
  );
}

export function Seta(props: Props) {
  return (
    <Svg {...props}>
      <path d="M4.5 12h15" />
      <path d="m13.4 6 6 6-6 6" />
    </Svg>
  );
}

export function SetaCanto(props: Props) {
  return (
    <Svg {...props}>
      <path d="M7.4 16.6 16.6 7.4" />
      <path d="M8.9 7.4h7.7v7.7" />
    </Svg>
  );
}

export function Whatsapp({ className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-3.4 4.02c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.68 2.57 4.07 3.6.57.25 1.01.39 1.36.5.57.19 1.09.16 1.5.1.46-.07 1.41-.58 1.61-1.14s.2-1.04.14-1.14c-.06-.1-.22-.16-.46-.28-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.73-1.77-.19-.46-.39-.4-.53-.41z" />
    </svg>
  );
}

export function Instagram(props: Props) {
  return (
    <Svg {...props}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.1" cy="6.9" r="1.05" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function Telefone(props: Props) {
  return (
    <Svg {...props}>
      <path d="M8.1 3.5H4.9c-.9 0-1.6.8-1.5 1.7.4 3.8 2 7.3 4.6 10 2.6 2.6 6.1 4.2 9.9 4.6.9.1 1.7-.6 1.7-1.5v-3.2c0-.8-.5-1.4-1.3-1.5l-2.5-.4c-.6-.1-1.2.2-1.5.7l-.7 1.4a12.6 12.6 0 0 1-5-5l1.4-.7c.5-.3.8-.9.7-1.5l-.4-2.5c-.1-.8-.8-1.3-1.5-1.3z" />
    </Svg>
  );
}

export function Envelope(props: Props) {
  return (
    <Svg {...props}>
      <path d="M3.2 5.6h17.6v12.8H3.2z" />
      <path d="m3.2 6.6 8.8 6.2 8.8-6.2" />
    </Svg>
  );
}

export function Pino(props: Props) {
  return (
    <Svg {...props}>
      <path d="M12 21.4s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </Svg>
  );
}

export function Menu(props: Props) {
  return (
    <Svg {...props}>
      <path d="M3.8 7.5h16.4M3.8 12h16.4M3.8 16.5h16.4" />
    </Svg>
  );
}

export function Fechar(props: Props) {
  return (
    <Svg {...props}>
      <path d="m5.6 5.6 12.8 12.8M18.4 5.6 5.6 18.4" />
    </Svg>
  );
}

export function Check(props: Props) {
  return (
    <Svg {...props}>
      <path d="m4.8 12.4 4.6 4.6L19.2 7.2" />
    </Svg>
  );
}

const mapaDiferenciais = {
  experiencia: Selo,
  equipe: Capacete,
  seguranca: Escudo,
  atendimento: Conversa,
  qualidade: Prancheta,
  inovacao: Circuito,
} as const;

export function IconeDiferencial({
  nome,
  ...props
}: Props & { nome: keyof typeof mapaDiferenciais }) {
  const Componente = mapaDiferenciais[nome];
  return <Componente {...props} />;
}

const mapaServicos = {
  "instalacoes-prediais": CasaRaio,
  "quadros-e-paineis": Quadro,
  "energia-solar": Sol,
  "redes-e-postes": Poste,
} as const;

export function IconeServico({
  nome,
  ...props
}: Props & { nome: string }) {
  const Componente =
    mapaServicos[nome as keyof typeof mapaServicos] ?? CasaRaio;
  return <Componente {...props} />;
}
