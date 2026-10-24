"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type AttractionSlide = {
  image: string;
  alt: string;
  title: string;
  text: string;
};

export function AttractionsCarousel({ slides }: { slides: AttractionSlide[] }) {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const move = (step: number) => setActive((index) => (index + step + slides.length) % slides.length);

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-gold/30 bg-night">
      <div className="relative min-h-[360px] md:min-h-[480px]">
        <img src={slide.image} alt={slide.alt} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/95 via-night/65 to-night/10" />
        <div className="flex min-h-[360px] max-w-2xl flex-col justify-center p-8 md:min-h-[480px] md:p-14">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Tamandaré Club · Tamandaré, PE</span>
          <h3 className="mt-5 font-display text-4xl font-bold uppercase leading-none text-cream md:text-6xl">{slide.title}</h3>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/80">{slide.text}</p>
          <div className="mt-8 flex items-center gap-3">
            <span className="text-xs font-semibold tracking-widest text-cream/80">{String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
            <div className="flex gap-1.5">{slides.map((item, index) => <button key={item.title} type="button" aria-label={`Mostrar atração ${index + 1}: ${item.title}`} aria-current={active === index} onClick={() => setActive(index)} className={active === index ? "h-1 w-8 rounded-full bg-gold" : "h-1 w-3 rounded-full bg-cream/40"} />)}</div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 flex gap-2 md:bottom-10 md:right-10">
          <button type="button" aria-label="Atração anterior" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-cream/60 bg-night/50 text-cream backdrop-blur hover:border-gold hover:text-gold"><ArrowLeft size={18} /></button>
          <button type="button" aria-label="Próxima atração" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-full border border-cream/60 bg-night/50 text-cream backdrop-blur hover:border-gold hover:text-gold"><ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}

