import { writeFileSync } from 'node:fs';
import { catalog } from '../src/data/catalog';

// Sinh supabase/seed.sql từ src/data/catalog.ts. Chạy: npm run db:seed-sql
const SEED_STOCK = 20;

const str = (v: string) => `'${v.replace(/'/g, "''")}'`;
const nullable = (v: string | null) => (v === null ? 'null' : str(v));
const json = (v: unknown) => `${str(JSON.stringify(v))}::jsonb`;

const out: string[] = [
  '-- Dữ liệu mẫu cho Tam Thái Tử Store. SINH TỰ ĐỘNG từ src/data/catalog.ts bằng `npm run db:seed-sql`; đừng sửa tay.',
  '-- Chạy SAU schema.sql. Chạy lại an toàn: cập nhật nội dung sản phẩm (tên, mô tả, ảnh, thông số), thêm biến thể mới, xóa sản phẩm/biến thể đã bỏ khỏi catalog, nhưng KHÔNG ghi đè giá/tồn kho đã chỉnh trong /admin.',
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
    `on conflict (id) do update set slug = excluded.slug, name = excluded.name, category = excluded.category, kind = excluded.kind, short_description = excluded.short_description, description = excluded.description, usage = excluded.usage, includes = excluded.includes, images = excluded.images, attribute_names = excluded.attribute_names, related_ids = excluded.related_ids, sort_order = excluded.sort_order;`,
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
      'on conflict (id) do update set product_id = excluded.product_id, attributes = excluded.attributes, specs = excluded.specs, components = excluded.components, sort_order = excluded.sort_order;',
    );
  });
});
out.push('');

// Sản phẩm/biến thể đã bỏ khỏi catalog thì xóa khỏi DB. Đơn cũ không bị ảnh hưởng: order_lines lưu sẵn tên và giá.
const list = (ids: string[]) => ids.map(str).join(', ');
out.push(
  '-- Xóa sản phẩm và biến thể không còn trong catalog.',
  `delete from variants where id not in (${list(catalog.products.flatMap((p) => p.variants.map((v) => v.id)))});`,
  `delete from products where id not in (${list(catalog.products.map((p) => p.id))});`,
);

writeFileSync('supabase/seed.sql', out.join('\n') + '\n');
console.log(`supabase/seed.sql: ${catalog.products.length} sản phẩm, ${catalog.products.reduce((n, p) => n + p.variants.length, 0)} biến thể`);
