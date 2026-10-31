import { writeFileSync } from 'node:fs';
import { catalog } from '../src/data/catalog';

// Sinh supabase/seed.sql từ src/data/catalog.ts. Chạy: npm run db:seed-sql
const SEED_STOCK = 20;

const str = (v: string) => `'${v.replace(/'/g, "''")}'`;
const nullable = (v: string | null) => (v === null ? 'null' : str(v));
const json = (v: unknown) => `${str(JSON.stringify(v))}::jsonb`;

const out: string[] = [
  '-- Dữ liệu mẫu cho Nook Studio. SINH TỰ ĐỘNG từ src/data/catalog.ts bằng `npm run db:seed-sql`; đừng sửa tay.',
  '-- Chạy SAU schema.sql. Chạy lại không ghi đè giá/tồn kho bạn đã chỉnh trong /admin (on conflict do nothing).',
  '',
];

if (catalog.currency) {
  out.push(`insert into settings (key, value) values ('currency', ${str(catalog.currency)}) on conflict (key) do nothing;`, '');
}

catalog.products.forEach((p, i) => {
  out.push(
    `insert into products (id, slug, name, category, kind, short_description, description, usage, includes, images, attribute_names, related_ids, sort_order)`,
    `values (${[
      str(p.id), str(p.slug), str(p.name), str(p.category), str(p.kind), str(p.shortDescription), str(p.description),
      nullable(p.usage), p.includes ? json(p.includes) : 'null', json(p.images), json(p.attributeNames), json(p.relatedIds), i,
    ].join(', ')})`,
    'on conflict (id) do nothing;',
  );
});
out.push('');

catalog.products.forEach((p) => {
  p.variants.forEach((v, j) => {
    out.push(
      `insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)`,
      `values (${[
        str(v.id), str(p.id), json(v.attributes), v.price === null ? 'null' : v.price, SEED_STOCK, json(v.specs),
        v.components ? json(v.components) : 'null', j,
      ].join(', ')})`,
      'on conflict (id) do nothing;',
    );
  });
});

writeFileSync('supabase/seed.sql', out.join('\n') + '\n');
console.log(`supabase/seed.sql: ${catalog.products.length} sản phẩm, ${catalog.products.reduce((n, p) => n + p.variants.length, 0)} biến thể`);
