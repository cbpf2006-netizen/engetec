import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { empresa } from "@/lib/empresa";

export const alt = `${empresa.nome} | Instalações elétricas em ${empresa.cidade} e região`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Imagem() {
  const logo = await readFile(join(process.cwd(), "public/img/logo.jpg"));
  const logoBase64 = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#101114",
          padding: "68px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoBase64} alt="" width={278} height={80} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#a8acb4",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 48, height: 3, backgroundColor: "#d81e24" }} />
            Instalações elétricas · {empresa.cidade} / {empresa.estado}
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: 74,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2.6,
              marginTop: 28,
              maxWidth: 940,
            }}
          >
            Instalação elétrica feita com norma, não com improviso.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: 28,
            color: "#ffc400",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex" }}>+{empresa.clientes} clientes atendidos</div>
          <div style={{ display: "flex", color: "#ffffff" }}>{empresa.telefone}</div>
        </div>
      </div>
    ),
    size,
  );
}
