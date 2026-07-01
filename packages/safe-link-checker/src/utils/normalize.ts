/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import normalizeUrl from 'normalize-url';

const TRACKING_PARAMS: (string | RegExp)[] = [/^utm_\w+/i, 'fbclid', 'gclid'];

export function normalizeLink(url: string, options?: { removeTrackingParams?: boolean }): string {
  const trimmed = url.trim();
  
  // Fast path for simple, standard URLs without tracking params
  try {
    const u = new URL(trimmed);
    if (!options?.removeTrackingParams || !u.search) {
      if (u.pathname === '/' && !u.search && !u.hash) {
        let simple = trimmed;
        if (simple.endsWith('/')) simple = simple.slice(0, -1);
        // If it matches exactly what standard URL parser says, return it instantly
        if (simple === u.origin) return simple;
      }
    }
  } catch {}

  try {
    return normalizeUrl(trimmed, {
      stripWWW: false,
      removeTrailingSlash: true,
      stripHash: true,
      sortQueryParameters: true,
      removeQueryParameters: options?.removeTrackingParams ? TRACKING_PARAMS : [],
    });
  } catch {
    return trimmed;
  }
}



