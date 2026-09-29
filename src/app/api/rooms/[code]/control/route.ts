import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { apiError, isAdmin, normalizeCode } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code: rawCode } = await context.params;
    const code = normalizeCode(rawCode);
    const body = await request.json();
    if (!isAdmin(body.password)) return apiError("Senha do professor incorreta.", 401);

    const db = supabaseAdmin();
    const { data: room } = await db.from("rooms").select("id,current_question,status").eq("code", code).single();
    if (!room) return apiError("Sala não encontrada.", 404);

    const action = String(body.action ?? "");
    if (action === "next") {
      const nextIndex = room.current_question + 1;
      if (nextIndex >= QUIZ_QUESTIONS.length) {
        await db.from("rooms").update({ status: "finished", question_started_at: null }).eq("id", room.id);
      } else {
        await db.from("rooms").update({ status: "question", current_question: nextIndex, question_started_at: new Date().toISOString() }).eq("id", room.id);
      }
    } else if (action === "reveal") {
      await db.from("rooms").update({ status: "reveal" }).eq("id", room.id);
    } else if (action === "finish") {
      await db.from("rooms").update({ status: "finished", question_started_at: null }).eq("id", room.id);
    } else if (action === "reset") {
      await db.from("answers").delete().eq("room_id", room.id);
      await db.from("participants").update({ score: 0, answered_count: 0 }).eq("room_id", room.id);
      await db.from("rooms").update({ status: "lobby", current_question: -1, question_started_at: null }).eq("id", room.id);
    } else {
      return apiError("Ação de controle inválida.");
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return apiError("Não foi possível controlar a sala.", 500);
  }
}
