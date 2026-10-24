"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ReveillonReservationPage() {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setFeedback("");
    const form = new FormData(formElement);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      whatsapp: String(form.get("whatsapp") ?? "").trim(),
      reservationDate: String(form.get("reservationDate") ?? ""),
      guestCount: Number(form.get("guestCount")),
      reservationType: "Réveillon 2027",
      notes: String(form.get("notes") ?? "").trim(),
      privacyConsent: form.get("privacyConsent") === "on",
      marketingOptIn: false,
    };

    try {
      const response = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar seu pedido.");
      setDone(true);
      formElement.reset();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível enviar seu pedido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="club-page form-page">
      <header className="form-header">
        <Link className="brand" href="/">
          <img className="brand-logo" src="/club/tamandare-club-profile.png" alt="" />
          <span className="brand-name">Tamandaré <strong>Club</strong><small>Réveillon 2027</small></span>
        </Link>
        <Link className="form-back" href="/">Voltar ao site</Link>
      </header>

      <section className="reveillon-hero" aria-labelledby="reveillon-title">
        <img className="reveillon-hero-image" src="/club/reveillon-2027-hero.webp" alt="Imagem ilustrativa de fogos dourados e coqueiros em uma noite de Réveillon no litoral." fetchPriority="high" />
        <div className="reveillon-hero-copy">
          <p className="eyebrow">30 E 31 DE DEZEMBRO · 1º DE JANEIRO</p>
          <h1 id="reveillon-title">Três dias.<br /><em>Um novo ano.</em></h1>
          <p>Réveillon 2027 · Tamandaré Club</p>
          <span className="reveillon-badge">Open bar · Ingressos por dia</span>
        </div>
      </section>
      <section className="form-shell reveillon-shell">
        <p className="eyebrow">ESCOLHA SEU DIA</p>
        <h2 className="reveillon-section-title">Cada dia, uma celebração.</h2>
        <p className="form-intro">O ingresso é individual e válido apenas para a data escolhida. Os mesmos preços e quantidades de lotes se repetem em cada dia. Para participar de mais de uma data, é necessário um ingresso para cada dia.</p>
        <div className="reveillon-days">
          {[
            { date: "2026-12-30", day: "30", month: "Dezembro", year: "2026" },
            { date: "2026-12-31", day: "31", month: "Dezembro", year: "2026" },
            { date: "2027-01-01", day: "01", month: "Janeiro", year: "2027" },
          ].map((day) => <article className="reveillon-day" key={day.date}>
            <time dateTime={day.date}><strong>{day.day}</strong><span>{day.month} {day.year}</span></time>
            <p>Open bar</p>
            <dl>
              <div><dt>1º lote · 50 ingressos</dt><dd>R$ 600</dd></div>
              <div><dt>2º lote · 100 ingressos</dt><dd>R$ 800</dd></div>
              <div><dt>3º lote · 150 ingressos</dt><dd>R$ 950</dd></div>
            </dl>
            <small>300 ingressos previstos para esta data</small>
          </article>)}
        </div>
        <p className="reveillon-sales-notice" role="status">Vendas online ainda não disponíveis. O formulário abaixo registra apenas um pedido de reserva, sem cobrança ou emissão de ingresso.</p>
        <h2 className="reveillon-section-title">Solicite sua reserva.</h2>
        <p className="form-intro">Escolha uma data e informe até cinco pessoas. A equipe entrará em contato pelo WhatsApp para confirmar as condições e a disponibilidade.</p>

        {done ? (
          <div className="form-success" role="status">
            <strong>Pedido enviado.</strong>
            <span>Recebemos seu pedido de reserva para o Réveillon 2027.</span>
            <span>Aguarde o contato da equipe pelo WhatsApp. A reserva só fica confirmada após a confirmação do Tamandaré Club.</span>
          </div>
        ) : (
          <form className="club-form" onSubmit={submit}>
            <div className="form-grid">
              <label className="form-field form-field-wide">Nome completo<input name="fullName" autoComplete="name" required maxLength={120} /></label>
              <label className="form-field">WhatsApp com DDD<input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" required maxLength={20} /></label>
              <label className="form-field">Dia do evento<select name="reservationDate" defaultValue="" required><option value="" disabled>Selecione uma data</option><option value="2026-12-30">30 de dezembro de 2026</option><option value="2026-12-31">31 de dezembro de 2026</option><option value="2027-01-01">1º de janeiro de 2027</option></select></label>
              <label className="form-field">Quantidade de pessoas (até 5)<input name="guestCount" type="number" min={1} max={5} step={1} required /></label>
              <label className="form-field form-field-wide">Observações <span className="optional-label">opcional</span><textarea name="notes" maxLength={500} placeholder="Informe alguma necessidade ou detalhe do seu grupo." /></label>
            </div>
            <label className="consent-line"><input name="privacyConsent" type="checkbox" required /><span>Autorizo o Tamandaré Club a usar meus dados para atender este pedido de reserva. Li o <Link href="/privacidade">aviso de privacidade</Link>.</span></label>
            {feedback && <p className="form-error" role="alert">{feedback}</p>}
            <button className="button button-primary form-submit" disabled={busy}>{busy ? "Enviando pedido…" : "Solicitar reserva"}</button>
          </form>
        )}
        <p className="form-note">Este formulário registra um pedido de reserva. A equipe confirmará a disponibilidade e as condições pelo WhatsApp.</p>
      </section>
      <footer className="form-footer">Tamandaré Club · Tamandaré, Pernambuco</footer>
    </main>
  );
}
