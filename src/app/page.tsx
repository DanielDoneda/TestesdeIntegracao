import Link from "next/link";

export default function Home() {
  return (
    <main className="home-shell">
      <div className="hero-copy">
        <span className="eyebrow">FATEC · Desenvolvimento Web III</span>
        <h1>BugBusters</h1>
        <p className="hero-lead">
          Um quiz ao vivo sobre testes de integração, Spring Boot e bugs que
          juravam estar funcionando.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/jogar">
            Entrar na prova
          </Link>
          <Link className="button button-secondary" href="/placar">
            Abrir o placar
          </Link>
          <Link className="button button-ghost" href="/controle">
            Controle do professor
          </Link>
        </div>
      </div>
      <div className="hero-art" aria-label="Personagens do placar do quiz">
        <div className="sprite sprite-wizard" />
        <div className="score-orbit">
          <strong>1000</strong>
          <span>pontos caindo...</span>
        </div>
      </div>
    </main>
  );
}
