"use client";

import { FormEvent, useEffect, useState } from "react";
import { rankForScore } from "@/lib/score";

type Leader = { id: string; name: string; score: number; answered_count: number };
type BoardData = { room: { code: string; title: string; status: string; currentQuestion: number }; leaderboard: Leader[] };

export function ScoreboardClient() {
  const [inputCode, setInputCode] = useState("");
  const [code, setCode] = useState("");
  const [data, setData] = useState<BoardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get("sala")?.toUpperCase();
    if (roomCode) queueMicrotask(() => { setInputCode(roomCode); setCode(roomCode); });
  }, []);

  useEffect(() => {
    if (!code) return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/rooms/" + code + "/leaderboard", { cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Placar indisponível.");
        if (active) { setData(body); setError(""); }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Placar indisponível.");
      }
    };
    load();
    const interval = window.setInterval(load, 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [code]);

  function connect(event: FormEvent) {
    event.preventDefault();
    setCode(inputCode.toUpperCase().replace(/[^A-Z0-9]/g, ""));
  }

  function downloadRanking() {
    if (!data?.leaderboard.length) return;

    const safeCell = (value: string | number) => {
      let text = String(value).replace(/"/g, '""');
      if (/^[=+\-@]/.test(text)) text = "'" + text;
      return `"${text}"`;
    };
    const rows = [
      ["Posição", "Nome", "Pontos", "Respostas", "Classificação"],
      ...data.leaderboard.map((leader, index) => [
        index + 1,
        leader.name,
        leader.score,
        leader.answered_count,
        rankForScore(leader.score, leader.answered_count).title,
      ]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(safeCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ranking-${code}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (!code) {
    return (
      <section className="panel">
        <form className="form-grid" onSubmit={connect}>
          <div className="field"><label htmlFor="score-room">Código da sala</label><input id="score-room" value={inputCode} onChange={(event) => setInputCode(event.target.value.toUpperCase())} placeholder="FATEC26" required /></div>
          <button className="button button-primary">Mostrar classificação</button>
        </form>
      </section>
    );
  }

  return (
    <>
      <div className="question-meta">
        <span>Sala <strong className="room-code">{code}</strong></span>
        <div className="scoreboard-actions">
          <span>{data?.room.status === "finished" ? "Resultado final" : "Atualização ao vivo"}</span>
          {data?.room.status === "finished" && data.leaderboard.length > 0 && (
            <button className="button button-primary" type="button" onClick={downloadRanking}>Baixar ranking (.CSV)</button>
          )}
        </div>
      </div>
      <section className="leaderboard" aria-live="polite">
        {!data?.leaderboard.length && <div className="panel empty-state">O placar está fazendo aquecimento. Ainda não entrou ninguém.</div>}
        {data?.leaderboard.map((leader, index) => {
          const rank = rankForScore(leader.score, leader.answered_count);
          return (
            <article className="leader-row" key={leader.id}>
              <div className="position">{index + 1}º</div>
              <div className={"leader-avatar sprite " + rank.sprite} />
              <div><div className="leader-name">{leader.name}</div><div className="leader-title">{rank.title} · {leader.answered_count} respostas</div></div>
              <div className="leader-score">{leader.score} pts</div>
            </article>
          );
        })}
      </section>
      {error && <p className="status-line error" role="alert">{error}</p>}
    </>
  );
}
