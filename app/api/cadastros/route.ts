import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { database } from "@/db/repository";

const ADMIN_EMAIL = "casadosbartenders@gmail.com";

async function ensureTable() {
  const db = database();
  await db.prepare(`CREATE TABLE IF NOT EXISTS club_contacts (
    id TEXT PRIMARY KEY NOT NULL,
    full_name TEXT NOT NULL,
    rg TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    age INTEGER NOT NULL,
    instagram TEXT,
    whatsapp TEXT NOT NULL,
    privacy_consent INTEGER NOT NULL,
    privacy_consent_at TEXT NOT NULL,
    image_use_consent INTEGER NOT NULL DEFAULT 0,
    image_use_consent_at TEXT,
    marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    marketing_opt_in_at TEXT,
    created_at TEXT NOT NULL
  )`).run();
  const columns = await db.prepare("PRAGMA table_info(club_contacts)").all<{ name: string }>();
  const existingColumns = new Set((columns.results ?? []).map((column) => column.name));
  if (!existingColumns.has("image_use_consent")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN image_use_consent INTEGER NOT NULL DEFAULT 0").run();
  if (!existingColumns.has("image_use_consent_at")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN image_use_consent_at TEXT").run();
  if (!existingColumns.has("birth_date")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN birth_date TEXT NOT NULL DEFAULT ''").run();
  if (!existingColumns.has("locality")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN locality TEXT NOT NULL DEFAULT ''").run();
  if (!existingColumns.has("visit_count")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN visit_count INTEGER NOT NULL DEFAULT 0").run();
}

async function isAdmin() {
  const requestHeaders = await headers();
  return requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase() === ADMIN_EMAIL;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o formulário." }, { status: 400 });
  }

  const fullName = String(body.fullName ?? "").trim().slice(0, 120);
  const rg = String(body.rg ?? "").trim().slice(0, 30);
  const cpf = String(body.cpf ?? "").replace(/\D/g, "");
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const birthDate = String(body.birthDate ?? "").trim();
  const locality = String(body.locality ?? "").trim().slice(0, 120);
  const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").slice(0, 80);
  const submittedWhatsapp = String(body.whatsapp ?? "").replace(/\D/g, "").slice(0, 15);
  const whatsapp = submittedWhatsapp.length === 10 || submittedWhatsapp.length === 11 ? `55${submittedWhatsapp}` : submittedWhatsapp;
  const privacyConsent = body.privacyConsent === true;
  const imageUseConsent = body.imageUseConsent === true;
  const marketingOptIn = body.marketingOptIn === true;

  if (!fullName || !rg || !email || !whatsapp || !birthDate || !locality || !privacyConsent) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios e aceite o aviso de privacidade." }, { status: 400 });
  }
  const parsedBirthDate = /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? new Date(`${birthDate}T12:00:00Z`) : null;
  const validBirthDate = parsedBirthDate !== null && !Number.isNaN(parsedBirthDate.getTime()) && parsedBirthDate.toISOString().slice(0, 10) === birthDate && birthDate <= new Date().toISOString().slice(0, 10);
  let age = 0;
  if (validBirthDate) {
    const today = new Date();
    age = today.getUTCFullYear() - parsedBirthDate!.getUTCFullYear();
    if (today.getUTCMonth() < parsedBirthDate!.getUTCMonth() || (today.getUTCMonth() === parsedBirthDate!.getUTCMonth() && today.getUTCDate() < parsedBirthDate!.getUTCDate())) age--;
  }
  if (cpf.length !== 11 || !validBirthDate || !Number.isInteger(age) || age < 18 || age > 120 || whatsapp.length < 12 || whatsapp.length > 15 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Confira CPF, e-mail, idade e WhatsApp. O cadastro promocional é para maiores de 18 anos." }, { status: 400 });
  }

  const now = new Date().toISOString();
  try {
    await ensureTable();
    await database().prepare(`INSERT INTO club_contacts
      (id, full_name, rg, cpf, email, age, birth_date, locality, visit_count, instagram, whatsapp, privacy_consent, privacy_consent_at, image_use_consent, image_use_consent_at, marketing_opt_in, marketing_opt_in_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 1, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), fullName, rg, cpf, email, age, birthDate, locality, instagram || null, whatsapp, now, imageUseConsent ? 1 : 0, imageUseConsent ? now : null, marketingOptIn ? 1 : 0, marketingOptIn ? now : null, now).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "Este CPF já está cadastrado. Fale com o Tamandaré Club se precisar atualizar seus dados." }, { status: 409 });
    }
    return NextResponse.json({ error: "Não foi possível salvar o cadastro agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  await ensureTable();
  const params = new URL(request.url).searchParams;
  const requestedOffset = Number(params.get("offset") ?? 0);
  const offset = Number.isSafeInteger(requestedOffset) && requestedOffset >= 0 && requestedOffset <= 100000 ? requestedOffset : 0;
  const query = (params.get("q") ?? "").trim().slice(0, 120).toLocaleLowerCase("pt-BR");
  const digits = query.replace(/\D/g, "");
  const where = query
    ? "WHERE LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(locality) LIKE ? OR LOWER(COALESCE(instagram, '')) LIKE ? OR LOWER(rg) LIKE ? OR cpf LIKE ? OR whatsapp LIKE ?"
    : "";
  const queryBindings = query
    ? [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${digits || query}%`, `%${digits || query}%`]
    : [];
  const pageSize = 500;
  const [count, result] = await Promise.all([
    database().prepare(`SELECT COUNT(*) AS total FROM club_contacts ${where}`).bind(...queryBindings).first<{ total: number }>(),
    database().prepare(`SELECT id, full_name AS fullName, rg, cpf, email, age, birth_date AS birthDate, locality, visit_count AS visitCount, instagram, whatsapp,
      image_use_consent AS imageUseConsent, marketing_opt_in AS marketingOptIn, created_at AS createdAt FROM club_contacts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...queryBindings, pageSize, offset).all(),
  ]);
  const contacts = result.results ?? [];
  const nextOffset = contacts.length === pageSize && offset + contacts.length < Number(count?.total ?? 0) ? offset + contacts.length : null;
  return NextResponse.json({ contacts, total: Number(count?.total ?? 0), nextOffset }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id || body.id.length > 80) return NextResponse.json({ error: "Cadastro inválido." }, { status: 400 });
  await ensureTable();
  await database().prepare("DELETE FROM club_contacts WHERE id = ?").bind(body.id).run();
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string; marketingOptIn?: boolean; visitCount?: number } | null;
  if (!body?.id || body.id.length > 80 || (body.marketingOptIn !== false && (!Number.isInteger(body.visitCount) || (body.visitCount ?? -1) < 0 || (body.visitCount ?? 1_000_001) > 1_000_000))) {
    return NextResponse.json({ error: "Atualização do cadastro inválida." }, { status: 400 });
  }
  await ensureTable();
  if (body.marketingOptIn === false) await database().prepare("UPDATE club_contacts SET marketing_opt_in = 0, marketing_opt_in_at = NULL WHERE id = ?").bind(body.id).run();
  else await database().prepare("UPDATE club_contacts SET visit_count = ? WHERE id = ?").bind(body.visitCount, body.id).run();
  return NextResponse.json({ ok: true });
}
