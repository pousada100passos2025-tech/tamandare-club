import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { database } from "@/db/repository";
const ADMIN = "casadosbartenders@gmail.com";
async function admin() { const h = await headers(); return h.get("oai-authenticated-user-email")?.trim().toLowerCase() === ADMIN; }
async function tables() {
 const db = database();
 await db.prepare("CREATE TABLE IF NOT EXISTS club_invites (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL, whatsapp TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', expires_at TEXT NOT NULL, membership_days INTEGER, created_at TEXT NOT NULL, created_by TEXT NOT NULL, redeemed_at TEXT, contact_id TEXT)").run();
 await db.prepare("CREATE TABLE IF NOT EXISTS club_memberships (id TEXT PRIMARY KEY, contact_id TEXT NOT NULL UNIQUE, invite_id TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'active', starts_at TEXT NOT NULL, expires_at TEXT, day_use_total INTEGER NOT NULL DEFAULT 3, day_use_used INTEGER NOT NULL DEFAULT 0, cover_exempt INTEGER NOT NULL DEFAULT 1, sao_joao_included INTEGER NOT NULL DEFAULT 1, confra_included INTEGER NOT NULL DEFAULT 1, carnaval_included INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)").run();
}
async function hash(token:string) { const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)); return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,"0")).join(""); }
function phone(v:string) { const d=v.replace(/\D/g,""); return d.length===10||d.length===11 ? "55"+d : d; }
function token() { const a=new Uint8Array(32); crypto.getRandomValues(a); return Array.from(a).map(x=>x.toString(16).padStart(2,"0")).join(""); }
export async function GET() {
 if(!await admin()) return NextResponse.json({error:"Acesso restrito."},{status:403});
 await tables();
 const r=await database().prepare("SELECT id,full_name AS fullName,whatsapp,status,expires_at AS expiresAt,membership_days AS membershipDays,created_at AS createdAt,redeemed_at AS redeemedAt FROM club_invites ORDER BY created_at DESC LIMIT 100").all();
 return NextResponse.json({invites:r.results||[]},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:Request) {
 if(!await admin()) return NextResponse.json({error:"Acesso restrito."},{status:403});
 const b=await req.json().catch(()=>null) as {fullName?:string;whatsapp?:string;inviteDays?:number;membershipDays?:number|null}|null;
 const name=String(b?.fullName||"").trim().slice(0,120), tel=phone(String(b?.whatsapp||"")), days=Number(b?.inviteDays||7), term=b?.membershipDays===null?null:Number(b?.membershipDays||365);
 if(!name||tel.length<12||tel.length>15||!Number.isInteger(days)||days<1||days>30||(term!==null&&(!Number.isInteger(term)||term<1||term>3650))) return NextResponse.json({error:"Informe nome, WhatsApp válido e prazos permitidos."},{status:400});
 await tables();
 const secret=token(), id=crypto.randomUUID(), now=new Date(), expires=new Date(now.getTime()+days*86400000).toISOString();
 await database().prepare("INSERT INTO club_invites (id,token_hash,full_name,whatsapp,status,expires_at,membership_days,created_at,created_by) VALUES (?,?,?,?,'pending',?,?,?,?)").bind(id,await hash(secret),name,tel,expires,term,now.toISOString(),ADMIN).run();
 return NextResponse.json({ok:true,invite:{id,fullName:name,whatsapp:tel,expiresAt:expires,membershipDays:term},inviteUrl:new URL("/cadastro?convite="+secret,new URL(req.url).origin).toString()});
}
export async function PATCH(req:Request) {
 if(!await admin()) return NextResponse.json({error:"Acesso restrito."},{status:403});
 const b=await req.json().catch(()=>null) as {id?:string;action?:string}|null;
 if(!b?.id||b.action!=="cancel") return NextResponse.json({error:"Solicitação inválida."},{status:400});
 await tables();
 await database().prepare("UPDATE club_invites SET status='cancelled' WHERE id=? AND status IN ('pending','redeemed')").bind(b.id).run();
 await database().prepare("UPDATE club_memberships SET status='cancelled' WHERE invite_id=? AND status='active'").bind(b.id).run();
 return NextResponse.json({ok:true});
}