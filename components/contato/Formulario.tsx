"use client";

import { useId, useState } from "react";

import { linkWhatsapp, servicos } from "@/lib/empresa";
import { Botao } from "@/components/ui/Botao";
import { Whatsapp } from "@/components/ui/Icones";

type Campos = { nome: string; telefone: string; servico: string; mensagem: string };
type Erros = Partial<Record<keyof Campos, string>>;

const inicial: Campos = { nome: "", telefone: "", servico: "", mensagem: "" };

function validar(campos: Campos): Erros {
  const erros: Erros = {};
  if (campos.nome.trim().length < 2) {
    erros.nome = "Informe seu nome.";
  }
  if (campos.mensagem.trim().length < 10) {
    erros.mensagem = "Descreva o serviço com pelo menos 10 caracteres.";
  }
  if (campos.telefone.trim() && campos.telefone.replace(/\D/g, "").length < 10) {
    erros.telefone = "Telefone incompleto. Use DDD e número.";
  }
  return erros;
}

/**
 * O formulário monta a mensagem e abre a conversa no WhatsApp. Não existe
 * servidor de e-mail neste projeto, então esse é o caminho honesto: o usuário
 * vê exatamente o que será enviado e para onde.
 */
export function Formulario() {
  const id = useId();
  const [campos, setCampos] = useState<Campos>(inicial);
  const [erros, setErros] = useState<Erros>({});
  const [tocados, setTocados] = useState<Partial<Record<keyof Campos, boolean>>>({});
  const [enviando, setEnviando] = useState(false);

  const atualizar = (chave: keyof Campos, valor: string) => {
    const proximos = { ...campos, [chave]: valor };
    setCampos(proximos);
    if (tocados[chave]) setErros(validar(proximos));
  };

  const aoSair = (chave: keyof Campos) => {
    setTocados((atual) => ({ ...atual, [chave]: true }));
    setErros(validar(campos));
  };

  const aoEnviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const encontrados = validar(campos);
    setErros(encontrados);
    setTocados({ nome: true, telefone: true, servico: true, mensagem: true });
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    const linhas = [
      `Olá! Sou ${campos.nome.trim()} e gostaria de solicitar um orçamento com a Engetec.`,
      campos.servico ? `Serviço: ${campos.servico}` : null,
      campos.telefone.trim() ? `Telefone: ${campos.telefone.trim()}` : null,
      "",
      campos.mensagem.trim(),
    ].filter(Boolean);

    window.open(linkWhatsapp(linhas.join("\n")), "_blank", "noopener,noreferrer");
    window.setTimeout(() => setEnviando(false), 900);
  };

  return (
    <form onSubmit={aoEnviar} noValidate className="flex flex-col gap-5">
      <Campo
        id={`${id}-nome`}
        rotulo="Nome"
        obrigatorio
        valor={campos.nome}
        erro={tocados.nome ? erros.nome : undefined}
        aoMudar={(valor) => atualizar("nome", valor)}
        aoSair={() => aoSair("nome")}
        autoComplete="name"
        placeholder="Como podemos te chamar"
      />

      <Campo
        id={`${id}-telefone`}
        rotulo="Telefone"
        tipo="tel"
        valor={campos.telefone}
        erro={tocados.telefone ? erros.telefone : undefined}
        aoMudar={(valor) => atualizar("telefone", valor)}
        aoSair={() => aoSair("telefone")}
        autoComplete="tel"
        placeholder="(22) 90000-0000"
        auxilio="Opcional. Ajuda caso precisemos retornar por ligação."
      />

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${id}-servico`}
          className="text-sm font-semibold tracking-[-0.01em]"
        >
          Serviço
        </label>
        <select
          id={`${id}-servico`}
          value={campos.servico}
          onChange={(evento) => atualizar("servico", evento.target.value)}
          className="h-12 w-full rounded-[var(--raio-sm)] border border-[var(--linha-clara)] bg-white px-3.5 text-[0.9375rem] text-[var(--texto-forte)] transition-colors duration-200 hover:border-[var(--texto-suave)] focus:border-[var(--engetec-vermelho)]"
        >
          <option value="">Selecione (opcional)</option>
          {servicos.map((servico) => (
            <option key={servico.id} value={servico.nome}>
              {servico.nome}
            </option>
          ))}
          <option value="Outro serviço elétrico">Outro serviço elétrico</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${id}-mensagem`}
          className="text-sm font-semibold tracking-[-0.01em]"
        >
          O que você precisa
          <span className="ml-1 text-[var(--engetec-vermelho)]" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id={`${id}-mensagem`}
          required
          rows={5}
          value={campos.mensagem}
          onChange={(evento) => atualizar("mensagem", evento.target.value)}
          onBlur={() => aoSair("mensagem")}
          aria-invalid={tocados.mensagem && erros.mensagem ? true : undefined}
          aria-describedby={
            tocados.mensagem && erros.mensagem ? `${id}-mensagem-erro` : undefined
          }
          placeholder="Descreva o serviço, o local e o prazo desejado."
          className="w-full resize-y rounded-[var(--raio-sm)] border bg-white p-3.5 text-[0.9375rem] leading-relaxed text-[var(--texto-forte)] transition-colors duration-200 placeholder:text-[var(--texto-suave)] hover:border-[var(--texto-suave)] focus:border-[var(--engetec-vermelho)]"
          style={{
            borderColor:
              tocados.mensagem && erros.mensagem
                ? "var(--engetec-vermelho)"
                : "var(--linha-clara)",
          }}
        />
        {tocados.mensagem && erros.mensagem && (
          <p
            id={`${id}-mensagem-erro`}
            className="text-sm text-[var(--engetec-vermelho)]"
          >
            {erros.mensagem}
          </p>
        )}
      </div>

      <Botao type="submit" tamanho="lg" disabled={enviando} className="mt-1 w-full">
        <Whatsapp className="h-5 w-5" />
        {enviando ? "Abrindo o WhatsApp" : "Enviar pelo WhatsApp"}
      </Botao>

      <p className="text-sm leading-relaxed text-[var(--texto-suave)]">
        Ao enviar, a conversa abre no WhatsApp com a mensagem já preenchida. Você
        confere tudo antes de mandar.
      </p>
    </form>
  );
}

type CampoProps = {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  aoSair: () => void;
  erro?: string;
  auxilio?: string;
  obrigatorio?: boolean;
  tipo?: string;
  placeholder?: string;
  autoComplete?: string;
};

function Campo({
  id,
  rotulo,
  valor,
  aoMudar,
  aoSair,
  erro,
  auxilio,
  obrigatorio,
  tipo = "text",
  placeholder,
  autoComplete,
}: CampoProps) {
  const idAuxilio = auxilio ? `${id}-auxilio` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  const descrito = [idErro, idAuxilio].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold tracking-[-0.01em]">
        {rotulo}
        {obrigatorio && (
          <span className="ml-1 text-[var(--engetec-vermelho)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        required={obrigatorio}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(evento) => aoMudar(evento.target.value)}
        onBlur={aoSair}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descrito}
        className="h-12 w-full rounded-[var(--raio-sm)] border bg-white px-3.5 text-[0.9375rem] text-[var(--texto-forte)] transition-colors duration-200 placeholder:text-[var(--texto-suave)] hover:border-[var(--texto-suave)] focus:border-[var(--engetec-vermelho)]"
        style={{
          borderColor: erro ? "var(--engetec-vermelho)" : "var(--linha-clara)",
        }}
      />
      {erro && (
        <p id={idErro} className="text-sm text-[var(--engetec-vermelho)]">
          {erro}
        </p>
      )}
      {auxilio && !erro && (
        <p id={idAuxilio} className="text-sm text-[var(--texto-suave)]">
          {auxilio}
        </p>
      )}
    </div>
  );
}
