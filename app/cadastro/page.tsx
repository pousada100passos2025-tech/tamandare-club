"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function CadastroPage() {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [residenceArea, setResidenceArea] = useState("");
  const registrationUrl = "https://tamandareclub.com.br/cadastro";
  const inviteMessage = `Oi! Faça seu cadastro no Tamandaré Club para acompanhar as novidades, os eventos e as promoções. A autorização para receber promoções pelo WhatsApp é opcional. Cadastre-se aqui: ${registrationUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setFeedback("");
    setBusy(true);
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const area = String(form.get("residenceArea") ?? "");
    const otherLocality = String(form.get("otherLocality") ?? "").trim();
    const data = { ...payload, locality: area === "Tamandaré" ? area : `Outra região: ${otherLocality}`, privacyConsent: form.get("privacyConsent") === "on", imageUseConsent: form.get("imageUseConsent") === "on", marketingOptIn: form.get("marketingOptIn") === "on" };
    try {
      const response = await fetch("/api/cadastros", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir o cadastro.");
      setDone(true);
      setResidenceArea("");
      formElement.reset();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível concluir o cadastro.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="club-page form-page">
      <header className="form-header"><Link className="brand" href="/"><img className="brand-logo" src="/club/tamandare-club-profile.png" alt="" /><span className="brand-name">Tamandaré <strong>Club</strong><small>Shows &amp; Eventos</small></span></Link><Link className="form-back" href="/">Voltar ao site</Link></header>
      <section className="form-shell">
        <p className="eyebrow">NOVIDADES E PROMOÇÕES</p>
        <h1>Entre para a<br /><em>lista do Club.</em></h1>
        <p className="form-intro">Faça seu cadastro para acompanhar as novidades, os eventos e as promoções do Tamandaré Club. Para receber promoções pelo WhatsApp, marque a opção abaixo — ela é opcional.</p>
        {done ? <div className="form-success" role="status"><strong>Cadastro recebido.</strong><span>Obrigado por se cadastrar no Tamandaré Club.</span><span>Acompanhe os shows, eventos e novidades pelo nosso Instagram.</span><a className="button button-primary instagram-follow-button" href="https://www.instagram.com/tamandare_club_oficial/" target="_blank" rel="noopener noreferrer">Seguir o Tamandaré Club no Instagram</a></div> : <form className="club-form" onSubmit={submit}>
          <div className="form-grid">
            <label className="form-field form-field-wide">Nome completo<input name="fullName" autoComplete="name" required maxLength={120} /></label>
            <label className="form-field">RG<input name="rg" autoComplete="off" required maxLength={30} /></label>
            <label className="form-field">CPF<input name="cpf" inputMode="numeric" autoComplete="off" required maxLength={14} /></label>
            <label className="form-field">E-mail<input name="email" type="email" autoComplete="email" required maxLength={160} /></label>
            <label className="form-field">Data de nascimento<input name="birthDate" type="date" autoComplete="bday" required /></label>
            <label className="form-field">Onde você mora?<select name="residenceArea" value={residenceArea} onChange={(event) => setResidenceArea(event.target.value)} required><option value="">Selecione</option><option value="Tamandaré">Tamandaré</option><option value="outra">Outra região</option></select></label>
            {residenceArea === "outra" && <label className="form-field">Cidade ou região<input name="otherLocality" autoComplete="address-level2" required maxLength={100} placeholder="Ex.: Recife, PE" /></label>}
            <label className="form-field">Instagram <span className="optional-label">opcional</span><input name="instagram" placeholder="@seuusuario" autoComplete="off" maxLength={80} /></label>
            <label className="form-field">WhatsApp com DDD<input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" required maxLength={20} /></label>
          </div>
          <label className="consent-line"><input name="privacyConsent" type="checkbox" required /><span>Autorizo o Tamandaré Club a usar estes dados para manter meu cadastro e atender minhas solicitações. Li o <Link href="/privacidade">aviso de privacidade</Link>.</span></label>
          <label className="consent-line"><input name="imageUseConsent" type="checkbox" /><span>Autorizo, de forma opcional, o registro e o uso da minha imagem em fotos e vídeos feitos dentro do espaço do Tamandaré Club e durante seus eventos, para divulgação nos canais oficiais do Club. Posso retirar esta autorização quando quiser.</span></label>
          <label className="consent-line consent-marketing"><input name="marketingOptIn" type="checkbox" /><span>Quero receber novidades e promoções do Tamandaré Club pelo WhatsApp. Posso retirar esta autorização quando quiser.</span></label>
          <p className="form-note">Se você não marcar a opção de promoções, seus dados não serão incluídos na lista de mensagens promocionais.</p>
          {feedback && <p className="form-error" role="alert">{feedback}</p>}
          <button className="button button-primary form-submit" disabled={busy}>{busy ? "Enviando cadastro…" : "Fazer meu cadastro"}</button>
        </form>}
        <a className="button button-quiet form-share" href={whatsappShareUrl} target="_blank" rel="noreferrer">Compartilhar convite pelo WhatsApp</a>
        <p className="form-note">O WhatsApp abrirá com o convite pronto. Escolha a pessoa e toque em enviar.</p>
      </section>
      <footer className="form-footer">Seus dados são consultados apenas pela administração do Tamandaré Club.</footer>
    </main>
  );
}
