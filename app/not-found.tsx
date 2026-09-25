import Link from "next/link";

import LogoRaiz from "@/components/marca/LogoRaiz";
import { Button } from "@/components/ui/button";

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <LogoRaiz />

      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Esta página não existe</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          O endereço pode ter mudado ou o link está incompleto.
        </p>
      </div>

      <Button size="lg" render={<Link href="/" />}>
        Ir para o início
      </Button>
    </div>
  );
}
