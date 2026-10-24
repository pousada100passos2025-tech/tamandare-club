import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { database } from "@/db/repository";

const ADMIN_EMAIL = "casadosbartenders@gmail.com";
const RESERVATION_TYPES = ["Mesa", "Área da piscina", "Aniversário / evento privado", "Réveillon 2027"];
const STATUSES = ["pending", "confirmed", "cancelled"];

async function ensureTable() {
  await database().prepare(`CREATE TABLE IF NOT EXISTS club_reservations (
    id TEXT PRIMARY KEY NOT NULL,
    full_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    reservation_date TEXT NOT NULL,
    guest_count INTEGER NOT NULL,
    reservation_type TEXT NOT NULL,
    notes TEXT,
    privacy_consent_at TEXT NOT NULL,
    marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    marketing_opt_in_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  )`).run();
}

async function isAdmin() {
  const requestHeaders = await headers();
  return requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase() === ADMIN_EMAIL;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Não foi possível ler o formulário." }, { status: 400 });

  const fullName = String(body.fullName ?? "").trim().slice(0, 120);
  const whatsappDigits = String(body.whatsapp ?? "").replace(/\D/g, "").slice(0, 15);
  const whatsapp = whatsappDigits.length === 10 || whatsappDigits.length === 11 ? `55${whatsappDigits}` : whatsappDigits;
  const reservationDate = String(body.reservationDate ?? "").trim();
  const guestCount = Number(body.guestCount);
  const reservationType = String(body.reservationType ?? "").trim();
  const notes = String(body.notes ?? "").trim().slice(0, 500);
  const privacyConsent = body.privacyConsent === true;
  const marketingOptIn = body.marketingOptIn === true;
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(reservationDate) ? new Date(`${reservationDate}T12:00:00Z`) : null;
  const validDate = parsedDate !== null && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === reservationDate;

  if (!fullName || !whatsapp || !reservationDate || !reservationType || !privacyConsent || !Number.isInteger(guestCount)) {
    return NextResponse.json({ error: "Preencha os dados da reserva e aceite o aviso de privacidade." }, { status: 400 });
  }
  if (whatsapp.length < 12 || whatsapp.length > 15 || !validDate || guestCount < 1 || guestCount > 1000 || !RESERVATION_TYPES.includes(reservationType)) {
    return NextResponse.json({ error: "Confira o WhatsApp, a data, o tipo de reserva e a quantidade de pessoas." }, { status: 400 });
  }

  if (reservationType === "Réveillon 2027" && (!['2026-12-30', '2026-12-31', '2027-01-01'].includes(reservationDate) || guestCount > 5)) {
    return NextResponse.json({ error: "Escolha um dos três dias do Réveillon e informe de 1 a 5 pessoas." }, { status: 400 });
  }

  const now = new Date().toISOString();
  await ensureTable();
  await database().prepare(`INSERT INTO club_reservations
    (id, full_name, whatsapp, reservation_date, guest_count, reservation_type, notes, privacy_consent_at, marketing_opt_in, marketing_opt_in_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`)
    .bind(crypto.randomUUID(), fullName, whatsapp, reservationDate, guestCount, reservationType, notes || null, now, marketingOptIn ? 1 : 0, marketingOptIn ? now : null, now).run();

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  await ensureTable();
  const requestedOffset = Number(new URL(request.url).searchParams.get("offset") ?? 0);
  const offset = Number.isSafeInteger(requestedOffset) && requestedOffset >= 0 && requestedOffset <= 100000 ? requestedOffset : 0;
  const pageSize = 500;
  const [count, result] = await Promise.all([
    database().prepare("SELECT COUNT(*) AS total FROM club_reservations").first<{ total: number }>(),
    database().prepare(`SELECT id, full_name AS fullName, whatsapp, reservation_date AS reservationDate,
      guest_count AS guestCount, reservation_type AS reservationType, notes, marketing_opt_in AS marketingOptIn,
      status, created_at AS createdAt FROM club_reservations ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(pageSize, offset).all(),
  ]);
  const reservations = result.results ?? [];
  const total = Number(count?.total ?? 0);
  return NextResponse.json({ reservations, total, nextOffset: reservations.length === pageSize && offset + pageSize < total ? offset + pageSize : null }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; status?: string } | null;
  if (!body?.id || body.id.length > 80 || !STATUSES.includes(body.status ?? "")) {
    return NextResponse.json({ error: "Atualização de reserva inválida." }, { status: 400 });
  }
  await ensureTable();
  await database().prepare("UPDATE club_reservations SET status = ? WHERE id = ?").bind(body.status, body.id).run();
  return NextResponse.json({ ok: true });
}
