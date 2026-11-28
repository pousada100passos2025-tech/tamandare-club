/** Precificação noturna do Tamandaré Club, no fuso de Pernambuco.
 * O preço-base NÃO é alterado. Use esta função tanto na vitrine quanto na
 * criação/validação de pedidos no servidor, evitando divergências de cobrança.
 */
export const NIGHT_PRICE_TIME_ZONE = "America/Recife";
export const NIGHT_PRICE_INCREASE_PERCENT = 20;

export function isNightPriceActive(at: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: NIGHT_PRICE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    throw new Error("Não foi possível determinar o horário da precificação.");
  }
  const minutes = hour * 60 + minute;
  return minutes >= 23 * 60 + 30 || minutes < 6 * 60;
}

export function effectivePriceCents(basePriceCents: number, at: Date = new Date()): number {
  if (!Number.isSafeInteger(basePriceCents) || basePriceCents < 0) {
    throw new Error("Preço-base em centavos inválido.");
  }
  return isNightPriceActive(at)
    ? Math.round(basePriceCents * 120 / 100)
    : basePriceCents;
}

export function effectivePriceReais(basePriceReais: number, at: Date = new Date()): number {
  if (!Number.isFinite(basePriceReais) || basePriceReais < 0) {
    throw new Error("Preço-base inválido.");
  }
  const cents = Math.round(basePriceReais * 100);
  return effectivePriceCents(cents, at) / 100;
}
