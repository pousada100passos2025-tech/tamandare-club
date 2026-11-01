import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("removal rule is limited to the 600 ml brands", () => {
  const content = readFileSync("lib/club-menu-availability.ts", "utf8");
  assert.match(content, /brahma\|itaipava\|amstel/);
  assert.match(content, /600/);
  assert.match(content, /!unavailableClubMenuProduct/);
});
