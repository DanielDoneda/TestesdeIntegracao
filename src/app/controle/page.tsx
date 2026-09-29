import { ControlClient } from "@/components/control-client";
import { SiteHeader } from "@/components/site-header";

export default function ControlPage() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <header className="intro"><span className="eyebrow">Painel reservado</span><h1>Controle da dinâmica</h1><p>Crie a sala, libere uma questão por vez e mantenha o placar aberto em outra tela.</p></header>
      <ControlClient />
    </main>
  );
}
