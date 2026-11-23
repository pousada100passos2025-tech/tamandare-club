import { NextResponse } from "next/server";
import { database } from "@/db/repository";
async function hash(token:string) { const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)); return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,"0")).join(""); }
export async function GET(req:Request) {
 const token=new URL(req.url).searchParams.get("token")||"";
 if(!/^[a-f0-9]{64}$/i.test(token)) return NextResponse.json({valid:false,error:"Código de convite inválido."},{status:400});
 await database().prepare("CREATE TABLE IF NOT EXISTS club_invites (id TEXT PRIMARY KEY,token_hash TEXT NOT NULL UNIQUE,full_name TEXT NOT NULL,whatsapp TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',expires_at TEXT NOT NULL,membership_days INTEGER,created_at TEXT NOT NULL,created_by TEXT NOT NULL,redeemed_at TEXT,contact_id TEXT)").run();
 const i=await database().prepare("SELECT full_name AS fullName,whatsapp,status,expires_at AS expiresAt FROM club_invites WHERE token_hash=?").bind(await hash(token)).first<{fullName:string;whatsapp:string;status:string;expiresAt:string}>();
 if(!i||i.status!=="pending"||i.expiresAt<=new Date().toISOString()) return NextResponse.json({valid:false,error:"Convite expirado, cancelado ou já utilizado."},{status:404});
 const digits=i.whatsapp.replace(/\D/g,"");
 return NextResponse.json({valid:true,fullName:i.fullName,phoneHint:"••••"+digits.slice(-4),expiresAt:i.expiresAt});
}