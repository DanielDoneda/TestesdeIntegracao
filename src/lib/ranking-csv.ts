import { rankForScore } from "@/lib/score";

export type RankingEntry = {
  id: string;
  name: string;
  score: number;
  answered_count: number;
};

export function downloadRankingCsv(code: string, leaderboard: RankingEntry[]) {
  if (!leaderboard.length) return false;

  const safeCell = (value: string | number) => {
    let text = String(value).replace(/"/g, '""');
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return `"${text}"`;
  };
  const rows = [
    ["Posição", "Nome", "Pontos", "Respostas", "Classificação"],
    ...leaderboard.map((leader, index) => [
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
  return true;
}
