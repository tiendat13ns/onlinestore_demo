import pg from 'pg';

// Hàng trả về từ Postgres; cột jsonb đã được driver parse thành object.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export interface Queryable {
  query<T = Row>(sql: string, params?: unknown[]): Promise<T[]>;
}

export interface Db extends Queryable {
  /** Chạy fn trong một transaction; lỗi thì rollback. */
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
}

let current: Db | null = null;

/** Dùng cho kiểm thử: thay DB thật bằng DB trong bộ nhớ. */
export function setDb(db: Db): void {
  current = db;
}

function createPgDb(url: string): Db {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  // Serverless: mỗi instance chỉ giữ 1 kết nối, đi qua pooler của Supabase (cổng 6543).
  const pool = new pg.Pool({
    connectionString: url,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    ssl: local ? false : { rejectUnauthorized: false },
  });

  return {
    async query<T>(sql: string, params: unknown[] = []) {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    },
    async transaction<T>(fn: (tx: Queryable) => Promise<T>) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn({
          async query<R>(sql: string, params: unknown[] = []) {
            return (await client.query(sql, params)).rows as R[];
          },
        });
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw err;
      } finally {
        client.release();
      }
    },
  };
}

export function getDb(): Db {
  if (current) return current;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL chưa được đặt.');
  current = createPgDb(url);
  return current;
}
