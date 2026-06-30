import type { VerifyOptions } from '../types/index.js';

export const DEFAULT_OPTIONS: Required<Omit<VerifyOptions, 'customShorteners' | 'signal'>> & { signal?: AbortSignal } = {
  maxRedirects: 5,
  timeout: 5000,
  bypassCache: false,
  removeTrackingParams: false,
  checkHttps: true,
};
