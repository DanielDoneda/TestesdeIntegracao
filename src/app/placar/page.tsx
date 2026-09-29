import { ScoreboardClient } from "@/components/scoreboard-client";
import { SiteHeader } from "@/components/site-header";

export default function ScoreboardPage() {
  return (
    <main className="projector">
      <div className="page-shell">
        <SiteHeader />
        <header className="intro"><span className="eyebrow">Classificação online</span><h1>Corrida contra o bug</h1><p>Quem respondeu rápido aparece. Quem respondeu certo permanece.</p></header>
        <ScoreboardClient />
      </div>
    </main>
  );
}
