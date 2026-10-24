import { NextResponse } from "next/server";
import { database } from "@/db/repository";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ partner: null });
  const result = await database().prepare("SELECT business_name FROM partners WHERE share_code = ?").bind(code).first<{ business_name: string }>();
  return NextResponse.json({ partner: result ? { name: result.business_name } : null });
}
