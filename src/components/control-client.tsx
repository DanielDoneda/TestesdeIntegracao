"use client";

import { FormEvent, useEffect, useState } from "react";

type RoomState = {
  code: string;
  title: string;
  status: string;
  currentQuestion: number;
  totalQuestions: number;
  participantCount: number;
  responseCount: number;
  question: { prompt: string } | null;
};

async function readJson(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Algo deu errado.");
  return data;
}

export function ControlClient() {
  const [code, setCode] = useState("FATEC26");
  const [title, setTitle] = useState("Testes de Integração — Spring Boot");
  const [password, setPassword] = useState("");
  const [connectedCode, setConnectedCode] = useState("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("bugbusters-control");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => {
          setCode(parsed.code || "FATEC26");
          setConnectedCode(parsed.code || "");
          setPassword(parsed.password || "");
        });
      } catch { sessionStorage.removeItem("bugbusters-control"); }
    }
  }, []);

  useEffect(() => {
    if (!connectedCode) return;
    let active = true;
    const load = async () => {
      try {
        const data = await readJson(await fetch("/api/rooms/" + connectedCode, { cache: "no-store" }));
        if (active) { setRoom(data.room); setMessage(""); }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Sala indisponível.");
      }
    };
    load();
    const interval = window.setInterval(load, 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [connectedCode]);

  function connect(event: FormEvent) {
    event.preventDefault();
    const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setConnectedCode(normalized);
    sessionStorage.setItem("bugbusters-control", JSON.stringify({ code: normalized, password }));
  }

  async function createRoom() {
    setBusy(true); setMessage("");
    try {
      await readJson(await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, title, password }) }));
      const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setConnectedCode(normalized);
      sessionStorage.setItem("bugbusters-control", JSON.stringify({ code: normalized, password }));
      setMessage("Sala criada. Agora pode chamar a turma.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar."); }
    finally { setBusy(false); }
  }

  async function control(action: "next" | "reveal" | "finish" | "reset") {
    if (!connectedCode) return;
    setBusy(true); setMessage("");
    try {
      await readJson(await fetch("/api/rooms/" + connectedCode + "/control", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, password }) }));
      setMessage(action === "next" ? "Questão liberada. Valendo!" : action === "reveal" ? "Rodada encerrada." : action === "finish" ? "Quiz finalizado." : "Sala reiniciada.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Comando não executado."); }
    finally { setBusy(false); }
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  if (!connectedCode || !room) {
    return (
      <section className="panel">
        <form className="form-grid" onSubmit={connect}>
          <div className="form-row">
            <div className="field"><label htmlFor="control-code">Código da sala</label><input id="control-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} required /></div>
            <div className="field"><label htmlFor="control-password">Senha do professor</label><input id="control-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
          </div>
          <div className="field"><label htmlFor="control-title">Título da dinâmica</label><input id="control-title" value={title} onChange={(event) => setTitle(event.target.value)} /></div>
          <div className="control-actions"><button className="button button-primary" disabled={busy}>Conectar sala existente</button><button className="button button-secondary" type="button" disabled={busy} onClick={createRoom}>Criar nova sala</button></div>
        </form>
        <p className={"status-line " + (message ? "error" : "")} role="alert">{message}</p>
      </section>
    );
  }

  return (
    <div className="control-grid">
      <section className="panel">
        <span className="eyebrow">Sala <strong className="room-code">{room.code}</strong></span>
        <h2>{room.title}</h2>
        <p>{room.question?.prompt || (room.status === "finished" ? "A dinâmica terminou. O placar final está pronto." : "A turma pode entrar. Libere a primeira questão quando estiver pronto.")}</p>
        <div className="mini-stats">
          <div className="mini-stat"><span>Questão</span><strong>{room.currentQuestion < 0 ? "—" : (room.currentQuestion + 1) + "/" + room.totalQuestions}</strong></div>
          <div className="mini-stat"><span>Participantes</span><strong>{room.participantCount}</strong></div>
          <div className="mini-stat"><span>Respostas</span><strong>{room.responseCount}</strong></div>
        </div>
        <div className="control-actions">
          <button className="button button-primary" disabled={busy || room.status === "question" || room.status === "finished"} onClick={() => control("next")}>{room.currentQuestion < 0 ? "Liberar primeira questão" : "Próxima questão"}</button>
          <button className="button button-secondary" disabled={busy || room.status !== "question"} onClick={() => control("reveal")}>Encerrar rodada</button>
          <button className="button button-danger" disabled={busy || room.status === "finished"} onClick={() => control("finish")}>Finalizar quiz</button>
          <button className="button button-ghost" disabled={busy} onClick={() => control("reset")}>Reiniciar pontuação</button>
        </div>
        <p className={"status-line " + (message ? "success" : "")} aria-live="polite">{message}</p>
      </section>
      <aside className="panel">
        <h3>Links da dinâmica</h3>
        <div className="form-grid">
          <div className="field"><label>Participantes</label><input readOnly value={origin + "/jogar?sala=" + room.code} /></div>
          <div className="field"><label>Telão</label><input readOnly value={origin + "/placar?sala=" + room.code} /></div>
          <a className="button button-secondary" href={"/placar?sala=" + room.code} target="_blank">Abrir placar em outra tela</a>
        </div>
      </aside>
    </div>
  );
}
