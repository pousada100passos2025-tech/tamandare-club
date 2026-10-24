import { env } from "cloudflare:workers";

export function database() {
  if (!env.DB) throw new Error("Banco de dados indisponível.");
  return env.DB;
}

export function makeCode(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}
