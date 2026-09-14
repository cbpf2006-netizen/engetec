import {
  Banknote,
  Bus,
  Car,
  Circle,
  Coins,
  CreditCard,
  Droplets,
  Dumbbell,
  FileText,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  PawPrint,
  PiggyBank,
  Plane,
  RefreshCcw,
  ChartLine,
  Shirt,
  ShoppingCart,
  Smartphone,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { corDoModelo, type ApelidoIcone } from "@/lib/catalogo";

/* =============================================================================
   Ícones dos modelos

   Único lugar do app que conhece os componentes do lucide-react. O banco
   guarda apelidos ("carro", "mercado"); trocar a biblioteca de ícones é
   reescrever este mapa, não migrar dados.
   ========================================================================== */

const MAPA: Record<ApelidoIcone, LucideIcon> = {
  salario: Banknote,
  carteira: Wallet,
  presente: Gift,
  notebook: Laptop,
  grafico: ChartLine,
  cofre: PiggyBank,
  banco: Landmark,
  cartao: CreditCard,
  moeda: Coins,
  mercado: ShoppingCart,
  restaurante: UtensilsCrossed,
  casa: House,
  carro: Car,
  onibus: Bus,
  combustivel: Fuel,
  saude: HeartPulse,
  educacao: GraduationCap,
  lazer: Gamepad2,
  viagem: Plane,
  assinatura: RefreshCcw,
  celular: Smartphone,
  luz: Zap,
  agua: Droplets,
  internet: Wifi,
  roupa: Shirt,
  pet: PawPrint,
  academia: Dumbbell,
  ferramenta: Wrench,
  documento: FileText,
  circulo: Circle,
};

export function Icone({
  apelido,
  className,
}: {
  apelido: string;
  className?: string;
}) {
  const Componente = MAPA[apelido as ApelidoIcone] ?? Circle;
  return <Componente className={className} aria-hidden="true" />;
}

/* =============================================================================
   Selo do modelo — ícone dentro de um quadrado na cor do modelo

   O fundo é a cor do modelo a 12% de opacidade e o traço é a cor cheia:
   identifica o modelo sem transformar a lista num arco-íris de blocos
   saturados.
   ========================================================================== */

export function SeloModelo({
  icone,
  cor,
  tamanho = "md",
  className,
}: {
  icone: string;
  cor: string;
  tamanho?: "sm" | "md" | "lg";
  className?: string;
}) {
  const corDoTraco = corDoModelo(cor);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[0.625rem]",
        tamanho === "sm" && "size-8",
        tamanho === "md" && "size-10",
        tamanho === "lg" && "size-12",
        className
      )}
      style={{
        color: corDoTraco,
        backgroundColor: `color-mix(in oklab, ${corDoTraco} 14%, transparent)`,
      }}
    >
      <Icone
        apelido={icone}
        className={cn(
          tamanho === "sm" && "size-4",
          tamanho === "md" && "size-[1.125rem]",
          tamanho === "lg" && "size-5"
        )}
      />
    </span>
  );
}
