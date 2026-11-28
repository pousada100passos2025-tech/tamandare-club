import assert from "node:assert/strict";
import test from "node:test";
import { effectivePriceCents, effectivePriceReais, isNightPriceActive } from "../lib/night-pricing.ts";

function recifeTime(day, time) {
  return new Date(`${day}T${time}-03:00`);
}

test("23h29 usa preço normal; 23h30 ativa 20%", () => {
  assert.equal(isNightPriceActive(recifeTime("2026-11-28", "23:29:00")), false);
  assert.equal(isNightPriceActive(recifeTime("2026-11-28", "23:30:00")), true);
});
test("05h59 aplica 20% e 06h00 retorna ao normal", () => {
  assert.equal(isNightPriceActive(recifeTime("2026-11-29", "05:59:00")), true);
  assert.equal(isNightPriceActive(recifeTime("2026-11-29", "06:00:00")), false);
});
test("não acumula porcentagens e mantém preço base", () => {
  const base = 1500;
  assert.equal(effectivePriceCents(base, recifeTime("2026-11-28", "23:30:00")), 1800);
  assert.equal(effectivePriceCents(base, recifeTime("2026-11-29", "06:00:00")), 1500);
  assert.equal(base, 1500);
});
test("arredonda valores monetários nos centavos", () => {
  assert.equal(effectivePriceCents(999, recifeTime("2026-11-28", "23:30:00")), 1199);
  assert.equal(effectivePriceReais(20, recifeTime("2026-11-28", "23:30:00")), 24);
});
