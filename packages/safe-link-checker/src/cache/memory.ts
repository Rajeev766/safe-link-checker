/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LRUCache } from './lru.js';
import type { VerificationResult } from '../types/index.js';

export { LRUCache as MemoryCache };
export const defaultCache = new LRUCache<VerificationResult>();
