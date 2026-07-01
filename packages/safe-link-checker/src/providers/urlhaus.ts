/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult, Provider, VerifyOptions } from '../types/index.js';
import { LRUCache } from '../cache/lru.js';

export class URLHausProvider implements Provider {
  name = 'URLHaus Provider';
  private cache = new LRUCache<CheckResult>({ maxSize: 1000, ttlMs: 1000 * 60 * 60 * 24 }); // 24h cache
  private offlineDataset = new Set<string>();
  private datasetLoaded = false;
  private updateInterval: NodeJS.Timeout | null = null;

  async init(): Promise<void> {
    await this.updateDataset();
    
    // Update every 24 hours in the background
    this.updateInterval = setInterval(() => {
      this.updateDataset().catch(() => {});
    }, 1000 * 60 * 60 * 24);
    
    // Do not hold the Node process open for this interval
    if (this.updateInterval.unref) {
      this.updateInterval.unref();
    }
  }

  private async updateDataset(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch('https://urlhaus.abuse.ch/downloads/csv_online/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) return;

      const text = await res.text();
      const lines = text.split('\n');
      
      const newDataset = new Set<string>();
      for (const line of lines) {
        if (line.startsWith('#') || !line.trim()) continue;
        const parts = line.split('","');
        if (parts.length > 2) {
          const url = parts[2]?.replace(/"/g, '').trim();
          if (url) newDataset.add(url);
        }
      }

      this.offlineDataset = newDataset;
      this.datasetLoaded = true;
    } catch {
      // Fail silently for background updates
    }
  }

  async check(url: string, options?: VerifyOptions): Promise<CheckResult | null> {
    const cached = this.cache.get(url);
    if (cached) {
      return cached;
    }
    
    let result: CheckResult | null = null;

    if (this.datasetLoaded) {
      if (this.offlineDataset.has(url)) {
        result = {
          name: this.name,
          detector: 'urlhaus-offline',
          category: 'provider',
          severity: 'critical',
          title: 'Malware Site Detected (URLHaus)',
          safe: false,
          scoreImpact: 100,
          weight: 100,
          confidence: 99,
          message: 'URL is listed on URLHaus (offline dataset) as a known malware distribution site.',
          fatal: true
        };
      } else {
        result = {
          name: this.name,
          detector: 'urlhaus-offline',
          category: 'provider',
          severity: 'info',
          title: 'Not Listed',
          safe: true,
          scoreImpact: 0,
          confidence: 90, // offline may be slightly stale
          message: 'URL not found in URLHaus database (offline).',
        };
      }
    } else {
      // Fallback to online API if dataset isn't ready
      result = await this.doCheckOnline(url, options);
    }

    if (result) {
      this.cache.set(url, result);
    }
    return result;
  }

  private async doCheckOnline(url: string, options?: VerifyOptions): Promise<CheckResult | null> {
    try {
      const form = new URLSearchParams();
      form.append('url', url);

      const controller = new AbortController();
      const timeout = 3000;
      let timeoutId: NodeJS.Timeout | undefined;
      
      const signal = options?.signal || (() => {
        timeoutId = setTimeout(() => controller.abort(), timeout);
        return controller.signal;
      })();

      try {
        const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: form.toString(),
          signal
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data && data.query_status === 'ok') {
          return {
            name: this.name,
            detector: 'urlhaus-online',
            category: 'provider',
            severity: 'critical',
            title: 'Malware Site Detected (URLHaus)',
            safe: false,
            scoreImpact: 100,
            weight: 100, // Very high severity
            confidence: 99,
            message: 'URL is listed on URLHaus as a known malware distribution site.',
            metadata: { threat: data.threat },
            fatal: true
          };
        }

        return {
          name: this.name,
          detector: 'urlhaus-online',
          category: 'provider',
          severity: 'info',
          title: 'Not Listed',
          safe: true,
          scoreImpact: 0,
          confidence: 100,
          message: 'URL not found in URLHaus database.',
        };
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    } catch {
      // Fail gracefully
      return {
        name: this.name,
        detector: 'urlhaus-error',
        category: 'provider',
        severity: 'medium',
        title: 'Provider Check Failed',
        safe: true,
        scoreImpact: 0,
        confidence: 0,
        message: 'URLHaus check failed or timed out. Skipping.',
      };
    }
  }
}
