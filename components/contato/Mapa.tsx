import { empresa } from "@/lib/empresa";

const consulta = encodeURIComponent(empresa.endereco.completo);

export function Mapa({ className }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--raio)] border border-[var(--linha-clara)] bg-[var(--papel-2)] ${className ?? ""}`}
    >
      <iframe
        title={`Localização da ${empresa.nome} em ${empresa.cidade}, ${empresa.estado}`}
        src={`https://maps.google.com/maps?q=${consulta}&hl=pt-BR&z=14&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-[20rem] w-full border-0"
      />
    </div>
  );
}
