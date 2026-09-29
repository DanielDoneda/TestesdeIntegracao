import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { messageForElapsed, scoreForElapsed } from "@/lib/score";
import { apiError, hashToken, normalizeCode } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code: rawCode } = await context.params;
    const code = normalizeCode(rawCode);
    const body = await request.json();
    const participantId = String(body.participantId ?? "");
    const token = String(body.token ?? "");
    const questionIndex = Number(body.questionIndex);
    const selectedOption = Number(body.selectedOption);
    if (!participantId || !token || !Number.isInteger(selectedOption)) return apiError("Resposta inválida.");

    const db = supabaseAdmin();
    const { data: room } = await db
      .from("rooms")
      .select("id,status,current_question,question_started_at")
      .eq("code", code)
      .single();
    if (!room) return apiError("Sala não encontrada.", 404);
    if (room.status !== "question" || room.current_question !== questionIndex || !room.question_started_at) {
      return apiError("Essa questão não está recebendo respostas agora.", 409);
    }

    const { data: participant } = await db
      .from("participants")
      .select("id,access_token_hash")
      .eq("id", participantId)
      .eq("room_id", room.id)
      .single();
    if (!participant || participant.access_token_hash !== hashToken(token)) return apiError("Participante não autorizado.", 401);

    const question = QUIZ_QUESTIONS[questionIndex];
    if (!question || selectedOption < 0 || selectedOption >= question.options.length) return apiError("Alternativa inválida.");

    const elapsedMs = Math.max(0, Date.now() - new Date(room.question_started_at).getTime());
    const correct = selectedOption === question.correctOption;
    const points = correct ? scoreForElapsed(elapsedMs) : 0;
    const { error } = await db.rpc("record_answer", {
      p_room_id: room.id,
      p_participant_id: participant.id,
      p_question_index: questionIndex,
      p_selected_option: selectedOption,
      p_correct: correct,
      p_points: points,
      p_response_ms: elapsedMs,
    });
    if (error?.code === "23505") return apiError("Você já respondeu essa questão.", 409);
    if (error) throw error;

    return Response.json({
      correct,
      points,
      elapsedMs,
      message: messageForElapsed(elapsedMs),
      correctOption: question.correctOption,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error(error);
    return apiError("Não foi possível registrar a resposta.", 500);
  }
}
