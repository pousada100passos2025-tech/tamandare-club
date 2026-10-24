"use client";

import { useMemo, useState } from "react";
import { Camera, GlassWater, Music2, Waves } from "lucide-react";

type Slide = { image?: string; alt?: string; title: string; caption: string; illustrated?: boolean; sourceNote?: string };
type Album = { id: string; label: string; icon: typeof Camera; slides: Slide[]; emptyTitle?: string; emptyCopy?: string };

const albums: Album[] = [
  {
    id: "shows", label: "Atrações", icon: Music2,
    slides: [
      { image: "/club/pagode-da-rua-27.png", alt: "Identidade da banda Pagode da Rua 27", title: "Pagode da Rua 27", caption: "Atração ao vivo na inauguração do Tamandaré Club, dia 1º de novembro." },
      { image: "/club/hero-night.png", alt: "Imagem de divulgação de uma noite de música e festa", title: "Música, festa e encontros", caption: "Consulte a programação atualizada do Tamandaré Club.", illustrated: true },
      { image: "/espaco/almeida-area-externa.jpeg", alt: "Área externa do espaço Tamandaré Club", title: "Um espaço para curtir", caption: "Encontre os amigos e aproveite a noite." },
      { image: "/espaco/piscina-noite-cascata.webp", alt: "Piscina iluminada do Tamandaré Club à noite, com cascata e cactos", title: "Noite à beira da piscina", caption: "Música e ambiente para curtir junto." },
    ],
  },
  {
    id: "piscina", label: "Piscina", icon: Waves,
    slides: [
      { image: "/espaco/piscina.jpeg", alt: "Piscina do espaço Tamandaré Club", title: "Piscina", caption: "Um espaço para curtir e se encontrar." },
      { image: "/espaco/almeida-lounge-piscina.jpeg", alt: "Lounge junto à piscina", title: "Lounge da piscina", caption: "Mais um cantinho para aproveitar a casa." },
      { image: "/espaco/almeida-area-externa.jpeg", alt: "Área externa do espaço", title: "Área externa", caption: "Ambientes que fazem parte da experiência." },
    ],
  },
  {
    id: "bar", label: "Bar", icon: GlassWater,
    slides: [
      { image: "/espaco/bar.jpeg", alt: "Balcão do bar do Tamandaré Club", title: "O bar do Club", caption: "Drinks e bons brindes para acompanhar a noite." },
      { image: "/espaco/conceito-bar.png", alt: "Projeto visual do bar", title: "Bar e encontros", caption: "Um espaço pensado para aproveitar cada momento." },
      { image: "/espaco/bar-layout-tamandare.png", alt: "Proposta visual de ambientação do bar do Tamandaré Club", title: "Proposta visual para o bar", caption: "Referência de ambientação criada para o espaço.", illustrated: true, sourceNote: "Conceito visual · imagem ilustrativa" },
    ],
  },
  {
    id: "drinks", label: "Cardápio de drinks", icon: GlassWater,
    slides: [
      { image: "/drinks/drink-01.jpg", alt: "Coquetel do cardápio do Tamandaré Club", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
      { image: "/drinks/drink-02.jpg", alt: "Moscow Mule do cardápio do Tamandaré Club", title: "Moscow Mule", caption: "Um dos coquetéis do cardápio do Club." },
      { image: "/drinks/drink-03.jpg", alt: "Coquetel do cardápio do Tamandaré Club", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
      { image: "/drinks/drink-04.jpg", alt: "Coquetel do cardápio do Tamandaré Club", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
      { image: "/drinks/drink-05.jpg", alt: "Coquetel do cardápio do Tamandaré Club", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
      { image: "/drinks/drink-06.jpg", alt: "Coquetel do cardápio do Tamandaré Club", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
      { image: "/drinks/drink-07.jpg", alt: "Coquetel do cardápio do Tamandaré Club", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
      { image: "/drinks/drink-08.jpg", alt: "Drink Serrado do cardápio do Tamandaré Club", title: "Serrado", caption: "Um dos coquetéis do cardápio do Club." },
      { image: "/drinks/drink-09.jpg", alt: "Coquetel servido em caneca de cobre", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
      { image: "/drinks/drink-10.jpg", alt: "Coquetel do cardápio do Tamandaré Club", title: "Drinks da casa", caption: "Uma seleção de coquetéis para curtir no Club." },
    ],
  },
];

export function PhotoGallery() {
  const [albumId, setAlbumId] = useState(albums[0].id);
  const album = useMemo(() => albums.find((item) => item.id === albumId) ?? albums[0], [albumId]);

  function chooseAlbum(id: string) {
    setAlbumId(id);
  }

  return (
    <section className="photo-gallery section-wrap" id="espacos" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <div>
          <div className="intro-kicker"><span className="section-number">02</span><span>UM POUCO DA EXPERIÊNCIA</span></div>
          <h2 id="gallery-title">Veja o que te espera<br /><em>no Tamandaré Club.</em></h2>
        </div>
        <p>Shows, piscina, bar e os detalhes de uma noite para curtir junto.</p>
      </div>

      <div className="gallery-tabs" role="tablist" aria-label="Álbuns de fotos">
        {albums.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} id={`gallery-tab-${item.id}`} type="button" role="tab" aria-controls="gallery-panel" aria-selected={album.id === item.id} tabIndex={album.id === item.id ? 0 : -1} className={album.id === item.id ? "gallery-tab is-active" : "gallery-tab"} onClick={() => chooseAlbum(item.id)}><Icon size={15} />{item.label}</button>;
        })}
      </div>

      <div id="gallery-panel" role="tabpanel" aria-labelledby={`gallery-tab-${album.id}`} className={`gallery-grid gallery-grid-${album.id}`}>
        {album.slides.map((photo, index) => (
          <article key={photo.image ?? photo.title} className={`gallery-card${index === 0 && album.slides.length > 3 ? " gallery-card-featured" : ""}`}>
            {photo.image ? <img className="gallery-card-image" src={photo.image} alt={photo.alt ?? photo.title} loading="lazy" /> : <div className="gallery-card-placeholder"><GlassWater size={28} /></div>}
            <div className="gallery-card-shade" />
            <div className="gallery-card-copy">
              <span className="gallery-photo-label"><Camera size={13} /> {photo.sourceNote ? photo.sourceNote : photo.illustrated ? "Imagem ilustrativa" : album.label}</span>
              <h3>{photo.title}</h3>
              <p>{photo.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
