"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { HIEROGLYPHS } from "@/lib/quiz";
import { rankForScore, scoreForElapsed } from "@/lib/score";

type PublicQuestion = { index: number; prompt: string; options: string[] };
type RoomState = {
  code: string;
  title: string;
  status: "lobby" | "question" | "reveal" | "finished";
  currentQuestion: number;
  questionStartedAt: string | null;
  questionElapsedMs: number | null;
  totalQuestions: number;
  participantCount: number;
  responseCount: number;
  question: PublicQuestion | null;
};
type Player = { id: string; name: string; score: number; answered_count: number; token: string; code: string };
type AnswerResult = { questionIndex: number; correct: boolean; points: number; elapsedMs: number; message: string; correctOption: number; explanation: string };

async function readJson(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Algo deu errado.");
  return data;
}

export function GameClient() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [visibleScore, setVisibleScore] = useState(1000);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const timerAnchor = useRef<{ questionIndex: number; elapsedMs: number; receivedAt: number } | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("bugbusters-player");
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get("sala");
    queueMicrotask(() => {
      if (saved) {
        try { setPlayer(JSON.parse(saved)); } catch { sessionStorage.removeItem("bugbusters-player"); }
      }
      if (roomCode) setCode(roomCode.toUpperCase());
    });
  }, []);

  useEffect(() => {
    if (!player) return;
    let active = true;
    const load = async () => {
      try {
        const data = await readJson(await fetch("/api/rooms/" + player.code, { cache: "no-store" }));
        if (active) {
          if (data.room.status === "question" && typeof data.room.questionElapsedMs === "number") {
            timerAnchor.current = {
              questionIndex: data.room.currentQuestion,
              elapsedMs: data.room.questionElapsedMs,
              receivedAt: performance.now(),
            };
          }
          setRoom(data.room);
        }
      } catch (error) {
        if (active) setStatus(error instanceof Error ? error.message : "Sala indisponível.");
      }
    };
    load();
    const interval = window.setInterval(load, 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [player]);

  const currentQuestion = room?.currentQuestion;
  const roomStatus = room?.status;

  useEffect(() => {
    if (roomStatus !== "question") return;
    const update = () => {
      const anchor = timerAnchor.current;
      if (!anchor || anchor.questionIndex !== currentQuestion) return;
      setVisibleScore(scoreForElapsed(anchor.elapsedMs + performance.now() - anchor.receivedAt));
    };
    update();
    const interval = window.setInterval(update, 80);
    return () => window.clearInterval(interval);
  }, [currentQuestion, roomStatus]);

  const rank = useMemo(
    () => rankForScore(player?.score ?? 0, player?.answered_count ?? 0),
    [player?.score, player?.answered_count],
  );
  const currentResult = result && result.questionIndex === room?.currentQuestion ? result : null;

  async function join(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const roomCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const data = await readJson(await fetch("/api/rooms/" + roomCode + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, registration }),
      }));
      const nextPlayer = { ...data.participant, token: data.token, code: roomCode };
      sessionStorage.setItem("bugbusters-player", JSON.stringify(nextPlayer));
      setPlayer(nextPlayer);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally { setBusy(false); }
  }

  async function answer(selectedOption: number) {
    if (!player || !room?.question || currentResult || busy) return;
    setBusy(true);
    setStatus("");
    try {
      const data: Omit<AnswerResult, "questionIndex"> = await readJson(await fetch("/api/rooms/" + player.code + "/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: player.id, token: player.token, questionIndex: room.question.index, selectedOption }),
      }));
      setResult({ ...data, questionIndex: room.question.index });
      const updated = { ...player, score: player.score + data.points, answered_count: player.answered_count + 1 };
      setPlayer(updated);
      sessionStorage.setItem("bugbusters-player", JSON.stringify(updated));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível responder.");
    } finally { setBusy(false); }
  }

  function leave() {
    sessionStorage.removeItem("bugbusters-player");
    setPlayer(null);
    setRoom(null);
    setResult(null);
  }

  if (!player) {
    return (
      <section className="panel">
        <form className="form-grid" onSubmit={join}>
          <div className="field">
            <label htmlFor="room-code">Código da sala</label>
            <input id="room-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={10} placeholder="FATEC26" required />
          </div>
          <div className="form-row">
            <div className="field"><label htmlFor="player-name">Seu nome</label><input id="player-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Daniel" required /></div>
            <div className="field"><label htmlFor="registration">Matrícula</label><input id="registration" value={registration} onChange={(event) => setRegistration(event.target.value)} placeholder="000000" required /></div>
          </div>
          <button className="button button-primary" disabled={busy}>{busy ? "Entrando..." : "Entrar no quiz"}</button>
        </form>
        <p className={"status-line " + (status ? "error" : "")} role="alert">{status}</p>
      </section>
    );
  }

  if (!room) return <section className="panel"><div className="empty-state">Procurando a sala <span className="room-code">{player.code}</span>...</div></section>;

  return (
    <section className="panel">
      <div className="question-meta">
        <span>{player.name} · sala <strong className="room-code">{room.code}</strong></span>
        <button className="button button-ghost" onClick={leave}>Sair</button>
      </div>

      {room.status === "lobby" && <div className="empty-state"><h3>Você entrou!</h3><p>Agora aguarde o professor liberar a primeira questão.</p></div>}

      {(room.status === "question" || room.status === "reveal") && room.question && (
        <>
          <div className="score-label">Esta resposta vale agora</div>
          <div className="score-live">{room.status === "question" && !currentResult ? visibleScore : currentResult?.points ?? 0}</div>
          <div className="question-meta"><span>Questão {room.question.index + 1} de {room.totalQuestions}</span><span>{room.responseCount}/{room.participantCount} responderam</span></div>
          <h2 className="question-title">{room.question.prompt}</h2>
          <div className="answers">
            {room.question.options.map((option, index) => (
              <button className="answer" key={option} disabled={busy || Boolean(currentResult) || room.status !== "question"} onClick={() => answer(index)}>
                <span className="hieroglyph" aria-hidden="true">{HIEROGLYPHS[index]}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
          {currentResult && (
            <div className={"result-box " + (currentResult.correct ? "correct" : "wrong")} aria-live="polite">
              <strong>{currentResult.correct ? "Mandou bem! +" + currentResult.points + " pontos" : "Foi com confiança. A confiança estava errada, mas estava linda. · 0 pontos"}</strong>
              <span>{currentResult.message}</span>
              <span>{currentResult.explanation}</span>
            </div>
          )}
          {!currentResult && room.status === "reveal" && <div className="result-box wrong"><strong>A rodada encerrou antes da sua resposta.</strong><span>O Maven anotou. Sem ressentimentos... talvez.</span></div>}
        </>
      )}

      {room.status === "finished" && (
        <div className="control-grid">
          <div><span className="eyebrow">Resultado final</span><h2>{player.score} pontos</h2><h3>{rank.title}</h3><p>Você respondeu {player.answered_count} questões. O código sobreviveu — e você também.</p></div>
          <div className={"sprite " + rank.sprite} style={{ minHeight: 290 }} />
        </div>
      )}
      <p className={"status-line " + (status ? "error" : "")} role="alert">{status}</p>
    </section>
  );
}
