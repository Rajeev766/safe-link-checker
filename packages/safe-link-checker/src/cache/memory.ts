import { LRUCache } from './lru.js';
import type { VerificationResult } from '../types/index.js';

export { LRUCache as MemoryCache };
export const defaultCache = new LRUCache<VerificationResult>();
