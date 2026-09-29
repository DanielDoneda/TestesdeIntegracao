import { supabaseAdmin } from "@/lib/supabase-admin";
import { apiError, cleanText, isAdmin, normalizeCode } from "@/lib/server-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!isAdmin(body.password)) return apiError("Senha do professor incorreta.", 401);

    const code = normalizeCode(body.code);
    const title = cleanText(body.title || "Testes de Integração", 100);
    if (code.length < 4) return apiError("Use um código de sala com pelo menos 4 caracteres.");

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("rooms")
      .insert({ code, title })
      .select("code,title,status,current_question,question_started_at")
      .single();

    if (error?.code === "23505") return apiError("Essa sala já existe. Você pode apenas conectá-la no controle.", 409);
    if (error) throw error;
    return Response.json({ room: data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return apiError("Não foi possível criar a sala. Confira a configuração do Supabase.", 500);
  }
}
