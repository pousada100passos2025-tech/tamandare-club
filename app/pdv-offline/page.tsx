"use client";
import { useEffect, useState } from "react";
import { listDrafts, saveDraft, type DraftSale } from "@/lib/pdv-offline";

export default function OfflinePdv() {
 const [online,setOnline]=useState(true);
 const [drafts,setDrafts]=useState<DraftSale[]>([]);
 const [error,setError]=useState("");
 const [table,setTable]=useState("");
 const [customer,setCustomer]=useState("");
 const [waiter,setWaiter]=useState("");
 const [item,setItem]=useState("Caipirinha");
 const [price,setPrice]=useState("15");
 const [quantity,setQuantity]=useState("1");
 const [method,setMethod]=useState<"cash"|"pending">("cash");
 const [received,setReceived]=useState("20");
 async function refresh(){try{setDrafts(await listDrafts())}catch{setError("Armazenamento offline indisponível neste navegador.")}}
 useEffect(()=>{
  setOnline(navigator.onLine);void refresh();
  const up=()=>setOnline(true),down=()=>setOnline(false);
  window.addEventListener("online",up);window.addEventListener("offline",down);
  if("serviceWorker" in navigator) navigator.serviceWorker.register("/pdv-sw.js",{scope:"/pdv-offline"}).catch(()=>{});
  return ()=>{window.removeEventListener("online",up);window.removeEventListener("offline",down)};
 },[]);
 const cents=Math.round(Number(price)*100),qty=Number(quantity),total=cents*qty, cash=Math.round(Number(received)*100);
 async function submit(event:React.FormEvent){
  event.preventDefault();setError("");
  if(!table.trim()||!waiter.trim()||!item.trim()||!Number.isSafeInteger(cents)||cents<0||!Number.isSafeInteger(qty)||qty<1||qty>100||total<=0||!Number.isSafeInteger(total)||total>100000000){setError("Confira mesa, funcionário, produto, valor e quantidade.");return}
  if(method==="cash" && (!Number.isSafeInteger(cash)||cash<total)){setError("Dinheiro recebido insuficiente.");return}
  const record:DraftSale={id:crypto.randomUUID(),createdAt:new Date().toISOString(),table:table.trim().slice(0,40),customerName:customer.trim().slice(0,120),waiterName:waiter.trim().slice(0,120),items:[{name:item.trim().slice(0,120),quantity:qty,unitPriceCents:cents}],totalCents:total,paymentMethod:method,...(method==="cash"?{receivedCents:cash}:{}),status:"local_only"};
  try{await saveDraft(record);await refresh()}catch{setError("Falha ao salvar. Não considere este pedido registrado.")}
 }
 return <main className="theme-night min-h-screen bg-background text-foreground px-4 py-8">
  <div className="mx-auto max-w-2xl space-y-6">
   <header className="flex items-center gap-4"><img src="/club/tamandare-club-profile.png" alt="" width="64" height="64"/><div><h1 className="text-2xl font-bold">PDV • contingência offline</h1><p className="text-sm text-muted-foreground">{online?"Internet disponível":"Sem internet"} • registros locais neste aparelho</p></div></header>
   <div role="alert" className="rounded-xl border border-amber-500/50 bg-amber-950/30 p-4 text-sm"><strong>Modo de preparação, não operacional.</strong> Pedidos abaixo são rascunhos locais e NÃO são transmitidos ao bar, caixa, Supabase ou Asaas. Não utilize esta tela para cobrar clientes. Sincronização e autenticação ainda não implementadas.</div>
   <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 space-y-4">
    <h2 className="text-xl font-semibold">Novo registro local de teste</h2>
    <label className="block text-sm">Mesa<input required value={table} onChange={e=>setTable(e.target.value)} maxLength={40} className="mt-1 w-full rounded border p-3 bg-background"/></label>
    <label className="block text-sm">Garçom (identificação de teste)<input required value={waiter} onChange={e=>setWaiter(e.target.value)} maxLength={120} className="mt-1 w-full rounded border p-3 bg-background"/></label>
    <label className="block text-sm">Cliente (opcional)<input value={customer} onChange={e=>setCustomer(e.target.value)} maxLength={120} className="mt-1 w-full rounded border p-3 bg-background"/></label>
    <label className="block text-sm">Produto<input required value={item} onChange={e=>setItem(e.target.value)} maxLength={120} className="mt-1 w-full rounded border p-3 bg-background"/></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-sm">Preço (R$)<input type="number" min="0.01" step="0.01" required value={price} onChange={e=>setPrice(e.target.value)} className="mt-1 w-full rounded border p-3 bg-background"/></label><label className="text-sm">Quantidade<input type="number" min="1" max="100" required value={quantity} onChange={e=>setQuantity(e.target.value)} className="mt-1 w-full rounded border p-3 bg-background"/></label></div>
    <label className="block text-sm">Forma (apenas simulação)<select value={method} onChange={e=>setMethod(e.target.value as "cash"|"pending")} className="mt-1 w-full rounded border p-3 bg-background"><option value="cash">Dinheiro (não confirmado)</option><option value="pending">Pagamento eletrônico pendente</option></select></label>
    {method==="cash" && <label className="block text-sm">Dinheiro entregue (R$)<input type="number" min="0" step="0.01" value={received} onChange={e=>setReceived(e.target.value)} className="mt-1 w-full rounded border p-3 bg-background"/></label>}
    <p className="font-semibold">Total: R$ {(Number.isFinite(total)?total/100:0).toFixed(2)} {method==="cash" && Number.isFinite(cash) ? " • Troco simulado: R$ "+(Math.max(0,cash-total)/100).toFixed(2) : ""}</p>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    <button type="submit" className="w-full rounded-xl bg-amber-400 p-3 font-bold text-black">Salvar rascunho local de teste</button>
   </form>
   <section className="space-y-3"><h2 className="text-xl font-semibold">Rascunhos neste dispositivo ({drafts.length})</h2>{drafts.map(d=><article key={d.id} className="rounded-xl border border-border bg-card p-4"><p className="font-semibold">{d.table} • R$ {(d.totalCents/100).toFixed(2)} </p><p className="text-sm text-muted-foreground">{d.items.map(i=>i.quantity+"x "+i.name).join(", ")} • {d.waiterName}</p><p className="text-xs text-amber-400">Somente local • não sincronizado</p></article>)}</section>
  </div>
 </main>;
}
