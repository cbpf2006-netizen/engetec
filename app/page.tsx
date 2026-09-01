import { Hero } from "@/components/home/Hero";
import { Introducao } from "@/components/home/Introducao";
import { Servicos } from "@/components/home/Servicos";
import { Numeros } from "@/components/home/Numeros";
import { Sobre } from "@/components/home/Sobre";
import { Diferenciais } from "@/components/home/Diferenciais";
import { Galeria } from "@/components/home/Galeria";
import { Processo } from "@/components/home/Processo";
import { CtaOrcamento } from "@/components/home/CtaOrcamento";
import { Contato } from "@/components/home/Contato";

export default function PaginaInicial() {
  return (
    <>
      <Hero />
      <Introducao />
      <Servicos />
      <Numeros />
      <Sobre />
      <Diferenciais />
      <Galeria />
      <Processo />
      <CtaOrcamento />
      <Contato />
    </>
  );
}
