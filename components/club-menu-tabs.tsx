"use client";

import { useState } from "react";
import { ArrowUpRight, GlassWater, Music2, Utensils } from "lucide-react";

const whatsapp = "https://wa.me/5581996819959";

const tabs = [
  {
    id: "drinks",
    label: "Drinks",
    title: "Cardápio de drinks",
    description: "Peça à equipe as opções e os valores disponíveis no dia da sua visita.",
    action: "Consultar drinks",
    message: "Oi! Quero conhecer o cardápio de drinks do Tamandaré Club.",
    icon: GlassWater,
  },
  {
    id: "petiscos",
    label: "Petiscos",
    title: "Petiscos e caldinhos",
    description: "Consulte as opções de petiscos e caldinhos disponíveis no Tamandaré Club.",
    action: "Consultar petiscos",
    message: "Oi! Quero conhecer as opções de petiscos e caldinhos do Tamandaré Club.",
    icon: Utensils,
  },
  {
    id: "atracoes",
    label: "Atrações",
    title: "Música ao vivo e atrações",
    description: "Forró, brega, pagode e sertanejo. Fale com a equipe para ver a programação atualizada.",
    action: "Consultar programação",
    message: "Oi! Quero saber a programação de atrações do Tamandaré Club.",
    icon: Music2,
  },
] as const;

export function ClubMenuTabs() {
  const [activeId, setActiveId] = useState<(typeof tabs)[number]["id"]>("drinks");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const Icon = active.icon;
  const href = `${whatsapp}?text=${encodeURIComponent(active.message)}`;

  return (
    <section className="club-menu section-wrap" id="cardapio" aria-labelledby="club-menu-title">
      <div className="club-menu-heading">
        <div>
          <div className="intro-kicker"><span className="section-number">03</span><span>ESCOLHA SUA EXPERIÊNCIA</span></div>
          <h2 id="club-menu-title">Do primeiro brinde<br /><em>ao último show.</em></h2>
        </div>
        <p>Veja as opções do Club e consulte pelo WhatsApp o cardápio e a programação atualizados.</p>
      </div>

      <div className="club-menu-tabs" role="tablist" aria-label="Cardápio e atrações do Tamandaré Club">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const selected = active.id === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`club-tab-${tab.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls="club-menu-panel"
              tabIndex={selected ? 0 : -1}
              className={selected ? "club-menu-tab is-active" : "club-menu-tab"}
              onClick={() => setActiveId(tab.id)}
            >
              <TabIcon size={17} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="club-menu-panel" id="club-menu-panel" role="tabpanel" aria-labelledby={`club-tab-${active.id}`}>
        <div className="club-menu-panel-icon"><Icon size={25} aria-hidden="true" /></div>
        <div className="club-menu-panel-copy">
          <span className="gallery-photo-label">TAMANDARÉ CLUB · TAMANDARÉ, PE</span>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
        </div>
        <a className="button button-primary" href={href} target="_blank" rel="noreferrer">
          {active.action}<ArrowUpRight size={17} />
        </a>
      </div>
    </section>
  );
}
