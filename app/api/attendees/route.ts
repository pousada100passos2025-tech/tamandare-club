import { NextResponse } from "next/server";
import { database, makeCode } from "@/db/repository";

export async function POST(request: Request) {
  const body = await request.json();
  const required = ["fullName", "cpf", "email", "eventType", "guestCount", "eventLocation", "eventDate", "requestedService"];
  if (required.some((field) => !String(body[field] ?? "").trim()) || !body.acceptedTerms) {
    return NextResponse.json({ error: "Preencha todos os campos e aceite o uso dos dados." }, { status: 400 });
  }
  const cpf = String(body.cpf).replace(/\D/g, "");
  if (cpf.length !== 11) return NextResponse.json({ error: "Informe um CPF com 11 números." }, { status: 400 });
  const accessCode = makeCode("ALMEIDA");
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await database().prepare(
    "INSERT INTO attendees (id, full_name, cpf, email, event_type, guest_count, event_location, event_date, requested_service, partner_code, access_code, consent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, body.fullName.trim(), cpf, body.email.trim().toLowerCase(), body.eventType.trim(), Number(body.guestCount), body.eventLocation.trim(), body.eventDate, body.requestedService.trim(), body.partnerCode?.trim() || null, accessCode, now, now).run();
  return NextResponse.json({ accessCode, qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(accessCode)}` });
}
