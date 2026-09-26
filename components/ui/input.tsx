import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/* Campo padrão do app. Altura de 44px (alvo de toque confortável), superfície
   de cartão para destacar do fundo, borda que escurece no hover e um halo suave
   no foco — o mesmo tratamento vale para Textarea e Select. */
export const CAMPO_BASE =
  "w-full min-w-0 rounded-xl border border-input bg-card px-3.5 text-[0.9375rem] leading-normal text-foreground shadow-cartao transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground/70 hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 dark:bg-input/25 dark:hover:border-foreground/30"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        CAMPO_BASE,
        "h-11 py-2 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
