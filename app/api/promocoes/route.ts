import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { env } from "cloudflare:workers";
import { database } from "@/db/repository";

const ADMIN_EMAIL = "casadosbartenders@gmail.com";
const MAX_RECIPIENTS = 50;

type ContactRow = { id: string; whatsapp: string; full_name: string };

async function ensureTable() {
  await database().prepare(`CREATE TABLE IF NOT EXISTS club_contacts (
    id TEXT PRIMARY KEY NOT NULL, full_name TEXT NOT NULL, rg TEXT NOT NULL, cpf TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL, age INTEGER NOT NULL, instagram TEXT, whatsapp TEXT NOT NULL,
    privacy_consent INTEGER NOT NULL, privacy_consent_at TEXT NOT NULL, marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    marketing_opt_in_at TEXT, created_at TEXT NOT NULL
  )`).run();
}

export async function POST(request: Request) {
  const requestHeaders = await headers();
  if (requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { contactIds?: unknown; message?: unknown } | null;
  const rawIds = Array.isArray(body?.contactIds) ? body.contactIds.filter((id): id is string => typeof id === "string" && id.length <= 100) : [];
  const selections = [...new Map(rawIds.map((raw) => {
    const separator = raw.indexOf(":");
    const prefix = separator === -1 ? "contact" : raw.slice(0, separator);
    const id = separator === -1 ? raw : raw.slice(separator + 1);
    const source = prefix === "reservation" ? "reservation" : prefix === "contact" ? "contact" : "invalid";
    return [`${source}:${id}`, { source, id }];
  })).values()].filter((selection) => selection.source !== "invalid" && selection.id.length > 0);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 900) : "";
  if (!message || !selections.length || selections.length > MAX_RECIPIENTS || selections.length !== rawIds.length) {
    return NextResponse.json({ error: "Selecione de 1 a 50 pessoas e escreva a promoção." }, { status: 400 });
  }

  const runtimeEnv = env as unknown as Record<string, string | undefined>;
  const accessToken = runtimeEnv.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = runtimeEnv.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = runtimeEnv.WHATSAPP_MARKETING_TEMPLATE;
  const apiVersion = runtimeEnv.WHATSAPP_API_VERSION;
  if (!accessToken || !phoneNumberId || !templateName || !apiVersion) {
    return NextResponse.json({
      error: "A seleção está pronta, mas o envio automático ainda não foi conectado. Configure as credenciais do WhatsApp Business e um modelo de mensagem de marketing aprovado pela Meta.",
      needsWhatsAppSetup: true,
    }, { status: 503 });
  }
  if (!/^v\d+\.\d+$/.test(apiVersion) || !/^[a-z0-9_]+$/i.test(templateName)) {
    return NextResponse.json({ error: "A configuração do WhatsApp Business está inválida." }, { status: 503 });
  }

  await ensureTable();
  await database().prepare(`CREATE TABLE IF NOT EXISTS club_reservations (
    id TEXT PRIMARY KEY NOT NULL, full_name TEXT NOT NULL, whatsapp TEXT NOT NULL,
    reservation_date TEXT NOT NULL, guest_count INTEGER NOT NULL, reservation_type TEXT NOT NULL,
    notes TEXT, privacy_consent_at TEXT NOT NULL, marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    marketing_opt_in_at TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
  )`).run();
  const contactIds = selections.filter((selection) => selection.source === "contact").map((selection) => selection.id);
  const reservationIds = selections.filter((selection) => selection.source === "reservation").map((selection) => selection.id);
  const contactRows = contactIds.length
    ? (await database().prepare(`SELECT id, whatsapp, full_name FROM club_contacts WHERE marketing_opt_in = 1 AND id IN (${contactIds.map(() => "?").join(",")})`).bind(...contactIds).all<ContactRow>()).results ?? []
    : [];
  const reservationRows = reservationIds.length
    ? (await database().prepare(`SELECT id, whatsapp, full_name FROM club_reservations WHERE marketing_opt_in = 1 AND id IN (${reservationIds.map(() => "?").join(",")})`).bind(...reservationIds).all<ContactRow>()).results ?? []
    : [];
  const contacts = [...contactRows.map((row) => ({ ...row, source: "contact" })), ...reservationRows.map((row) => ({ ...row, source: "reservation" }))];
  if (contacts.length !== selections.length) {
    return NextResponse.json({ error: "Um ou mais contatos não autorizaram promoções ou não existem. Atualize a lista antes de enviar." }, { status: 409 });
  }

  const outcomes: Array<{ id: string; ok: boolean }> = [];
  for (const contact of contacts) {
    const phone = contact.whatsapp.replace(/\D/g, "");
    try {
      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "pt_BR" },
            components: [{ type: "body", parameters: [{ type: "text", text: message }] }],
          },
        }),
      });
      outcomes.push({ id: `${contact.source}:${contact.id}`, ok: response.ok });
    } catch {
      outcomes.push({ id: `${contact.source}:${contact.id}`, ok: false });
    }
  }
  const sent = outcomes.filter((outcome) => outcome.ok).length;
  return NextResponse.json({ sent, failed: outcomes.length - sent, total: outcomes.length });
}
