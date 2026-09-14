"use client";

import { ThemeProvider } from "next-themes";

/* O next-themes escreve a classe no <html> antes da primeira pintura, o que
   evita o flash de tema errado ao recarregar. `disableTransitionOnChange`
   impede que a troca de tema anime cada cor da tela ao mesmo tempo. */
export function TemaProvedor({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
