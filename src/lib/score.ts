export const QUESTION_WINDOW_MS = 20_000;

export function scoreForElapsed(elapsedMs: number) {
  if (elapsedMs >= QUESTION_WINDOW_MS) return 1;
  const safeElapsed = Math.max(0, elapsedMs);
  return Math.max(1, Math.ceil(1000 - (999 * safeElapsed) / QUESTION_WINDOW_MS));
}

export function messageForElapsed(elapsedMs: number) {
  const seconds = elapsedMs / 1000;
  if (seconds <= 2) return "Tá se exibindo, né? Nem o Spring subiu tão rápido.";
  if (seconds <= 4) return "Calma, Flash! O MockMvc mal teve tempo de respirar.";
  if (seconds <= 6) return "Resposta turbo. O bug nem conseguiu se esconder.";
  if (seconds <= 8) return "O ObjectMapper nem terminou de traduzir e você já respondeu.";
  if (seconds <= 10) return "Spring Boot aprovou o ritmo. Sem stack trace e sem drama.";
  if (seconds <= 12) return "Pensou direitinho. Quase abriu o Stack Overflow, mas resistiu.";
  if (seconds <= 14) return "O cérebro compilou com alguns warnings, mas compilou.";
  if (seconds <= 16) return "Foi no modo debug: devagar, olhando variável por variável.";
  if (seconds <= 20) return "Passou raspando. O Maven já estava preparando o timeout.";
  return "Pontuação 1, persistência 1000. O importante é não dar Ctrl+C.";
}

export const RANKS = [
  { min: 8500, title: "Mestre Supremo do MockMvc", sprite: "sprite-wizard" },
  { min: 7000, title: "Ninja do Spring Boot", sprite: "sprite-ninja" },
  { min: 5500, title: "Caçador Oficial de Bugs", sprite: "sprite-detective" },
  { min: 4000, title: "Alquimista dos Testes", sprite: "sprite-alchemist" },
  { min: 2000, title: "Bug em Processo de Evolução", sprite: "sprite-bug" },
  { min: 0, title: "Maven Quer uma Revanche", sprite: "sprite-failure" },
];

export function rankForScore(score: number) {
  return RANKS.find((rank) => score >= rank.min) ?? RANKS[RANKS.length - 1];
}
