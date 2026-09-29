import { GameClient } from "@/components/game-client";
import { SiteHeader } from "@/components/site-header";

export default function PlayPage() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <header className="intro"><span className="eyebrow">Modo participante</span><h1>Entre, pense e clique.</h1><p>A pontuação começa em 1000 e cai até 1. O tempo acaba; a chance de responder, não.</p></header>
      <GameClient />
    </main>
  );
}
