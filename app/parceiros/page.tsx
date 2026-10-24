"use client";

import { FormEvent, useState } from "react";

export default function PartnersPage() {
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Tente novamente.");
    setShareUrl(data.shareUrl);
  }
  return <main className="min-h-screen bg-[#080a10] px-6 py-10 text-[#f5f4f1] sm:px-10"><div className="mx-auto max-w-2xl"><a href="/" className="inline-flex items-center"><img src="/club/tamandare-club-profile.png" alt="Logotipo dourado do Tamandaré Club" className="h-20 w-20 object-contain mix-blend-screen" /></a><p className="mt-16 text-xs font-bold tracking-[.2em] text-[#ff8b80]">PARCERIAS & EVENTOS</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.05em]">Vamos criar boas noites juntos.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#a8abb7]">Conte um pouco sobre você e seu trabalho. A equipe do Tamandaré Club entra em contato para conversar sobre parcerias e oportunidades na casa.</p>{shareUrl ? <section className="mt-10 rounded-3xl border border-[#ff786e]/50 bg-[#10131c] p-7"><p className="text-sm text-[#d2d3d9]">Seu link de divulgação está pronto:</p><p className="mt-4 break-all rounded-xl bg-black/25 p-4 text-sm text-[#ff9d91]">{shareUrl}</p><button onClick={() => navigator.clipboard.writeText(shareUrl)} className="mt-5 rounded-xl bg-[#ef5960] px-5 py-3 text-sm font-bold text-white">Copiar link</button></section> : <form onSubmit={submit} className="mt-10 grid gap-5 rounded-3xl border border-white/10 bg-[#10131c] p-6 sm:grid-cols-2 sm:p-9"><PartnerField label="Seu nome" name="name" className="sm:col-span-2"/><PartnerField label="Nome da empresa" name="businessName" className="sm:col-span-2"/><PartnerField label="E-mail" name="email" type="email"/><PartnerField label="WhatsApp" name="whatsapp" type="tel" required={false}/><PartnerField label="Serviço que oferece" name="serviceType" className="sm:col-span-2"/><PartnerField label="Instagram" name="instagram" className="sm:col-span-2" required={false}/>{error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}<button className="rounded-xl bg-[#ef5960] px-5 py-4 text-sm font-bold text-white sm:col-span-2">Enviar meus dados</button></form>}</div></main>;
}
function PartnerField({ label, name, className = "", required = true, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) { return <label className={`grid gap-2 text-sm font-medium text-[#e5e5eb] ${className}`}><span>{label}</span><input name={name} required={required} {...props} className="w-full rounded-xl border border-white/15 bg-[#0b0d14] px-4 py-3 text-[#f5f4f1] outline-none focus:border-[#ff786e]" /></label>; }
