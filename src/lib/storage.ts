// sessionStorage với fallback bộ nhớ trang khi storage không dùng được.
const memory = new Map<string, string>();
let persistent = true;

export function isPersistent(): boolean {
  return persistent;
}

export function readItem(key: string): string | null {
  if (persistent) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      persistent = false;
    }
  }
  return memory.get(key) ?? null;
}

export function writeItem(key: string, value: string): void {
  if (persistent) {
    try {
      sessionStorage.setItem(key, value);
      return;
    } catch {
      persistent = false;
    }
  }
  memory.set(key, value);
}

export function removeItem(key: string): void {
  memory.delete(key);
  try {
    sessionStorage.removeItem(key);
  } catch {
    persistent = false;
  }
}
