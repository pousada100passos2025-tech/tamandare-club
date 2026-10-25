import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";

const PROJECT = "wudqixnobxjziosqnzuy";
const ADMIN = "casadosbartenders@gmail.com";
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user || user.email.trim().toLowerCase() !== ADMIN) {
    return NextResponse.json({ error: "Acesso administrativo obrigatório." }, { status: 403 });
  }
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: "Sincronização não configurada no servidor." }, { status: 503 });
  const body = await request.json().catch(() => null) as { drafts?: unknown } | null;
  if (!Array.isArray(body?.drafts) || body.drafts.length < 1 || body.drafts.length > 20) {
    return NextResponse.json({ error: "Informe de 1 a 20 rascunhos." }, { status: 400 });
  }
  const drafts = body.drafts as Record<string, unknown>[];
  if (!drafts.every(d => d && typeof d === "object" && typeof d.id === "string" && ID.test(d.id) &&
      d.status === "local_only" && typeof d.table === "string" && d.table.length <= 40 &&
      typeof d.waiterName === "string" && d.waiterName.length <= 120 &&
      typeof d.totalCents === "number" && Number.isSafeInteger(d.totalCents) && d.totalCents > 0 &&
      JSON.stringify(d).length < 12000)) {
    return NextResponse.json({ error: "Dados locais inválidos." }, { status: 400 });
  }
  // Inbox de rascunhos somente, sem criação de venda, baixa de estoque ou reconhecimento de pagamento.
  const records = drafts.map(d => ({ id: d.id, payload: d, uploaded_by: user.email }));
  try {
    const response = await fetch(`https://${PROJECT}.supabase.co/rest/v1/club_offline_drafts?on_conflict=id`, {
      method: "POST",
      headers: { apikey: key, ...(key.startsWith("sb_secret_") ? {} : { Authorization: `Bearer ${key}` }),
        Prefer: "resolution=ignore-duplicates,return=minimal", "Content-Type": "application/json" },
      body: JSON.stringify(records),
      cache: "no-store"
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Supabase não confirmou o envio." }, { status: 502 });
    }
    return NextResponse.json({ acceptedIds: drafts.map(d => d.id), state: "draft_only" },
      { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Sem conexão com Supabase." }, { status: 503 });
  }
}
