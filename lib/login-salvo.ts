/* =============================================================================
   Login salvo neste aparelho

   Ao sair, a pessoa escolhe se quer que o Raiz lembre do e-mail para
   preencher o login da próxima vez. Guarda SÓ o e-mail: a senha nunca passa
   por aqui — quem a guarda com segurança é o gerenciador de senhas do
   navegador, que oferece o preenchimento sozinho no campo de senha.

   localStorage pode lançar (janela privada, dados bloqueados), então toda
   leitura e escrita é protegida: falhar em lembrar o e-mail não pode impedir
   ninguém de sair ou de entrar.
   ========================================================================== */

const CHAVE = "raiz:email-salvo";

export function lerEmailSalvo(): string {
  try {
    return window.localStorage.getItem(CHAVE) ?? "";
  } catch {
    return "";
  }
}

export function salvarEmail(email: string): void {
  try {
    window.localStorage.setItem(CHAVE, email);
  } catch {
    /* sem armazenamento: o login só não vem preenchido */
  }
}

export function esquecerEmail(): void {
  try {
    window.localStorage.removeItem(CHAVE);
  } catch {
    /* nada a limpar */
  }
}
