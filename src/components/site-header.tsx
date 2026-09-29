import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        Bug<span>Busters</span>
      </Link>
      <nav aria-label="Navegação principal">
        <Link className="nav-link" href="/jogar">Jogar</Link>
        <Link className="nav-link" href="/placar">Placar</Link>
        <Link className="nav-link" href="/controle">Controle</Link>
      </nav>
    </header>
  );
}
