import { apiError, normalizeCode } from "@/lib/server-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code: rawCode } = await context.params;
    const code = normalizeCode(rawCode);
    const db = supabaseAdmin();
    const { data: room } = await db.from("rooms").select("id,status,current_question,title").eq("code", code).single();
    if (!room) return apiError("Sala não encontrada.", 404);

    const { data, error } = await db
      .from("participants")
      .select("id,name,score,answered_count")
      .eq("room_id", room.id)
      .order("score", { ascending: false })
      .order("joined_at", { ascending: true })
      .limit(50);
    if (error) throw error;

    return Response.json({ room: { code, title: room.title, status: room.status, currentQuestion: room.current_question }, leaderboard: data ?? [] });
  } catch (error) {
    console.error(error);
    return apiError("Não foi possível carregar o placar.", 500);
  }
}
