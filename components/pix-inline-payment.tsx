"use client";

import { useState } from "react";

export type PixPayment = {
  orderId: string;
  amountCents: number;
  copyPaste: string;
  qrCodeBase64: string;
  status: "pending" | "confirmed" | "expired";
};

export function PixInlinePayment({ payment, onRefresh }: {
  payment: PixPayment;
  onRefresh?: () => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payment.amountCents / 100);
  const code = payment.qrCodeBase64?.trim() || "";
  const imageData = code.startsWith("data:image/png;base64,") ? code : `data:image/png;base64,${code}`;
  const valid = Number.isSafeInteger(payment.amountCents) && payment.amountCents > 0 &&
    !!payment.copyPaste?.trim() && /^(?:data:image\/png;base64,)?[A-Za-z0-9+/=]+$/.test(code);

  async function refresh() {
    if (!onRefresh || checking) return;
    setChecking(true);
    try { await onRefresh(); } finally { setChecking(false); }
  }

  return (
    <section aria-label="Pagamento Pix" className="mx-auto max-w-md rounded-2xl border p-5 text-center">
      <h2 className="text-xl font-semibold">Pague com Pix</h2>
      <p className="mt-2 text-sm">Pedido #{payment.orderId}</p>
      <p className="mt-2 text-2xl font-bold">{amount}</p>
      {payment.status === "confirmed" ? (
        <p role="status" className="mt-4 font-semibold">Pagamento confirmado!</p>
      ) : payment.status === "expired" ? (
        <p role="alert" className="mt-4">Pix expirado. Consulte o atendimento antes de gerar outra cobrança.</p>
      ) : !valid ? (
        <p role="alert" className="mt-4">O Pix ainda não está disponível. Use Recuperar pagamento ou contate o atendimento. Não crie outra cobrança.</p>
      ) : (
        <>
          {/* Asaas returns the QR image as base64. Never generate a static or unverified code. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageData} alt="QR Code Pix do pedido" className="mx-auto my-4 h-56 w-56" />
          <p className="mb-2 text-sm">Escaneie pelo aplicativo do seu banco ou copie o código.</p>
          <button type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(payment.copyPaste); setCopied(true); }
            catch { setCopied(false); }
          }} className="rounded-lg border px-4 py-3">
            {copied ? "Código copiado" : "Copiar código Pix"}
          </button>
          <p role="status" className="mt-3 text-sm">Aguardando confirmação do Asaas.</p>
        </>
      )}
      {onRefresh && payment.status === "pending" && (
        <button type="button" disabled={checking} onClick={refresh} className="mt-4 block w-full rounded-lg border px-4 py-3">
          {checking ? "Consultando..." : "Consultar pagamento"}
        </button>
      )}
    </section>
  );
}
