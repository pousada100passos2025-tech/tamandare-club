// Centralized price policy for Tamandare Club. Does not mutate catalog prices.
export const NIGHT_PRICE_POLICY = Object.freeze({
  timezone: "America/Recife",
  startHour: 0,
  endHour: 6,
  surchargePercent: 20,
});

export function isNightPricingTime(at = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: NIGHT_PRICE_POLICY.timezone,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(at));
  return hour >= NIGHT_PRICE_POLICY.startHour && hour < NIGHT_PRICE_POLICY.endHour;
}

export function calculateMenuPrice(basePrice, at = new Date()) {
  if (!Number.isFinite(basePrice) || basePrice < 0) throw new RangeError("Invalid price");
  const cents = Math.round((basePrice + Number.EPSILON) * 100);
  const adjustedCents = isNightPricingTime(at)
    ? Math.round(cents * (100 + NIGHT_PRICE_POLICY.surchargePercent) / 100)
    : cents;
  return adjustedCents / 100;
}
