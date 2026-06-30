import normalizeUrl from 'normalize-url';

const TRACKING_PARAMS: (string | RegExp)[] = [/^utm_\w+/i, 'fbclid', 'gclid'];

export function normalizeLink(url: string, options?: { removeTrackingParams?: boolean }): string {
  const trimmed = url.trim();
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



