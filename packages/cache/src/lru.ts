/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface CacheOptions {
  maxSize?: number;
  ttlMs?: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttlMs: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.ttlMs = options.ttlMs ?? 1000 * 60 * 60; // Default 1 hour
    this.cache = new Map();
  }

  get(url: string): T | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      return null;
    }

    // Refresh the entry to the end of the Map to maintain LRU order
    this.cache.delete(url);
    this.cache.set(url, entry);

    return entry.value;
  }

  set(url: string, result: T): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(url)) {
      // Evict the first item (oldest accessed)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    // If it exists, deleting it first updates its insertion order to latest
    this.cache.delete(url);
    this.cache.set(url, {
      value: result,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
