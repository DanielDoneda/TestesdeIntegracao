import { supabaseAdmin } from "@/lib/supabase-admin";
import { apiError, cleanText, hashToken, newAccessToken, normalizeCode } from "@/lib/server-utils";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code: rawCode } = await context.params;
    const code = normalizeCode(rawCode);
    const body = await request.json();
    const name = cleanText(body.name, 60);
    const registration = cleanText(body.registration, 30);
    if (name.length < 2 || registration.length < 2) return apiError("Informe seu nome e sua matrícula.");

    const db = supabaseAdmin();
    const { data: room } = await db.from("rooms").select("id,status").eq("code", code).single();
    if (!room) return apiError("Sala não encontrada.", 404);
    if (room.status === "finished") return apiError("Essa sala já foi encerrada.", 409);

    const token = newAccessToken();
    const { data: participant, error } = await db
      .from("participants")
      .insert({ room_id: room.id, name, registration, access_token_hash: hashToken(token) })
      .select("id,name,score,answered_count")
      .single();
    if (error?.code === "23505") return apiError("Essa matrícula já entrou na sala.", 409);
    if (error) throw error;

    return Response.json({ participant, token }, { status: 201 });
  } catch (error) {
    console.error(error);
    return apiError("Não foi possível entrar na sala.", 500);
  }
}
