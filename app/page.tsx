"use client";

import { useState } from "react";
import { PhotoGallery } from "@/components/photo-gallery";
import {
  ChevronDown,
  MapPin,
  Flower2,
  UtensilsCrossed,
  Camera,
  Music,
  Shirt,
  Sparkles,
  Menu,
  X,
  CakeSlice,
  ClipboardList,
  Martini,
  Coffee,
  Speaker,
  Mail,
  Mic2,
  Waves,
  Ticket,
  CalendarClock,
  Navigation,
  PartyPopper,
} from "lucide-react";
import { AttractionsCarousel, type AttractionSlide } from "@/components/attractions-carousel";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import {
  ADDRESS,
  MAPS_URL,
  WHATSAPP_DISPLAY,
} from "@/lib/whatsapp";

const logoImg = "/club/tamandare-club-profile.png";
const heroImg = "/club/hero-night.png";
const espacoImg = "/espaco/almeida-salao-noivas.jpeg";
const piscinaLoungeImg = "/espaco/almeida-lounge-piscina.jpeg";
const areaExternaImg = "/espaco/almeida-area-externa.jpeg";
const barImg = "/espaco/bar-layout-tamandare.png";

const CADASTRO_URL = "/cadastro";

const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "Programação", href: "#programacao" },
  { label: "Atrações", href: "#atracoes" },
  { label: "Réveillon", href: "/reservas/reveillon" },
  { label: "Club Exclusive", href: "/exclusivo" },
  { label: "Reservas e cadastro", href: CADASTRO_URL },
  { label: "Galeria", href: "#galeria" },
  { label: "Casamentos e Eventos", href: "#casamentos" },
  { label: "Contato", href: "#contato" },
];

const inauguracaoItems = [
  "Pagode da Rua 27 ao vivo",
  "Área com piscina",
  "Drinks e cocktails",
  "Caldinhos e feijoada",
  "Promoções de inauguração",
];

export default function Home() {
  return (
    <div className="theme-night min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <ReveillonDestaque />
        <Atracoes />
        <Programacao />
        <Reservas />
        <Cardapio />
        <Gallery />
        <PhotoGallery />
        <Casamentos />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
      {children}
    </p>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 container-padding py-3">
        <a href="#inicio" className="flex shrink-0 items-center gap-3">
          <img
            src={logoImg}
            alt="Logo Tamandaré Club"
            className="h-14 w-14 rounded-lg object-contain md:h-16 md:w-16"
            width={64}
            height={64}
          />
          <span className="font-display text-xl font-bold uppercase tracking-wide">
            Tamandaré <span className="text-gold">Club</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={CADASTRO_URL}
          className="hidden shrink-0 rounded-full gold-gradient px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-foreground glow-gold transition-transform hover:scale-105 lg:inline-flex"
        >
          Reservar mesa
        </a>

        <button
          type="button"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 container-padding py-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-card hover:text-gold"
              >
                {item.label}
              </a>
            ))}
            <a
              href={CADASTRO_URL}
              onClick={() => setMobileOpen(false)}
              className="mt-3 inline-flex justify-center rounded-full gold-gradient px-5 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-gold-foreground"
            >
              Reservar mesa
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[78svh] items-center justify-center overflow-hidden pt-20 pb-12 md:min-h-[100svh] md:pt-24 md:pb-16"
    >
      <img
        src={heroImg}
        alt="Área da piscina com recepção e bar ao fundo no Tamandaré Club"
        className="absolute inset-0 h-full w-full object-cover"
        width={1792}
        height={1024}
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/65 to-night" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-5">
        <div className="inline-flex items-center gap-3 rounded-full border border-gold/50 bg-night/60 py-1.5 pl-1.5 pr-5 glow-gold backdrop-blur">
          <span className="rounded-full gold-gradient px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-gold-foreground">
            Inauguração
          </span>
          <span className="font-display text-lg font-bold text-cream sm:text-2xl">01/11</span>
        </div>

        <h1 className="mt-5 font-display font-bold uppercase leading-[0.94] text-cream sm:mt-8 sm:leading-[0.9]">
          <span className="block text-[clamp(2.25rem,10vw,3.5rem)] sm:text-7xl md:text-8xl lg:text-9xl">
            Tamandaré Club
          </span>
          <span className="mt-3 block text-base tracking-[0.12em] gold-text sm:mt-4 sm:text-3xl sm:tracking-[0.15em] md:text-4xl">
            — Shows e Eventos —
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-cream/90 sm:mt-8 sm:text-lg md:text-xl">
          Pagode ao vivo, área com piscina, drinks e cocktails, caldinhos,
          feijoada e promoções de inauguração.
        </p>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
          <a
            href={CADASTRO_URL}
            className="inline-flex items-center justify-center gap-2 rounded-full gold-gradient px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-gold-foreground glow-gold transition-transform hover:scale-105 sm:px-8 sm:py-4 sm:text-sm sm:tracking-[0.12em]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Reservar mesa
          </a>
          <a
            href="#programacao"
            className="inline-flex items-center justify-center rounded-full border border-cream/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-cream transition-colors hover:border-gold hover:text-gold sm:px-8 sm:py-4 sm:text-sm sm:tracking-[0.12em]"
          >
            Ver programação
          </a>
          <a
            href="/reservas/reveillon"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 bg-night/60 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:bg-gold/10 sm:px-8 sm:py-4 sm:text-sm"
          >
            <Ticket className="h-5 w-5" aria-hidden="true" />
            Réveillon 2027
          </a>
        </div>
      </div>

      <a
        href="#atracoes"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-cream/70"
        aria-label="Rolar para baixo"
      >
        <ChevronDown className="h-6 w-6" />
      </a>
    </section>
  );
}

function ReveillonDestaque() {
  return (
    <section id="reveillon" aria-labelledby="reveillon-destaque-title" className="scroll-mt-24 bg-background py-10 md:py-16">
      <div className="mx-auto max-w-7xl container-padding">
        <div className="overflow-hidden rounded-2xl border border-gold/40 bg-card md:grid md:grid-cols-2">
          <img
            src="/club/reveillon-2027-hero.webp"
            alt="Imagem ilustrativa de fogos dourados e coqueiros em uma noite de Réveillon."
            className="h-56 w-full object-cover sm:h-72 md:h-full"
            loading="lazy"
            width={1536}
            height={1024}
          />
          <div className="p-6 sm:p-8 md:p-10">
            <SectionLabel>Réveillon no Tamandaré Club</SectionLabel>
            <h2 id="reveillon-destaque-title" className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-5xl">
              Três dias.<br /><span className="gold-text">Um novo ano.</span>
            </h2>
            <p className="mt-4 text-sm font-semibold text-gold">30 e 31 de dezembro de 2026 · 1º de janeiro de 2027</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Open bar com ingressos individuais por dia. Confira os três dias de evento e a tabela de lotes, a partir de R$ 600 por pessoa, por dia.
            </p>
            <div className="mt-5 rounded-xl border border-gold/20 bg-background/60 p-4">
              <p className="text-sm font-semibold text-foreground">Reservas abertas · Vendas online em breve</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Por enquanto, o site recebe pedidos de reserva. O pagamento online e a emissão de ingressos ainda não estão disponíveis. A equipe confirma as condições e a disponibilidade pelo WhatsApp.
              </p>
            </div>
            <a href="/reservas/reveillon" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full gold-gradient px-6 py-3.5 text-center text-sm font-bold text-gold-foreground sm:w-auto">
              <Ticket className="h-5 w-5" aria-hidden="true" />
              Ver dias, lotes e solicitar reserva
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const attractionSlides: AttractionSlide[] = [
  {
    image: "/club/pagode-da-rua-27.png",
    alt: "Logo da banda Pagode da Rua 27",
    title: "Pagode da Rua 27",
    text: "Atração ao vivo na inauguração do Tamandaré Club, dia 1º de novembro.",
  },
  {
    image: areaExternaImg,
    alt: "Área externa coberta com mesas e luzes no Tamandaré Club",
    title: "Pagode ao vivo",
    text: "Roda de samba e pagode para cantar junto do começo ao fim.",
  },
  {
    image: piscinaLoungeImg,
    alt: "Piscina e lounge com sofás claros e iluminação suave",
    title: "Área com piscina",
    text: "Curta o som à beira da piscina, com lounge e muito conforto.",
  },
  {
    image: barImg,
    alt: "Bar montado junto à piscina com mesas altas",
    title: "Drinks e Cocktails",
    text: "Bar completo com drinks clássicos e cocktails para brindar a noite.",
  },
  {
    image: espacoImg,
    alt: "Salão do Tamandaré Club com mesas montadas",
    title: "Caldinhos e Feijoada",
    text: "Sabores de casa para acompanhar o show: caldinhos e feijoada.",
  },
  {
    image: heroImg,
    alt: "Área da piscina com recepção e bar ao fundo",
    title: "Promoções de inauguração",
    text: "Condições especiais para comemorar a abertura com a gente.",
  },
];

const ritmos = [
  {
    icon: Music,
    title: "Forró",
    text: "Arrasta o pé e aproveita o clima nordestino.",
    image: "/ritmos/forro.png",
  },
  {
    icon: Music,
    title: "Brega",
    text: "Romance, nostalgia e música para cantar junto.",
    image: "/ritmos/brega.png",
  },
  {
    icon: Mic2,
    title: "Karaokê",
    text: "Escolha sua música e solte a voz com os amigos.",
    image: "/ritmos/karaoke.png",
  },
  {
    icon: Speaker,
    title: "Eletrônica",
    text: "Batidas e energia para curtir até o fim.",
    image: "/ritmos/eletronica.png",
  },
];

function Atracoes() {
  const [activeRhythm, setActiveRhythm] = useState<string | null>(null);

  return (
    <section id="atracoes" className="scroll-mt-20 section-padding bg-background">
      <div className="mx-auto max-w-7xl container-padding">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel>Atrações</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
              A noite é <span className="gold-text">nossa</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Música ao vivo, piscina, bar e boa comida em um só lugar, no coração
            de Tamandaré.
          </p>
        </div>
        <AttractionsCarousel slides={attractionSlides} />

        <div className="mt-14">
          <div className="mb-6 flex items-center gap-3">
            <Music className="h-5 w-5 text-gold" aria-hidden="true" />
            <h3 className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
              Ritmos da <span className="gold-text">casa</span>
            </h3>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {ritmos.map(({ icon: Icon, ...ritmo }) => (
              <button
                key={ritmo.title}
                type="button"
                aria-pressed={activeRhythm === ritmo.title}
                aria-label={`${ritmo.title}. Toque para animar a imagem.`}
                onClick={() => setActiveRhythm(activeRhythm === ritmo.title ? null : ritmo.title)}
                className={`rhythm-card group relative overflow-hidden rounded-3xl border border-gold/30 bg-night text-left ${activeRhythm === ritmo.title ? "is-active" : ""}`}
              >
                <div className="relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden p-6 sm:p-8">
                  <img className="rhythm-card-image" src={ritmo.image} alt="" aria-hidden="true" loading="lazy" />
                  <div className="rhythm-card-shade" />
                  <span className="rhythm-image-label">Imagem ilustrativa</span>
                  <Icon className="relative z-10 h-12 w-12 text-gold transition-transform duration-500 group-hover:scale-110 sm:h-14 sm:w-14" aria-hidden="true" />
                  <div className="relative z-10">
                    <h4 className="font-display text-3xl font-bold uppercase leading-none text-cream sm:text-4xl">
                      {ritmo.title}
                    </h4>
                    <p className="mt-3 max-w-md text-sm text-cream/75 sm:text-base">
                      {ritmo.text}
                    </p>
                    <span className="rhythm-tap-hint">Toque para dar movimento <span aria-hidden="true">↗</span></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Programacao() {
  return (
    <section
      id="programacao"
      className="scroll-mt-20 section-padding night-gradient"
    >
      <div className="mx-auto max-w-6xl container-padding">
        <div className="text-center">
          <SectionLabel>Programação</SectionLabel>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
            Agenda de shows
          </h2>
        </div>

        {/* Ticket */}
        <article className="relative mt-12 overflow-hidden rounded-3xl border border-gold/40 bg-card glow-gold md:grid md:grid-cols-[220px_1fr_220px]">
          <div className="flex flex-col items-center justify-center gold-gradient px-6 py-8 text-gold-foreground">
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Novembro</span>
            <span className="font-display text-7xl font-bold leading-none">01</span>
            <span className="mt-1 text-xs font-bold uppercase tracking-[0.3em]">
              01/11
            </span>
          </div>

          <div className="relative border-dashed border-gold/40 px-6 py-8 md:border-r md:px-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <PartyPopper className="h-3.5 w-3.5" /> Grande inauguração
            </span>
            <h3 className="mt-4 font-display text-3xl font-bold uppercase leading-tight md:text-5xl">
              Inauguração Tamandaré Club
            </h3>
            <ul className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {inauguracaoItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.08em]"
                >
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 border-t border-dashed border-gold/40 px-6 py-8 text-center md:border-t-0">
            <Ticket className="h-8 w-8 text-gold" />
            <p className="text-sm text-muted-foreground">Garanta seu lugar</p>
            <a
              href={CADASTRO_URL}
              className="inline-flex w-full items-center justify-center rounded-full gold-gradient px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gold-foreground transition-transform hover:scale-105"
            >
              Reservar mesa
            </a>
          </div>

          {/* ticket notches */}
          <span className="pointer-events-none absolute -top-4 left-[220px] hidden h-8 w-8 -translate-x-1/2 rounded-full bg-background md:block" />
          <span className="pointer-events-none absolute -bottom-4 left-[220px] hidden h-8 w-8 -translate-x-1/2 rounded-full bg-background md:block" />
          <span className="pointer-events-none absolute -top-4 right-[220px] hidden h-8 w-8 translate-x-1/2 rounded-full bg-background md:block" />
          <span className="pointer-events-none absolute -bottom-4 right-[220px] hidden h-8 w-8 translate-x-1/2 rounded-full bg-background md:block" />
        </article>

        <h3 className="mt-16 text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Próximos eventos
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-5"
            >
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border text-muted-foreground">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-bold uppercase">
                  Em breve
                </p>
                <p className="text-sm text-muted-foreground">
                  Mais atrações a caminho
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Em breve mais atrações. Acompanhe e fale com a gente no WhatsApp.
        </p>
      </div>
    </section>
  );
}

function Reservas() {
  return (
    <section id="reservas" className="scroll-mt-20 section-padding bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 container-padding lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <SectionLabel>Reservas</SectionLabel>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
            Cadastre-se para reservar sua <span className="gold-text">mesa</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Faça seu cadastro para receber informações sobre reservas, eventos e novidades do Club. Depois, fale com a equipe para consultar disponibilidade.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
            <span>
              Atendimento pelo WhatsApp{" "}
              <strong className="text-foreground">{WHATSAPP_DISPLAY}</strong>
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-gold/30 bg-card p-8 text-center glow-gold sm:p-10">
          <ClipboardList className="mx-auto h-10 w-10 text-gold" />
          <h3 className="mt-5 font-display text-2xl font-bold uppercase">Comece pelo cadastro</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Preencha seus dados uma vez para receber informações e falar com a equipe sobre reservas, eventos e promoções.</p>
          <a href={CADASTRO_URL} className="mt-7 inline-flex items-center justify-center rounded-full gold-gradient px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-gold-foreground">Ir para cadastro</a>
        </div>
      </div>
    </section>
  );
}

const cardapio = [
  {
    title: "Bar de drinks",
    text: "Clássicos e cocktails preparados no nosso bar.",
    image: "/espaco/bar-layout-tamandare.png",
    alt: "Imagem criada para o bar do Tamandaré Club",
    note: "Proposta visual do bar",
  },
  {
    title: "Petiscos",
    text: "Petiscos, caldinhos e feijoada para dividir com a turma.",
    image: "/club/petiscos-ilustrativo.png",
    alt: "Petiscos e caldinho servidos para compartilhar",
  },
  {
    title: "Música e bandas",
    text: "Forró, brega, pagode e outras atrações para animar a noite.",
    image: "/club/hero-night.png",
    alt: "Banda tocando em uma noite de música ao vivo",
  },
  {
    title: "Ambiente com piscina",
    text: "Curta a música e os bons momentos perto da piscina.",
    image: "/espaco/almeida-lounge-piscina.jpeg",
    alt: "Piscina e lounge do espaço Tamandaré Club",
    note: "Tamandaré Club",
  },
];

function Cardapio() {
  return (
    <section id="cardapio" className="scroll-mt-20 section-padding bg-secondary">
      <div className="mx-auto max-w-7xl container-padding">
        <div className="text-center">
          <SectionLabel>Cardápio & Bar</SectionLabel>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
            Para beber e petiscar
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cardapio.map((item) => (
            <article
              key={item.title}
              className="experience-card group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-gold/60 hover:glow-gold"
            >
              <img src={item.image} alt={item.alt} className="experience-card-image" loading="lazy" />
              <div className="experience-card-shade" />
              {item.note && <span className="experience-card-note">{item.note}</span>}
              <div className="experience-card-copy">
                <h3 className="font-display text-2xl font-bold uppercase">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/85">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const galleryAreas = [
  {
    src: piscinaLoungeImg,
    alt: "Piscina e lounge com sofás claros e iluminação suave",
    title: "Piscina & Lounge",
  },
  {
    src: areaExternaImg,
    alt: "Área externa coberta com mesas decoradas e luzes",
    title: "Área Externa",
  },
  {
    src: espacoImg,
    alt: "Salão do Tamandaré Club com mesas montadas",
    title: "Salão",
  },
  {
    src: barImg,
    alt: "Bar montado junto à piscina com mesas altas",
    title: "Bar",
  },
];

function Gallery() {
  return (
    <section id="galeria" className="scroll-mt-20 section-padding bg-background">
      <div className="mx-auto max-w-7xl container-padding">
        <div className="text-center">
          <SectionLabel>Galeria</SectionLabel>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
            Conheça o espaço
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {galleryAreas.map((area) => (
            <div
              key={area.title}
              className="group relative overflow-hidden rounded-2xl border border-border"
            >
              <img
                src={area.src}
                alt={area.alt}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                width={1024}
                height={768}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent to-transparent" />
              <h3 className="absolute bottom-0 left-0 p-6 font-display text-2xl font-bold uppercase text-cream">
                {area.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const vendorCategories = [
  { icon: Flower2, label: "Decoração & Flores" },
  { icon: UtensilsCrossed, label: "Buffet & Gastronomia" },
  { icon: CakeSlice, label: "Bolo & Doces" },
  { icon: ClipboardList, label: "Cerimonial & Assessoria" },
  { icon: Martini, label: "Barman & Bar" },
  { icon: Coffee, label: "Café" },
  { icon: Speaker, label: "Estrutura de Palco & Som" },
  { icon: Camera, label: "Fotografia & Filmagem" },
  { icon: Music, label: "Música & Entretenimento" },
  { icon: Shirt, label: "Vestidos & Trajes" },
  { icon: Sparkles, label: "Beleza & Estética" },
  { icon: Mail, label: "Convites & Papelaria" },
];

function Casamentos() {
  return (
    <section id="casamentos" className="theme-light scroll-mt-20 section-padding">
      <div className="mx-auto grid max-w-7xl items-center gap-12 container-padding lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border">
          <img
            src={espacoImg}
            alt="Salão do Tamandaré Club preparado para eventos"
            className="aspect-[4/3] h-full w-full object-cover"
            width={1280}
            height={1024}
            loading="lazy"
          />
        </div>
        <div>
          <SectionLabel>Casamentos e Eventos</SectionLabel>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Seu evento no Tamandaré Club
          </h2>
          <p className="mt-4 text-muted-foreground">
            Além dos shows, o espaço recebe casamentos, aniversários e eventos
            privados, com áreas internas e externas e estrutura completa.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-2xl font-semibold">
                Serviços para seu evento
              </h3>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                Consulte disponibilidade
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Consulte a equipe sobre os serviços e parceiros disponíveis para
              o seu evento. A disponibilidade e contratação são confirmadas no atendimento.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {vendorCategories.map((cat) => (
                <li
                  key={cat.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium"
                >
                  <cat.icon className="h-3.5 w-3.5 text-gold" />
                  {cat.label}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={CADASTRO_URL}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            <ClipboardList className="h-4 w-4" />
            Fazer cadastro para meu evento
          </a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contato" className="scroll-mt-20 section-padding night-gradient">
      <div className="mx-auto max-w-5xl container-padding">
        <div className="text-center">
          <SectionLabel>Contato</SectionLabel>
          <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-none md:text-6xl">
            Vem pro Tamandaré Club
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-3xl border border-border bg-card p-7">
            <div className="inline-flex w-fit rounded-full bg-whatsapp/15 p-3 text-whatsapp">
              <WhatsAppIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold uppercase">WhatsApp</h3>
            <p className="mt-1 text-lg">{WHATSAPP_DISPLAY}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Reservas, informações e eventos privados.
            </p>
            <a
              href={CADASTRO_URL}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-whatsapp-foreground transition-transform hover:scale-[1.02]"
            >
              <ClipboardList className="h-5 w-5" />
              Fazer cadastro
            </a>
          </div>

          <div className="flex flex-col rounded-3xl border border-border bg-card p-7">
            <div className="inline-flex w-fit rounded-full bg-gold/15 p-3 text-gold">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold uppercase">Endereço</h3>
            <p className="mt-1 text-lg leading-snug">{ADDRESS}</p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-full gold-gradient px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-gold-foreground transition-transform hover:scale-[1.02] max-md:mt-6"
            >
              <Navigation className="h-4 w-4" />
              Como chegar
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-gold" /> Música ao vivo
          </span>
          <span className="inline-flex items-center gap-2">
            <Waves className="h-4 w-4 text-gold" /> Área com piscina
          </span>
          <span className="inline-flex items-center gap-2">
            <Martini className="h-4 w-4 text-gold" /> Drinks e cocktails
          </span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background pb-28 pt-10 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 container-padding md:flex-row">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Logo Tamandaré Club"
            className="h-28 w-28 rounded-xl object-contain md:h-32 md:w-32"
            width={128}
            height={128}
            loading="lazy"
          />
          <span className="font-display text-lg font-bold uppercase">
            Tamandaré <span className="text-gold">Club</span>
          </span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tamandaré Club · Shows e Eventos · Tamandaré – PE
        </p>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={CADASTRO_URL}
      aria-label="Fazer cadastro no Tamandaré Club"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full gold-gradient text-gold-foreground shadow-lg ring-4 ring-gold/25 transition-transform hover:scale-110 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <ClipboardList className="h-7 w-7 sm:h-8 sm:w-8" />
    </a>
  );
}

