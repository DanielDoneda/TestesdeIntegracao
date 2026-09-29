"use client";

import { FormEvent, useEffect, useState } from "react";
import { rankForScore } from "@/lib/score";
import { downloadRankingCsv, RankingEntry } from "@/lib/ranking-csv";

type BoardData = { room: { code: string; title: string; status: string; currentQuestion: number }; leaderboard: RankingEntry[] };

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
    downloadRankingCsv(code, data.leaderboard);
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
