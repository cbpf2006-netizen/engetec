import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";

/* =============================================================================
   Erros de leitura

   Guardar o código do Postgres junto da mensagem permite distinguir uma falha
   passageira (rede, timeout) de "o schema ainda não foi aplicado neste
   projeto" — que é a situação de quem acabou de clonar o repositório e merece
   uma tela explicando o que fazer, não um erro genérico.
   ========================================================================== */

export class ErroDeConsulta extends Error {
  readonly codigo?: string;

  constructor(mensagem: string, codigo?: string) {
    super(mensagem);
    this.name = "ErroDeConsulta";
    this.codigo = codigo;
  }
}

export function erroDeConsulta(acao: string, erro: PostgrestError): ErroDeConsulta {
  return new ErroDeConsulta(`${acao}: ${erro.message}`, erro.code);
}

/** 42P01 é "relation does not exist" no Postgres; PGRST205 é o PostgREST não
    encontrando a tabela no cache do schema. Os dois significam a mesma coisa
    aqui: a migration não rodou. */
const CODIGOS_DE_SCHEMA_AUSENTE = new Set(["42P01", "PGRST205", "PGRST202", "PGRST106"]);

export function schemaAusente(erro: unknown): boolean {
  if (erro instanceof ErroDeConsulta && erro.codigo) {
    return CODIGOS_DE_SCHEMA_AUSENTE.has(erro.codigo);
  }
  return false;
}
