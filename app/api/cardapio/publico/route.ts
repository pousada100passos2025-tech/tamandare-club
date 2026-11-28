import { NextResponse } from "next/server";
import { database } from "@/db/repository";
import { effectivePriceReais } from "@/lib/night-pricing";

/** Catálogo público, preços derivados no servidor. Preço-base permanece intacto. */
type Row = {
  id: string; name: string; category: string; description: string | null;
  regular_price: number; promo_price: number | null;
};
export async function GET() {
  const result = await database().prepare(
    "SELECT id, name, category, description, regular_price, promo_price FROM club_menu_items WHERE active = 1 ORDER BY category, name"
  ).all<Row>();
  const at = new Date();
  return NextResponse.json({
    items: (result.results ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      price: effectivePriceReais(row.promo_price ?? row.regular_price, at),
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
