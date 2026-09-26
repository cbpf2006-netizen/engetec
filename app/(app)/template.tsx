/* Remonta a cada navegação dentro do app, o que reinicia a entrada em cascata
   dos blocos da página (ver .cascata em app/globals.css). */
export default function TemplateDoApp({ children }: { children: React.ReactNode }) {
  return <div className="cascata">{children}</div>;
}
