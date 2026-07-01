import type { CheckResult } from '@safe-link-checker/types';

export class SQLiteCache {
  constructor(private db: any, private tableName = 'slc_cache') {
    this.init();
  }

  private init() {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        key TEXT PRIMARY KEY,
        data TEXT,
        expiresAt INTEGER
      )
    `);
  }

  async get(key: string): Promise<CheckResult | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare(`SELECT data, expiresAt FROM ${this.tableName} WHERE key = ?`);
    const row = stmt.get(key);
    if (!row) return null;
    if (Date.now() > row.expiresAt) {
      this.db.prepare(`DELETE FROM ${this.tableName} WHERE key = ?`).run(key);
      return null;
    }
    try {
      return JSON.parse(row.data);
    } catch {
      return null;
    }
  }

  async set(key: string, result: CheckResult, ttlSeconds = 3600): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO ${this.tableName} (key, data, expiresAt)
      VALUES (?, ?, ?)
    `);
    stmt.run(key, JSON.stringify(result), Date.now() + ttlSeconds * 1000);
  }
}
