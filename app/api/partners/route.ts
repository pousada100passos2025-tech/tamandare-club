import { NextResponse } from "next/server";
import { database, makeCode } from "@/db/repository";

export async function POST(request: Request) {
  const body = await request.json();
  const required = ["name", "businessName", "email", "serviceType"];
  if (required.some((field) => !String(body[field] ?? "").trim())) {
    return NextResponse.json({ error: "Preencha os campos obrigatórios." }, { status: 400 });
  }
  const id = crypto.randomUUID();
  const shareCode = makeCode("EA");
  const now = new Date().toISOString();
  await database().prepare(
    "INSERT INTO partners (id, name, business_name, email, whatsapp, service_type, instagram, share_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, body.name.trim(), body.businessName.trim(), body.email.trim().toLowerCase(), body.whatsapp?.trim() || null, body.serviceType.trim(), body.instagram?.trim() || null, shareCode, now).run();
  return NextResponse.json({ shareCode, shareUrl: `${new URL(request.url).origin}/?p=${shareCode}` });
}
