"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function ExclusivePage() {
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[phone,setPhone]=useState("");
 const [accepted,setAccepted]=useState(false),[method,setMethod]=useState("pix");
 const [member,setMember]=useState<any>(null),[registered,setRegistered]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 async function refresh(){const r=await fetch("/api/exclusivo",{cache:"no-store"});const d=await r.json();if(r.status===401){setRegistered(false);return;}if(!r.ok)throw Error(d.error||"Falha na consulta");setMember(d);setRegistered(true);}
 useEffect(()=>{refresh().catch(()=>{});},[]);
 async function call(action:string,extra:object={}){const r=await fetch("/api/exclusivo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,...extra})});const d=await r.json();if(!r.ok)throw Error(d.error||"Erro no pagamento");return d;}
 async function join(e:React.FormEvent){e.preventDefault();setBusy(true);setNotice("");try{await call("join",{name,email,phone,termsConsent:accepted});await refresh();setNotice("Cadastro salvo. Escolha como pagar.");}catch(e){setNotice(String(e instanceof Error?e.message:e));}finally{setBusy(false);}}
 async function pay(){setBusy(true);setNotice("");try{const d=await call("checkout",{paymentMethod:method});if(typeof d.url==="string"&&/^https:\/\/asaas\.com\/checkoutSession\/show\?id=[0-9a-f-]{36}$/i.test(d.url)){window.location.assign(d.url);return;}await refresh();setNotice("Consulte o pagamento antes de tentar outra vez.");}catch(e){setNotice(String(e instanceof Error?e.message:e));}finally{setBusy(false);}}
 return <main className="min-h-screen bg-neutral-950 p-6 text-white"><div className="mx-auto max-w-lg rounded-2xl border border-amber-500 p-6">
 <Link href="/" className="text-amber-300">Voltar ao site</Link>
 <h1 className="mt-5 text-3xl font-bold text-amber-300">Tamandaré Club Exclusive</h1>
 <p className="my-4 text-2xl">R$ 50 mensais</p><p className="mb-4 text-sm">Entrada em shows regulares elegíveis e desconto de 15% em produtos. Não inclui Réveillon, open bar e eventos especiais. Cartão com renovação automática; Pix com renovação manual.</p>
 {!registered?<form onSubmit={join} className="space-y-4">
 <label className="block">Nome<input required minLength={3} value={name} onChange={e=>setName(e.target.value)} className="block w-full rounded bg-neutral-800 p-3"/></label>
 <label className="block">E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="block w-full rounded bg-neutral-800 p-3"/></label>
 <label className="block">WhatsApp<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="block w-full rounded bg-neutral-800 p-3"/></label>
 <label className="flex gap-2"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>Aceito o plano mensal, a renovação indicada e a política de <Link href="/privacidade" className="underline">privacidade</Link>.</span></label>
 <button disabled={busy} className="w-full rounded bg-amber-400 p-3 font-bold text-black">Cadastrar adesão</button></form>:
 <div className="space-y-3"><p>{member?.active?"Assinatura ativa":"Pagamento ainda não confirmado"}</p>
 {member?.validUntil&&<p>Válida até {new Date(member.validUntil).toLocaleDateString("pt-BR")}</p>}
 {!member?.active&&<><label className="block">Forma de pagamento<select value={method} onChange={e=>setMethod(e.target.value)} className="block w-full rounded bg-neutral-800 p-3"><option value="pix">Pix</option><option value="card">Cartão</option></select></label><button disabled={busy} onClick={pay} className="w-full rounded bg-amber-400 p-3 font-bold text-black">Pagar com Asaas</button></>}
 <button disabled={busy} onClick={()=>{setBusy(true);refresh().catch(e=>setNotice(e.message)).finally(()=>setBusy(false));}} className="w-full rounded border p-3">Conferir pagamento</button></div>}
 {notice&&<p role="status" className="mt-5 text-amber-200">{notice}</p>}
 <p className="mt-4 text-xs text-neutral-400">Não crie outra cobrança se o pagamento estiver pendente. Procure a equipe caso tenha trocado de aparelho.</p>
 </div></main>;
}
