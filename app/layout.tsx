import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tamandareclub.com.br"),
  title: "Tamandaré Club | Shows e Eventos",
  description: "Casa de shows em Tamandaré, Pernambuco. Forró, brega, pagode, sertanejo, bar de drinks, petiscos e ambiente com piscina.",
  openGraph: {
    title: "Tamandaré Club | Shows e Eventos",
    description: "Forró, brega, pagode, sertanejo, bar de drinks, petiscos e ambiente com piscina em Tamandaré, Pernambuco.",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/club/tamandare-club-profile.png",
        width: 1536,
        height: 1536,
        alt: "Logotipo dourado do Tamandaré Club — Shows e Eventos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamandaré Club | Shows e Eventos",
    description: "Forró, brega, pagode, sertanejo, drinks, petiscos e piscina em Tamandaré, Pernambuco.",
    images: ["/club/tamandare-club-profile.png"],
  },
  icons: {
    icon: "/club/tamandare-club-profile.png",
    shortcut: "/club/tamandare-club-profile.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
