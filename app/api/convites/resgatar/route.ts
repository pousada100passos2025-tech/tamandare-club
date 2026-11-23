import { NextResponse } from "next/server";
import { database } from "@/db/repository";

async function hash(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest)).map((v) => v.toString(16).padStart(2, "0")).join("");
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

async function ensureTables() {
  const db = database();
  await db.prepare(`CREATE TABLE IF NOT EXISTS club_invites (
    id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', expires_at TEXT NOT NULL,
    membership_days INTEGER, created_at TEXT NOT NULL, created_by TEXT NOT NULL,
    redeemed_at TEXT, contact_id TEXT
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS club_memberships (
    id TEXT PRIMARY KEY, contact_id TEXT NOT NULL UNIQUE, invite_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active', starts_at TEXT NOT NULL, expires_at TEXT,
    day_use_total INTEGER NOT NULL DEFAULT 3, day_use_used INTEGER NOT NULL DEFAULT 0,
    cover_exempt INTEGER NOT NULL DEFAULT 1, sao_joao_included INTEGER NOT NULL DEFAULT 1,
    confra_included INTEGER NOT NULL DEFAULT 1, carnaval_included INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS club_contacts (
    id TEXT PRIMARY KEY NOT NULL, full_name TEXT NOT NULL, rg TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE, email TEXT NOT NULL, age INTEGER NOT NULL,
    instagram TEXT, whatsapp TEXT NOT NULL, privacy_consent INTEGER NOT NULL,
    privacy_consent_at TEXT NOT NULL, image_use_consent INTEGER NOT NULL DEFAULT 0,
    image_use_consent_at TEXT, marketing_opt_in INTEGER NOT NULL DEFAULT 0,
    marketing_opt_in_at TEXT, created_at TEXT NOT NULL
  )`).run();
  const columns = await db.prepare("PRAGMA table_info(club_contacts)").all<{ name: string }>();
  const existing = new Set((columns.results ?? []).map((c) => c.name));
  if (!existing.has("birth_date")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN birth_date TEXT NOT NULL DEFAULT ''").run();
  if (!existing.has("locality")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN locality TEXT NOT NULL DEFAULT ''").run();
  if (!existing.has("visit_count")) await db.prepare("ALTER TABLE club_contacts ADD COLUMN visit_count INTEGER NOT NULL DEFAULT 0").run();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const token = String(body?.inviteToken ?? "");
  const fullName = String(body?.fullName ?? "").trim().slice(0, 120);
  const rg = String(body?.rg ?? "").trim().slice(0, 30);
  const cpf = String(body?.cpf ?? "").replace(/\D/g, "");
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 160);
  const birthDate = String(body?.birthDate ?? "");
  const locality = String(body?.locality ?? "").trim().slice(0, 120);
  const instagram = String(body?.instagram ?? "").trim().replace(/^@/, "").slice(0, 80);
  const whatsapp = normalizePhone(String(body?.whatsapp ?? ""));
  const privacyConsent = body?.privacyConsent === true;
  const imageConsent = body?.imageUseConsent === true;
  const marketing = body?.marketingOptIn === true;

  if (!/^[a-f0-9]{64}$/i.test(token) || !fullName || !rg || cpf.length !== 11 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !privacyConsent ||
      !locality || whatsapp.length < 12 || whatsapp.length > 15 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return NextResponse.json({ error: "Confira os dados obrigatórios do cadastro e o convite." }, { status: 400 });
  }
  const birth = new Date(`${birthDate}T12:00:00Z`);
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== birthDate || birthDate > new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: "Data de nascimento inválida." }, { status: 400 });
  }
  const nowDate = new Date();
  let age = nowDate.getUTCFullYear() - birth.getUTCFullYear();
  if (nowDate.getUTCMonth() < birth.getUTCMonth() || (nowDate.getUTCMonth() === birth.getUTCMonth() && nowDate.getUTCDate() < birth.getUTCDate())) age--;
  if (age < 18 || age > 120) return NextResponse.json({ error: "O cadastro é permitido apenas para maiores de 18 anos." }, { status: 400 });

  await ensureTables();
  const db = database();
  const now = nowDate.toISOString();
  const secretHash = await hash(token);
  const invite = await db.prepare("SELECT id, full_name AS fullName, whatsapp, membership_days AS membershipDays FROM club_invites WHERE token_hash = ? AND status = 'pending' AND expires_at > ?")
    .bind(secretHash, now).first<{ id: string; fullName: string; whatsapp: string; membershipDays: number | null }>();
  if (!invite) return NextResponse.json({ error: "Convite inválido, expirado, cancelado ou já utilizado." }, { status: 410 });
  if (invite.fullName.trim().toLocaleLowerCase("pt-BR") !== fullName.toLocaleLowerCase("pt-BR") ||
      normalizePhone(invite.whatsapp) !== whatsapp) {
    return NextResponse.json({ error: "Nome e WhatsApp precisam corresponder à pessoa autorizada no convite." }, { status: 403 });
  }

  const contactId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const expiresAt = invite.membershipDays === null ? null : new Date(nowDate.getTime() + invite.membershipDays * 86400000).toISOString();
  try {
    const results = await db.batch([
      db.prepare(`INSERT INTO club_contacts
        (id, full_name, rg, cpf, email, age, birth_date, locality, visit_count, instagram, whatsapp,
         privacy_consent, privacy_consent_at, image_use_consent, image_use_consent_at,
         marketing_opt_in, marketing_opt_in_at, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 1, ?, ?, ?, ?, ?, ?
        WHERE EXISTS (SELECT 1 FROM club_invites WHERE id = ? AND token_hash = ? AND status = 'pending' AND expires_at > ?)`)
        .bind(contactId, fullName, rg, cpf, email, age, birthDate, locality, instagram || null, whatsapp,
          now, imageConsent ? 1 : 0, imageConsent ? now : null, marketing ? 1 : 0, marketing ? now : null,
          now, invite.id, secretHash, now),
      db.prepare("UPDATE club_invites SET status = 'redeemed', redeemed_at = ?, contact_id = ? WHERE id = ? AND token_hash = ? AND status = 'pending' AND EXISTS (SELECT 1 FROM club_contacts WHERE id = ?)")
        .bind(now, contactId, invite.id, secretHash, contactId),
      db.prepare(`INSERT INTO club_memberships
        (id, contact_id, invite_id, status, starts_at, expires_at, day_use_total, day_use_used,
         cover_exempt, sao_joao_included, confra_included, carnaval_included, created_at)
        SELECT ?, ?, ?, 'active', ?, ?, 3, 0, 1, 1, 1, 1, ?
        WHERE EXISTS (SELECT 1 FROM club_invites WHERE id = ? AND status = 'redeemed' AND contact_id = ?)`)
        .bind(membershipId, contactId, invite.id, now, expiresAt, now, invite.id, contactId),
    ]);
    if (!results[0]?.meta?.changes || !results[1]?.meta?.changes || !results[2]?.meta?.changes) {
      return NextResponse.json({ error: "Não foi possível concluir o resgate. O convite pode ter sido utilizado." }, { status: 409 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("unique")) return NextResponse.json({ error: "Este CPF já possui cadastro no Tamandaré Club." }, { status: 409 });
    throw error;
  }
  return NextResponse.json({ ok: true, membership: { status: "active", expiresAt, dayUseTotal: 3, coverExempt: true } });
}
