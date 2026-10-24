"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type Contact = {
  id: string; fullName: string; rg: string; cpf: string; email: string; age: number; birthDate: string; locality: string; visitCount: number;
  instagram: string | null; whatsapp: string; imageUseConsent: number; marketingOptIn: number; createdAt: string;
};
type Reservation = {
  id: string; fullName: string; whatsapp: string; reservationDate: string; guestCount: number;
  reservationType: string; notes: string | null; marketingOptIn: number;
  status: "pending" | "confirmed" | "cancelled"; createdAt: string;
};
type MenuItem = { id: string; name: string; category: string; description: string | null; regularPrice: number; promoPrice: number | null; active: boolean; createdAt: string };
type MenuForm = { name: string; category: string; description: string; regularPrice: string; promoPrice: string };
const emptyMenuForm: MenuForm = { name: "", category: "Drinks", description: "", regularPrice: "", promoPrice: "" };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function CadastrosAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalReservations, setTotalReservations] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [reservationsNextOffset, setReservationsNextOffset] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [reservationSearch, setReservationSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [marketingOnly, setMarketingOnly] = useState(true);
  const [details, setDetails] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuForm, setMenuForm] = useState<MenuForm>(emptyMenuForm);
  const [editingMenuItem, setEditingMenuItem] = useState<string | null>(null);
  const [menuBusy, setMenuBusy] = useState(false);

  const refresh = useCallback(async (query = contactSearch) => {
    const params = new URLSearchParams({ offset: "0" });
    if (query.trim()) params.set("q", query.trim());
    const [response, reservationsResponse] = await Promise.all([
      fetch(`/api/cadastros?${params.toString()}`, { cache: "no-store" }),
      fetch("/api/reservas?offset=0", { cache: "no-store" }),
    ]);
    if (response.status === 403) { setNotice("Entre com a conta administradora autorizada para consultar os cadastros."); return; }
    const [result, reservationResult] = await Promise.all([response.json(), reservationsResponse.json()]);
    if (!reservationsResponse.ok) throw new Error(reservationResult.error || "Não foi possível carregar as reservas.");
    setContacts(result.contacts ?? []);
    setTotalContacts(result.total ?? 0);
    setNextOffset(result.nextOffset ?? null);
    setReservations(reservationResult.reservations ?? []);
    setTotalReservations(reservationResult.total ?? 0);
    setReservationsNextOffset(reservationResult.nextOffset ?? null);
  }, [contactSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 250);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const refreshMenu = useCallback(async () => {
    try {
      const response = await fetch("/api/cardapio", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar o cardápio.");
      setMenuItems(result.items ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível carregar o cardápio.");
    }
  }, []);

  useEffect(() => { void refreshMenu(); }, [refreshMenu]);

  async function loadMore() {
    if (nextOffset === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ offset: String(nextOffset) });
      if (contactSearch.trim()) params.set("q", contactSearch.trim());
      const response = await fetch(`/api/cadastros?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível carregar mais cadastros.");
      const result = await response.json();
      setContacts((current) => [...current, ...(result.contacts ?? [])]);
      setTotalContacts(result.total ?? totalContacts);
      setNextOffset(result.nextOffset ?? null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível carregar mais cadastros.");
    } finally { setLoadingMore(false); }
  }

  async function loadMoreReservations() {
    if (reservationsNextOffset === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/reservas?offset=${reservationsNextOffset}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar mais reservas.");
      setReservations((current) => [...current, ...(result.reservations ?? [])]);
      setTotalReservations(result.total ?? totalReservations);
      setReservationsNextOffset(result.nextOffset ?? null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível carregar mais reservas.");
    } finally { setLoadingMore(false); }
  }

  async function updateReservationStatus(id: string, status: Reservation["status"]) {
    const response = await fetch("/api/reservas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { setNotice("Não foi possível atualizar o status da reserva."); return; }
    setReservations((current) => current.map((reservation) => reservation.id === id ? { ...reservation, status } : reservation));
  }

  async function registerVisit(contact: Contact) {
    const visitCount = contact.visitCount + 1;
    const response = await fetch("/api/cadastros", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: contact.id, visitCount }) });
    if (!response.ok) { setNotice("Não foi possível atualizar a frequência de visitas."); return; }
    setContacts((current) => current.map((item) => item.id === contact.id ? { ...item, visitCount } : item));
    setNotice(`Visita registrada para ${contact.fullName}. Total: ${visitCount}.`);
  }

  const filtered = useMemo(() => {
    return contacts.filter((contact) => !marketingOnly || contact.marketingOptIn === 1);
  }, [contacts, marketingOnly]);

  const filteredReservations = useMemo(() => {
    const term = reservationSearch.trim().toLocaleLowerCase("pt-BR");
    return reservations.filter((reservation) => !term || `${reservation.fullName} ${reservation.whatsapp} ${reservation.reservationType} ${reservation.reservationDate}`.toLocaleLowerCase("pt-BR").includes(term));
  }, [reservations, reservationSearch]);

  function toggle(id: string, source: "contact" | "reservation" = "contact") {
    const selectionId = `${source}:${id}`;
    setSelected((current) => current.includes(selectionId) ? current.filter((item) => item !== selectionId) : current.length >= 50 ? current : [...current, selectionId]);
  }

  function selectVisible() {
    const eligible = [
      ...filtered.filter((contact) => contact.marketingOptIn === 1).map((contact) => `contact:${contact.id}`),
      ...filteredReservations.filter((reservation) => reservation.marketingOptIn === 1).map((reservation) => `reservation:${reservation.id}`),
    ];
    setSelected((current) => [...new Set([...current, ...eligible])].slice(0, 50));
  }

  async function sendCampaign() {
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/promocoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contactIds: selected, message }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar a campanha.");
      setNotice(`Resultado do envio: ${result.sent} enviadas e ${result.failed} com falha.`);
      setSelected([]); setMessage("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível enviar a campanha.");
    } finally { setBusy(false); }
  }

  function editMenuItem(item: MenuItem) {
    setEditingMenuItem(item.id);
    setMenuForm({ name: item.name, category: item.category, description: item.description ?? "", regularPrice: String(item.regularPrice), promoPrice: item.promoPrice === null ? "" : String(item.promoPrice) });
    document.getElementById("ofertas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveMenuItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMenuBusy(true); setNotice("");
    const payload = { ...menuForm, regularPrice: Number(menuForm.regularPrice), promoPrice: menuForm.promoPrice.trim() ? Number(menuForm.promoPrice) : null, ...(editingMenuItem ? { id: editingMenuItem, active: menuItems.find((item) => item.id === editingMenuItem)?.active ?? true } : {}) };
    try {
      const response = await fetch("/api/cardapio", { method: editingMenuItem ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar o produto.");
      setNotice(editingMenuItem ? "Produto atualizado no cardápio." : "Produto adicionado ao cardápio.");
      setMenuForm(emptyMenuForm); setEditingMenuItem(null);
      await refreshMenu();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
    } finally { setMenuBusy(false); }
  }

  async function setMenuItemActive(item: MenuItem, active: boolean) {
    const response = await fetch("/api/cardapio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, active }) });
    if (!response.ok) { setNotice("Não foi possível atualizar a disponibilidade do produto."); return; }
    setMenuItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, active } : entry));
  }

  async function deleteMenuItem(item: MenuItem) {
    if (!window.confirm(`Excluir ${item.name} do cardápio?`)) return;
    const response = await fetch("/api/cardapio", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
    if (!response.ok) { setNotice("Não foi possível excluir o produto."); return; }
    setMenuItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  function addOfferToMessage(item: MenuItem) {
    if (item.promoPrice === null) return;
    const line = `🌴 TAMANDARÉ CLUB · OFERTA ESPECIAL\n✨ ${item.name}: de ${currency.format(item.regularPrice)} por ${currency.format(item.promoPrice)}${item.description ? ` — ${item.description}` : ""}`;
    setMessage((current) => current.trim() ? `${current.trim()}\n\n${line}` : line);
    document.getElementById("campanha")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setNotice(`Oferta de ${item.name} adicionada à mensagem. Agora selecione os clientes autorizados.`);
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir permanentemente este cadastro?")) return;
    const response = await fetch("/api/cadastros", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) { setSelected((current) => current.filter((item) => item !== `contact:${id}`)); setDetails(null); await refresh(contactSearch); }
    else setNotice("Não foi possível excluir esse cadastro.");
  }

  async function revokePromotions(id: string) {
    const response = await fetch("/api/cadastros", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, marketingOptIn: false }) });
    if (response.ok) { setSelected((current) => current.filter((item) => item !== `contact:${id}`)); setDetails(null); await refresh(); }
    else setNotice("Não foi possível retirar a autorização de promoções.");
  }

  const current = contacts.find((contact) => contact.id === details);

  return <main className="club-page admin-page">
    <header className="form-header"><Link className="brand" href="/"><img className="brand-logo" src="/club/tamandare-club-profile.png" alt="" /><span className="brand-name">Tamandaré <strong>Club</strong><small>Administração</small></span></Link><Link className="form-back" href="/">Ver site</Link></header>
    <section className="admin-shell">
      <p className="eyebrow">ÁREA RESTRITA · ADMINISTRAÇÃO</p><h1>Reservas e<br /><em>cadastros.</em></h1>
      <p className="admin-intro">Acompanhe pedidos de reserva e cadastros. Só selecione para promoções quem autorizou receber mensagens pelo WhatsApp.</p>
      {notice && <div className="admin-notice" role="status">{notice}</div>}
      <section className="contacts-section">
        <div className="contacts-tools"><div><span className="admin-label">PEDIDOS DO SITE</span><h2>{totalReservations} reservas</h2></div><label className="search-field"><span className="sr-only">Buscar reservas</span><input value={reservationSearch} onChange={(event) => setReservationSearch(event.target.value)} placeholder="Buscar nome, WhatsApp ou data" /></label></div>
        <div className="contact-list">{filteredReservations.map((reservation) => <article className="contact-row reservation-row" key={reservation.id}>
          <label className="contact-select"><input type="checkbox" checked={selected.includes(`reservation:${reservation.id}`)} disabled={reservation.marketingOptIn !== 1 || (!selected.includes(`reservation:${reservation.id}`) && selected.length >= 50)} onChange={() => toggle(reservation.id, "reservation")} aria-label={`Selecionar ${reservation.fullName} para promoção`} /></label>
          <div className="contact-summary reservation-summary"><strong>{reservation.fullName}</strong><span>{reservation.whatsapp} · {new Date(`${reservation.reservationDate}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" })} · {reservation.guestCount} pessoas · {reservation.reservationType}</span>{reservation.notes && <small>{reservation.notes}</small>}</div>
          <div className="reservation-actions"><span className={reservation.marketingOptIn === 1 ? "consent-badge active" : "consent-badge"}>{reservation.marketingOptIn === 1 ? "Aceita promoções" : "Sem autorização"}</span><select aria-label={`Status da reserva de ${reservation.fullName}`} value={reservation.status} onChange={(event) => void updateReservationStatus(reservation.id, event.target.value as Reservation["status"])}><option value="pending">Pendente</option><option value="confirmed">Confirmada</option><option value="cancelled">Cancelada</option></select></div>
        </article>)}{filteredReservations.length === 0 && <p className="empty-contacts">Nenhuma reserva encontrada.</p>}</div>
        {reservationsNextOffset !== null && <button className="load-more-button" onClick={() => void loadMoreReservations()} disabled={loadingMore}>{loadingMore ? "Carregando…" : `Carregar mais reservas (${reservations.length} de ${totalReservations})`}</button>}
      </section>
      <section className="menu-admin-section" id="ofertas" aria-labelledby="menu-admin-title">
        <div className="menu-admin-heading"><div className="menu-admin-brand"><img src="/club/tamandare-club-profile.png" alt="Logomarca do Tamandaré Club" /><div><span className="admin-label">CARDÁPIO · PREÇOS E OFERTAS</span><h2 id="menu-admin-title">Produtos do Club</h2></div></div><p className="menu-admin-intro">Cadastre o preço normal e, quando quiser, o valor promocional. Use uma oferta para montar a mensagem da campanha.</p></div>
        <form className="menu-admin-form" onSubmit={saveMenuItem}>
          <label className="admin-field">Nome do produto<input required maxLength={100} value={menuForm.name} onChange={(event) => setMenuForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Caipirinha" /></label>
          <label className="admin-field">Categoria<select value={menuForm.category} onChange={(event) => setMenuForm((current) => ({ ...current, category: event.target.value }))}><option>Drinks</option><option>Bebidas</option><option>Petiscos</option><option>Caldinhos</option><option>Outros</option></select></label>
          <label className="admin-field">Preço normal (R$)<input required type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" value={menuForm.regularPrice} onChange={(event) => setMenuForm((current) => ({ ...current, regularPrice: event.target.value }))} placeholder="20,00" /></label>
          <label className="admin-field">Preço promocional (R$)<input type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" value={menuForm.promoPrice} onChange={(event) => setMenuForm((current) => ({ ...current, promoPrice: event.target.value }))} placeholder="Opcional" /></label>
          <label className="admin-field menu-description-field">Descrição (opcional)<input maxLength={240} value={menuForm.description} onChange={(event) => setMenuForm((current) => ({ ...current, description: event.target.value }))} placeholder="Ex.: limão, cachaça e gelo" /></label>
          <div className="menu-form-actions"><button className="button button-primary" disabled={menuBusy}>{menuBusy ? "Salvando…" : editingMenuItem ? "Salvar alterações" : "Adicionar ao cardápio"}</button>{editingMenuItem && <button type="button" className="button button-quiet" onClick={() => { setEditingMenuItem(null); setMenuForm(emptyMenuForm); }}>Cancelar edição</button>}</div>
          <p className="menu-form-hint">O preço promocional precisa ser menor que o preço normal. Esses produtos ficam no ADM para montar ofertas.</p>
        </form>
        <div className="menu-admin-list" aria-live="polite">{menuItems.map((item) => <article className={`menu-admin-item ${item.active ? "" : "is-paused"}`} key={item.id}>
          <div className="menu-admin-item-copy"><span className="admin-label">{item.category}{item.active ? " · ATIVO" : " · PAUSADO"}</span><h3>{item.name}</h3>{item.description && <p>{item.description}</p>}<div className="menu-item-prices"><span>Normal: {currency.format(item.regularPrice)}</span>{item.promoPrice !== null && <strong>Promo: {currency.format(item.promoPrice)}</strong>}</div></div>
          <div className="menu-admin-actions">{item.promoPrice !== null && <button className="button button-primary" onClick={() => addOfferToMessage(item)} disabled={!item.active}>Usar oferta</button>}<button className="text-button" onClick={() => editMenuItem(item)}>Editar</button><button className="text-button" onClick={() => void setMenuItemActive(item, !item.active)}>{item.active ? "Pausar" : "Ativar"}</button><button className="text-button menu-delete-button" onClick={() => void deleteMenuItem(item)}>Excluir</button></div>
        </article>)}{menuItems.length === 0 && <p className="empty-contacts">Nenhum produto cadastrado ainda.</p>}</div>
      </section>
      <section className="campaign-box" id="campanha" aria-label="Preparar promoção">
        <div className="campaign-heading"><div><span className="admin-label">CAMPANHA NO WHATSAPP</span><h2>{selected.length} de 50 selecionadas</h2></div><button className="text-button" onClick={selectVisible}>Selecionar pessoas autorizadas</button></div>
        <label className="admin-field">Texto da promoção<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={900} placeholder="Escreva a promoção que será enviada pelo WhatsApp Business." /></label>
        <div className="campaign-footer"><span>Somente contatos com autorização ativa serão aceitos pelo envio.</span><button className="button button-primary" onClick={sendCampaign} disabled={busy || selected.length === 0 || !message.trim()}>{busy ? "Enviando…" : `Enviar oferta (${selected.length})`}</button></div>
      </section>
      <section className="contacts-section">
        <div className="contacts-tools"><div><span className="admin-label">BASE DE CONTATOS</span><h2>{contactSearch.trim() ? `${totalContacts} encontrados` : `${totalContacts} cadastros`}</h2></div><label className="search-field"><span className="sr-only">Buscar clientes cadastrados</span><input value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Buscar por nome, CPF, WhatsApp, e-mail ou região" /></label></div>
        <label className="filter-line"><input type="checkbox" checked={marketingOnly} onChange={(event) => setMarketingOnly(event.target.checked)} /> Mostrar apenas quem autorizou promoções</label>
        <div className="contact-list">{filtered.map((contact) => <article className="contact-row" key={contact.id}>
          <label className="contact-select"><input type="checkbox" checked={selected.includes(`contact:${contact.id}`)} disabled={contact.marketingOptIn !== 1 || (!selected.includes(`contact:${contact.id}`) && selected.length >= 50)} onChange={() => toggle(contact.id, "contact")} aria-label={`Selecionar ${contact.fullName}`} /></label>
          <button className="contact-summary" onClick={() => setDetails(contact.id)}><strong>{contact.fullName}</strong><span>{contact.whatsapp} · {contact.email}</span><small>{contact.locality || "Localidade não informada"} · {contact.visitCount} visitas</small></button>
          <div className="contact-actions"><span className={contact.marketingOptIn === 1 ? "consent-badge active" : "consent-badge"}>{contact.marketingOptIn === 1 ? "Autorizou promoções" : "Sem autorização"}</span><button className="visit-button" onClick={() => void registerVisit(contact)}>+ Registrar visita</button></div>
        </article>)}{filtered.length === 0 && <p className="empty-contacts">Nenhum cadastro encontrado.</p>}</div>
        {contacts.length > 0 && <p className="admin-privacy-note">Exibindo {contacts.length} de {totalContacts}. CPF e RG ficam ocultos na lista; abra um cadastro para ver os detalhes.</p>}
        {nextOffset !== null && <button className="load-more-button" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? "Carregando…" : `Carregar mais cadastros (${contacts.length} de ${totalContacts})`}</button>}
      </section>
    </section>
    {current && <div className="modal-backdrop" role="presentation" onClick={() => setDetails(null)}><section className="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setDetails(null)} aria-label="Fechar">×</button><span className="admin-label">DADOS RESTRITOS</span><h2 id="contact-title">{current.fullName}</h2><dl><dt>CPF</dt><dd>{current.cpf}</dd><dt>RG</dt><dd>{current.rg}</dd><dt>E-mail</dt><dd>{current.email}</dd><dt>Idade</dt><dd>{current.age} anos</dd><dt>Nascimento</dt><dd>{current.birthDate ? new Date(`${current.birthDate}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "Não informado"}</dd><dt>Localidade</dt><dd>{current.locality || "Não informada"}</dd><dt>Visitas</dt><dd>{current.visitCount}</dd><dt>Instagram</dt><dd>{current.instagram ? `@${current.instagram}` : "Não informado"}</dd><dt>WhatsApp</dt><dd>{current.whatsapp}</dd><dt>Uso de imagem</dt><dd>{current.imageUseConsent === 1 ? "Autorizado para site e Instagram" : "Não autorizado"}</dd><dt>Promoções</dt><dd>{current.marketingOptIn === 1 ? "Autorizadas" : "Não autorizadas"}</dd></dl>{current.marketingOptIn === 1 && <button className="delete-button" onClick={() => void revokePromotions(current.id)}>Retirar autorização de promoções</button>}<button className="delete-button" onClick={() => void remove(current.id)}>Excluir cadastro</button></section></div>}
  </main>;
}
