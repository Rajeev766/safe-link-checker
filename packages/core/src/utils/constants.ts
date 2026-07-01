/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { VerifyOptions } from '@safe-link-checker/types';

export const DEFAULT_OPTIONS: Required<Omit<VerifyOptions, 'customShorteners' | 'signal'>> & { signal?: AbortSignal } = {
  maxRedirects: 5,
  timeout: 5000,
  bypassCache: false,
  removeTrackingParams: false,
  checkHttps: true,
  policy: 'balanced'
};
