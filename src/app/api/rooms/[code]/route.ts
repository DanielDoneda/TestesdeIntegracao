import { publicQuestion, QUIZ_QUESTIONS } from "@/lib/quiz";
import { apiError, normalizeCode } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code: rawCode } = await context.params;
    const code = normalizeCode(rawCode);
    const db = supabaseAdmin();
    const { data: room, error } = await db
      .from("rooms")
      .select("id,code,title,status,current_question,question_started_at")
      .eq("code", code)
      .single();
    if (error || !room) return apiError("Sala não encontrada.", 404);

    const [{ count: participantCount }, { count: responseCount }] = await Promise.all([
      db.from("participants").select("id", { count: "exact", head: true }).eq("room_id", room.id),
      room.current_question >= 0
        ? db.from("answers").select("id", { count: "exact", head: true }).eq("room_id", room.id).eq("question_index", room.current_question)
        : Promise.resolve({ count: 0 }),
    ]);

    const question = room.current_question >= 0 ? publicQuestion(room.current_question) : null;
    const questionElapsedMs = room.status === "question" && room.question_started_at
      ? Math.max(0, Date.now() - new Date(room.question_started_at).getTime())
      : null;
    return Response.json({
      room: {
        code: room.code,
        title: room.title,
        status: room.status,
        currentQuestion: room.current_question,
        questionStartedAt: room.question_started_at,
        questionElapsedMs,
        totalQuestions: QUIZ_QUESTIONS.length,
        participantCount: participantCount ?? 0,
        responseCount: responseCount ?? 0,
        question,
      },
    });
  } catch (error) {
    console.error(error);
    return apiError("Não foi possível consultar a sala.", 500);
  }
}
