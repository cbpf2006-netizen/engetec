import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Raiz vive dentro da pasta engetec, que também é um projeto Next.js
     (com seu próprio lockfile). Sem isto, o Turbopack detecta os dois
     lockfiles e infere a raiz errada, chegando a resolver arquivos do
     projeto engetec (ex.: middleware.ts) dentro do build da Raiz. */
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
