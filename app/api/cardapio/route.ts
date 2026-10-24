import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { database } from "@/db/repository";

const ADMIN_EMAIL = "casadosbartenders@gmail.com";
const CATEGORIES = ["Drinks", "Bebidas", "Petiscos", "Caldinhos", "Outros"];

type MenuItemRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  regular_price: number;
  promo_price: number | null;
  active: number;
  created_at: string;
};

async function isAdmin() {
  const requestHeaders = await headers();
  return requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase() === ADMIN_EMAIL;
}

async function ensureTable() {
  await database().prepare(`CREATE TABLE IF NOT EXISTS club_menu_items (
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
}

function parseItem(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim().slice(0, 100);
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim().slice(0, 240);
  const regularPrice = Number(body.regularPrice);
  const promoPrice = body.promoPrice === "" || body.promoPrice === null || body.promoPrice === undefined ? null : Number(body.promoPrice);
  const active = body.active === undefined ? true : body.active === true;

  if (!name || !CATEGORIES.includes(category) || !Number.isFinite(regularPrice) || regularPrice <= 0 || regularPrice > 1000000 || (promoPrice !== null && (!Number.isFinite(promoPrice) || promoPrice <= 0 || promoPrice >= regularPrice))) {
    return null;
  }
  return { name, category, description: description || null, regularPrice: Math.round(regularPrice * 100) / 100, promoPrice: promoPrice === null ? null : Math.round(promoPrice * 100) / 100, active };
}

function toMenuItem(row: MenuItemRow) {
  return { id: row.id, name: row.name, category: row.category, description: row.description, regularPrice: row.regular_price, promoPrice: row.promo_price, active: row.active === 1, createdAt: row.created_at };
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  await ensureTable();
  const result = await database().prepare("SELECT id, name, category, description, regular_price, promo_price, active, created_at FROM club_menu_items ORDER BY active DESC, category, name").all<MenuItemRow>();
  return NextResponse.json({ items: (result.results ?? []).map(toMenuItem) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const item = body ? parseItem(body) : null;
  if (!item) return NextResponse.json({ error: "Confira o nome, a categoria e os preços. O valor promocional precisa ser menor que o normal." }, { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await ensureTable();
  await database().prepare("INSERT INTO club_menu_items (id, name, category, description, regular_price, promo_price, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, item.name, item.category, item.description, item.regularPrice, item.promoPrice, item.active ? 1 : 0, now, now).run();
  return NextResponse.json({ ok: true, item: { id, ...item, createdAt: now } }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id || id.length > 80) return NextResponse.json({ error: "Item inválido." }, { status: 400 });
  await ensureTable();

  if (typeof body?.active === "boolean" && Object.keys(body).length === 2) {
    await database().prepare("UPDATE club_menu_items SET active = ?, updated_at = ? WHERE id = ?").bind(body.active ? 1 : 0, new Date().toISOString(), id).run();
    return NextResponse.json({ ok: true });
  }

  const item = parseItem(body ?? {});
  if (!item) return NextResponse.json({ error: "Confira o nome, a categoria e os preços. O valor promocional precisa ser menor que o normal." }, { status: 400 });
  await database().prepare("UPDATE club_menu_items SET name = ?, category = ?, description = ?, regular_price = ?, promo_price = ?, active = ?, updated_at = ? WHERE id = ?")
    .bind(item.name, item.category, item.description, item.regularPrice, item.promoPrice, item.active ? 1 : 0, new Date().toISOString(), id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Acesso restrito." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id || id.length > 80) return NextResponse.json({ error: "Item inválido." }, { status: 400 });
  await ensureTable();
  await database().prepare("DELETE FROM club_menu_items WHERE id = ?").bind(id).run();
  return NextResponse.json({ ok: true });
}
