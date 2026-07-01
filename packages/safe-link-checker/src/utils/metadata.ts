/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import http from 'http';
import https from 'https';
import { safeLookup } from './dns.js';
import type { IncomingMessage } from 'http';

export interface MetadataResult {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  url?: string;
}

export async function extractMetadata(urlStr: string, timeout = 5000): Promise<MetadataResult | null> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (v: MetadataResult | null) => {
      if (!settled) { settled = true; resolve(v); }
    };

    let parsed: URL;
    try {
      parsed = new URL(urlStr);
    } catch {
      return settle(null);
    }

    const isHttps = parsed.protocol === 'https:';
    const requester = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      timeout,
      lookup: safeLookup, // SSRF & DNS Rebinding Protection
      headers: {
        'User-Agent': 'safe-link-checker-bot/1.0',
        'Accept': 'text/html',
        'Accept-Encoding': 'identity' // Prevent compression bombs
      },
      // Do not follow redirects here (we already follow them in RedirectTrace!)
    };

    const req = requester.request(options, (res: IncomingMessage) => {
      const contentType = res.headers['content-type'] || '';
      
      // Strict Content-Type validation
      if (res.statusCode !== 200 || !contentType.toLowerCase().includes('text/html')) {
        res.resume();
        return settle(null);
      }

      let html = '';
      let bytesRead = 0;
      const MAX_SIZE = 1024 * 500; // strictly 500KB cap

      res.on('data', (chunk: Buffer) => {
        bytesRead += chunk.length;
        if (bytesRead > MAX_SIZE) {
          req.destroy(); // Abort reading further to prevent memory exhaustion
          parseHtml(html, urlStr, settle);
          return;
        }
        html += chunk.toString('utf8');
      });

      res.on('end', () => {
        if (!settled) parseHtml(html, urlStr, settle);
      });
      
      res.on('error', () => settle(null));
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      settle(null);
    });

    req.on('timeout', () => { req.destroy(); settle(null); });
    req.on('error', () => settle(null));
    
    req.end();
  });
}

function parseHtml(html: string, url: string, settle: (res: MetadataResult | null) => void) {
  try {
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const parseArea: string = (headMatch && headMatch[1]) ? headMatch[1] : html;

    const result: MetadataResult = { url };

    const extractContent = (pattern: RegExp): string | undefined => {
      const match = parseArea.match(pattern);
      return match ? match[1]?.trim() : undefined;
    };

    const ogTitle = extractContent(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const metaTitle = extractContent(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitle || metaTitle;
    if (title !== undefined) result.title = title;

    const ogDesc = extractContent(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const metaDesc = extractContent(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const description = ogDesc || metaDesc;
    if (description !== undefined) result.description = description;

    const ogImage = extractContent(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogImage !== undefined) result.image = ogImage;

    const icon1 = extractContent(/<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    const icon2 = extractContent(/<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    const favicon = icon1 || icon2;
    if (favicon !== undefined) result.favicon = favicon;

    if (result.favicon && !result.favicon.startsWith('http')) {
      try { result.favicon = new URL(result.favicon, url).href; } catch { }
    }
    if (result.image && !result.image.startsWith('http')) {
      try { result.image = new URL(result.image, url).href; } catch { }
    }

    settle(result);
  } catch {
    settle(null);
  }
}
