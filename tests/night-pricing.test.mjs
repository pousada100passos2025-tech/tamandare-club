import test from "node:test";
import assert from "node:assert/strict";
import { calculateMenuPrice, isNightPricingTime } from "../lib/night-pricing.mjs";

const local = (day, hour, minute = 0) => new Date(`2026-11-${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-03:00`);

test("switches exactly at midnight Recife time", () => {
  assert.equal(isNightPricingTime(local(28, 23, 59)), false);
  assert.equal(isNightPricingTime(local(29, 0)), true);
  assert.equal(isNightPricingTime(local(29, 5, 59)), true);
  assert.equal(isNightPricingTime(local(29, 6)), false);
});
test("applies twenty percent only during night", () => {
  assert.equal(calculateMenuPrice(15, local(29, 1)), 18);
  assert.equal(calculateMenuPrice(19, local(29, 1)), 22.8);
  assert.equal(calculateMenuPrice(15, local(29, 6)), 15);
});
test("rejects invalid prices", () => {
  assert.throws(() => calculateMenuPrice(-1), RangeError);
  assert.throws(() => calculateMenuPrice(NaN), RangeError);
});
