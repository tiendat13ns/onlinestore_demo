-- Schema cho Nook Studio. Chạy một lần trong Supabase: SQL Editor > New query > dán toàn bộ file này > Run.
-- Chạy lại được nhiều lần (create if not exists).

create table if not exists settings (
  key   text primary key,
  value text not null
);

create table if not exists products (
  id                text primary key,
  slug              text not null unique,
  name              text not null,
  category          text not null,
  kind              text not null,
  short_description text not null,
  description       text not null,
  usage             text,
  includes          jsonb,
  images            jsonb not null,
  attribute_names   jsonb not null,
  related_ids       jsonb not null,
  sort_order        integer not null
);

create table if not exists variants (
  id          text primary key,
  product_id  text not null references products (id),
  attributes  jsonb not null,
  price       integer check (price is null or price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  specs       jsonb not null,
  components  jsonb,
  sort_order  integer not null
);

create table if not exists orders (
  code             text primary key,
  created_at       timestamptz not null default now(),
  status           text not null check (status in ('pending', 'confirmed', 'shipping', 'completed', 'cancelled')),
  customer_name    text not null,
  customer_phone   text not null,
  customer_address text not null,
  currency         text not null,
  subtotal         integer not null
);

create table if not exists order_lines (
  id          bigint generated always as identity primary key,
  order_code  text not null references orders (code),
  variant_id  text not null,
  name        text not null,
  quantity    integer not null,
  unit_price  integer not null,
  line_total  integer not null,
  components  jsonb not null
);

create index if not exists order_lines_order_code_idx on order_lines (order_code);
create index if not exists orders_created_at_idx on orders (created_at desc);

-- Bảo mật: bật Row Level Security và KHÔNG tạo policy nào.
-- Khi đó khóa anon/authenticated của Supabase không đọc hay ghi được gì (kể cả tên, SĐT, địa chỉ khách).
-- Chỉ server (Netlify Function) kết nối bằng chuỗi DATABASE_URL mới truy cập được.
alter table settings    enable row level security;
alter table products    enable row level security;
alter table variants    enable row level security;
alter table orders      enable row level security;
alter table order_lines enable row level security;
