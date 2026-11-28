import { NextResponse } from "next/server";
import { database } from "@/db/repository";
import { unavailableClubMenuProduct } from "@/lib/club-menu-availability";

/**
 * Public, read-only catalog endpoint. Designed for both cardapio and PDV
 * clients to consume from one database once their deployed apps are connected.
 * Administrative mutations remain in the protected /api/cardapio endpoint.
 */
export async function GET() {
  try {
    const db = database();
    await db.prepare(`CREATE TABLE IF NOT EXISTS club_menu_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      regular_price REAL NOT NULL,
      promo_price REAL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`).run();
    const rows = await db.prepare(
      "SELECT id, name, category, description, regular_price, promo_price FROM club_menu_items WHERE active = 1 ORDER BY category, name"
    ).all<{ id: string; name: string; category: string; description: string | null; regular_price: number; promo_price: number | null }>();
    const products = (rows.results ?? [])
      .filter((item) => !unavailableClubMenuProduct(item.name))
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        priceCents: Math.round((item.promo_price ?? item.regular_price) * 100),
        regularPriceCents: Math.round(item.regular_price * 100),
        imageUrl: null,
      }));
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Catálogo indisponível." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
