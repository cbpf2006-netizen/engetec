"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampoSenha } from "@/components/auth/campos";
import { Avatar } from "./Avatar";
import { Bloco } from "./Bloco";
import { DialogoTrocaDeEmail } from "./DialogoTrocaDeEmail";
import { BotaoExcluirConta } from "./ExcluirConta";
import { mascaraTelefone, soDigitos } from "@/lib/formato";
import { atualizarPerfil } from "@/lib/acoes/perfil";
import { alterarSenha, atualizarTelefone, enviarFoto, removerFoto } from "@/lib/acoes/conta";
import type { Perfil } from "@/lib/tipos";

/* =============================================================================
   Perfil — foto, dados pessoais, e-mail e senha

   Cada bloco salva sozinho: quem só quer trocar o telefone não deveria ter de
   passar pela senha, e um erro numa parte não trava as outras.
   ========================================================================== */

export function PerfilCompleto({ perfil }: { perfil: Perfil }) {
  return (
    <>
      <BlocoDaFoto perfil={perfil} />
      <BlocoDosDados perfil={perfil} />
      <BlocoDoEmail email={perfil.email} />
      <BlocoDaSenha />
      <BlocoDaExclusao ehAdmin={perfil.papel === "admin"} />
    </>
  );
}

/* =============================================================================
   Foto
   ========================================================================== */

const LADO_DA_FOTO = 384;

/** Recorta o centro em quadrado e reduz para 384px em JPEG. Uma foto de celular
    tem alguns MB; o avatar aparece em 36px e 96px, então enviar o original
    seria só desperdício de banda e de armazenamento. */
async function prepararFoto(arquivo: File): Promise<File> {
  const imagem = await createImageBitmap(arquivo);
  const lado = Math.min(imagem.width, imagem.height);

  const tela = document.createElement("canvas");
  tela.width = LADO_DA_FOTO;
  tela.height = LADO_DA_FOTO;

  const contexto = tela.getContext("2d");
  if (!contexto) throw new Error("sem canvas");

  contexto.drawImage(
    imagem,
    (imagem.width - lado) / 2,
    (imagem.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    LADO_DA_FOTO,
    LADO_DA_FOTO
  );
  imagem.close();

  const blob = await new Promise<Blob | null>((resolver) =>
    tela.toBlob(resolver, "image/jpeg", 0.88)
  );
  if (!blob) throw new Error("sem blob");

  return new File([blob], "foto.jpg", { type: "image/jpeg" });
}

function BlocoDaFoto({ perfil }: { perfil: Perfil }) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [ocupado, iniciar] = useTransition();

  function escolher(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    iniciar(async () => {
      let preparada: File;
      try {
        preparada = await prepararFoto(arquivo);
      } catch {
        toast.error("Não foi possível ler essa imagem. Tente uma foto JPG ou PNG.");
        return;
      }

      const formulario = new FormData();
      formulario.set("foto", preparada);

      const resultado = await enviarFoto(formulario);
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Foto atualizada.");
      router.refresh();
    });
  }

  function remover() {
    iniciar(async () => {
      const resultado = await removerFoto();
      if (!resultado.ok) {
        toast.error(resultado.erro);
        return;
      }
      toast.success("Foto removida.");
      router.refresh();
    });
  }

  return (
    <Bloco titulo="Foto de perfil">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar perfil={perfil} tamanho="lg" />

        <div className="flex flex-wrap gap-2">
          <input
            ref={entrada}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={escolher}
          />
          <Button
            type="button"
            variant="outline"
            disabled={ocupado}
            onClick={() => entrada.current?.click()}
          >
            <Camera />
            {ocupado ? "Enviando…" : perfil.foto_url ? "Alterar foto" : "Adicionar foto"}
          </Button>

          {perfil.foto_url && (
            <Button type="button" variant="ghost" disabled={ocupado} onClick={remover}>
              <Trash2 />
              Remover foto
            </Button>
          )}
        </div>
      </div>
    </Bloco>
  );
}

/* =============================================================================
   Nome e telefone — nenhum dos dois pede confirmação
   ========================================================================== */

function BlocoDosDados({ perfil }: { perfil: Perfil }) {
  const router = useRouter();
  const [nome, setNome] = useState(perfil.nome ?? "");
  const [telefone, setTelefone] = useState(mascaraTelefone(perfil.telefone ?? ""));
  const [erros, setErros] = useState<{ nome?: string; telefone?: string }>({});
  const [enviando, iniciar] = useTransition();

  const nomeMudou = nome.trim() !== (perfil.nome ?? "").trim();
  const telefoneMudou = soDigitos(telefone) !== (perfil.telefone ?? "");

  function salvar() {
    setErros({});

    iniciar(async () => {
      const novos: { nome?: string; telefone?: string } = {};
      let alterou = false;

      if (nomeMudou) {
        const resultado = await atualizarPerfil({ nome });
        if (!resultado.ok) novos.nome = resultado.erro;
        else alterou = true;
      }

      if (telefoneMudou) {
        const resultado = await atualizarTelefone(telefone);
        if (!resultado.ok) novos.telefone = resultado.erro;
        else alterou = true;
      }

      setErros(novos);
      if (novos.nome || novos.telefone) {
        toast.error(novos.nome ?? novos.telefone ?? "Não foi possível salvar.");
      }
      if (alterou) {
        toast.success("Dados atualizados.");
        router.refresh();
      }
    });
  }

  return (
    <Bloco titulo="Dados pessoais" descricao="Como você aparece dentro do Raiz.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          salvar();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="perfil-nome">Nome</Label>
          <Input
            id="perfil-nome"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            autoComplete="name"
            maxLength={60}
            aria-invalid={erros.nome ? true : undefined}
          />
          {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="perfil-telefone">
            Telefone <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="perfil-telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={telefone}
            onChange={(evento) => setTelefone(mascaraTelefone(evento.target.value))}
            placeholder="(11) 91234-5678"
            aria-invalid={erros.telefone ? true : undefined}
          />
          {erros.telefone && <p className="text-xs text-destructive">{erros.telefone}</p>}
        </div>

        <div>
          <Button type="submit" size="lg" disabled={enviando || !(nomeMudou || telefoneMudou)}>
            {enviando ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Bloco>
  );
}

/* =============================================================================
   E-mail
   ========================================================================== */

function BlocoDoEmail({ email }: { email: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Bloco
      titulo="E-mail"
      descricao="O endereço que você usa para entrar."
      acao={
        <Button type="button" variant="outline" size="sm" onClick={() => setAberto(true)}>
          Alterar e-mail
        </Button>
      }
    >
      <p className="truncate text-sm font-medium">{email}</p>
      <DialogoTrocaDeEmail aberto={aberto} aoMudarAberto={setAberto} />
    </Bloco>
  );
}

/* =============================================================================
   Senha — pede a atual
   ========================================================================== */

function BlocoDaSenha() {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erros, setErros] = useState<{ atual?: string; nova?: string; confirmacao?: string }>({});
  const [enviando, iniciar] = useTransition();

  function salvar() {
    setErros({});

    iniciar(async () => {
      const resultado = await alterarSenha({ atual, nova, confirmacao });

      if (!resultado.ok) {
        const campo = resultado.campo as "atual" | "nova" | "confirmacao" | undefined;
        if (campo === "atual" || campo === "nova" || campo === "confirmacao") {
          setErros({ [campo]: resultado.erro });
        } else {
          toast.error(resultado.erro);
        }
        return;
      }

      setAtual("");
      setNova("");
      setConfirmacao("");
      toast.success("Senha alterada.");
    });
  }

  return (
    <Bloco titulo="Senha" descricao="Para trocar, informe primeiro a senha atual.">
      <form
        className="flex flex-col gap-4"
        onSubmit={(evento) => {
          evento.preventDefault();
          salvar();
        }}
      >
        <CampoSenha
          id="senha-atual"
          rotulo="Senha atual"
          autoComplete="current-password"
          value={atual}
          onChange={(evento) => setAtual(evento.target.value)}
          erro={erros.atual}
        />
        <CampoSenha
          id="senha-nova"
          rotulo="Nova senha"
          autoComplete="new-password"
          value={nova}
          onChange={(evento) => setNova(evento.target.value)}
          dica="Pelo menos 8 caracteres."
          erro={erros.nova}
        />
        <CampoSenha
          id="senha-confirmacao"
          rotulo="Repita a nova senha"
          autoComplete="new-password"
          value={confirmacao}
          onChange={(evento) => setConfirmacao(evento.target.value)}
          erro={erros.confirmacao}
        />

        <div>
          <Button
            type="submit"
            size="lg"
            disabled={enviando || !atual || !nova || !confirmacao}
          >
            {enviando ? "Alterando…" : "Alterar senha"}
          </Button>
        </div>
      </form>
    </Bloco>
  );
}

/* =============================================================================
   Excluir conta

   O administrador não vê o botão: sem ele o app ficaria sem quem libere
   acessos. A função no servidor também recusa, então esconder aqui é só
   clareza — a regra não depende da tela.
   ========================================================================== */

function BlocoDaExclusao({ ehAdmin }: { ehAdmin: boolean }) {
  return (
    <Bloco
      titulo="Excluir conta"
      descricao="Apaga sua conta e todos os seus dados. Não há como desfazer."
    >
      {ehAdmin ? (
        <p className="text-sm text-muted-foreground">
          A conta de administrador não pode ser excluída por aqui.
        </p>
      ) : (
        <div>
          <BotaoExcluirConta />
        </div>
      )}
    </Bloco>
  );
}
