import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { catalog as seed } from '../src/data/catalog';

const DB_PATH = process.env.DB_PATH ?? 'data/store.db';
const SEED_STOCK = 20;

mkdirSync(dirname(DB_PATH), { recursive: true });
export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    kind TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    usage TEXT,
    includes TEXT,
    images TEXT NOT NULL,
    attribute_names TEXT NOT NULL,
    related_ids TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    attributes TEXT NOT NULL,
    price INTEGER CHECK (price IS NULL OR price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    specs TEXT NOT NULL,
    components TEXT,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    code TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    currency TEXT NOT NULL,
    subtotal INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT NOT NULL REFERENCES orders(code),
    variant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    line_total INTEGER NOT NULL,
    components TEXT NOT NULL
  );
`);

/** Nạp fixture lần đầu. Chạy lại không ghi đè dữ liệu đã chỉnh trong admin. */
function seedIfEmpty(): void {
  const count = db.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number };
  if (count.n > 0) return;

  const insertProduct = db.prepare(
    `INSERT INTO products (id, slug, name, category, kind, short_description, description, usage, includes, images, attribute_names, related_ids, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertVariant = db.prepare(
    `INSERT INTO variants (id, product_id, attributes, price, stock, specs, components, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  db.exec('BEGIN');
  try {
    if (seed.currency) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('currency', seed.currency);
    }
    seed.products.forEach((p, i) => {
      insertProduct.run(
        p.id, p.slug, p.name, p.category, p.kind, p.shortDescription, p.description, p.usage,
        p.includes ? JSON.stringify(p.includes) : null,
        JSON.stringify(p.images), JSON.stringify(p.attributeNames), JSON.stringify(p.relatedIds), i,
      );
      p.variants.forEach((v, j) => {
        insertVariant.run(
          v.id, p.id, JSON.stringify(v.attributes), v.price, SEED_STOCK, JSON.stringify(v.specs),
          v.components ? JSON.stringify(v.components) : null, j,
        );
      });
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

seedIfEmpty();

export function all<T>(sql: string, ...params: (string | number | null)[]): T[] {
  return db.prepare(sql).all(...params) as unknown as T[];
}

export function get<T>(sql: string, ...params: (string | number | null)[]): T | undefined {
  return db.prepare(sql).get(...params) as unknown as T | undefined;
}

export function run(sql: string, ...params: (string | number | null)[]) {
  return db.prepare(sql).run(...params);
}

export function getCurrency(): string | null {
  return get<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'currency')?.value ?? null;
}

/** Chạy fn trong transaction; lỗi → rollback. */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
