import { NextRequest, NextResponse } from "next/server";

const GATEWAY_URL = "https://sbgwrdfhuvvvsacbdpho.supabase.co/functions/v1/tamandare-exclusive";
const SESSION_COOKIE = "tc_exclusive_session";
const SESSION_LIFETIME = 60 * 60 * 24 * 30;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_RE = /^[0-9a-f-]{72}$/i;

type MembershipSession = { id: string; token: string };
type Action = "join" | "status" | "checkout" | "cancel";

function sessionFromCookie(req: NextRequest): MembershipSession | null {
  const encoded = req.cookies.get(SESSION_COOKIE)?.value || "";
  const separator = encoded.indexOf(".");
  if (separator < 0) return null;
  const id = encoded.slice(0, separator), token = encoded.slice(separator + 1);
  return ID_RE.test(id) && TOKEN_RE.test(token) ? { id, token } : null;
}

function error(status: number, message: string) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

async function gateway(body: Record<string, unknown>) {
  const bearer = process.env.TAMANDARE_EXCLUSIVE_GATEWAY_TOKEN;
  if (!bearer || bearer.length < 32) return { status: 503, data: { error: "Adesões temporariamente indisponíveis. Configuração de pagamento pendente." } };
  try {
    const upstream = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
    const response = await upstream.json().catch(() => null);
    return { status: upstream.status, data: response && typeof response === "object" ? response : { error: "Resposta de pagamento inválida." } };
  } catch {
    return { status: 503, data: { error: "Não foi possível consultar o pagamento. Confira seu status antes de tentar novamente." } };
  }
}

export async function GET(req: NextRequest) {
  const session = sessionFromCookie(req);
  if (!session) return error(401, "Nenhuma adesão encontrada neste dispositivo.");
  const result = await gateway({ action: "status", ...session });
  return NextResponse.json(result.data, { status: result.status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return error(403, "Origem não autorizada.");
  const raw = await req.text();
  if (raw.length > 8000) return error(413, "Solicitação muito grande.");
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(raw); } catch { return error(400, "Formulário inválido."); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return error(400, "Formulário inválido.");
  const action = payload.action as Action;

  if (action === "join") {
    const name = String(payload.name || "").trim().slice(0, 120);
    const email = String(payload.email || "").trim().toLowerCase().slice(0, 160);
    let phone = String(payload.phone || "").replace(/\D/g, "");
    if (phone.length === 10 || phone.length === 11) phone = "55" + phone;
    if (name.length < 3 || !/^\S+@[^\s@]+\.[^\s@]+$/.test(email) || !/^55\d{10,11}$/.test(phone) || payload.termsConsent !== true)
      return error(400, "Confira nome, e-mail, WhatsApp e aceite as condições da assinatura.");

    const existing = sessionFromCookie(req);
    if (existing) return error(409, "Já existe uma adesão neste dispositivo. Consulte sua assinatura antes de criar outra.");
    const session = { id: crypto.randomUUID(), token: crypto.randomUUID() + crypto.randomUUID() };
    const created = await gateway({ action: "create", ...session, name, email, phone, termsVersion: "2026-10-29", termsConsent: true });
    if (created.status < 200 || created.status >= 300) return NextResponse.json(created.data, { status: created.status });
    const response = NextResponse.json({ id: session.id, created: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
    response.cookies.set(SESSION_COOKIE, session.id + "." + session.token, {
      httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: SESSION_LIFETIME,
    });
    return response;
  }

  if (!["status", "checkout", "cancel"].includes(action)) return error(400, "Operação inválida.");
  const session = sessionFromCookie(req);
  if (!session) return error(401, "Sua adesão não foi encontrada neste dispositivo. Procure a equipe para recuperar o acesso.");
  const method = String(payload.paymentMethod || "");
  if (action === "checkout" && !["card", "pix"].includes(method)) return error(400, "Escolha Pix ou cartão.");
  const result = await gateway({ action, ...session, ...(action === "checkout" ? { paymentMethod: method } : {}) });
  return NextResponse.json(result.data, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
