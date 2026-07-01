import type { VerifyOptions } from '@safe-link-checker/types';

export class CloudGateway {
  private endpoint: string;
  private apiKey: string;
  private syncSource: EventSource | null = null;
  public isConnected = false;

  constructor(options: NonNullable<VerifyOptions['cloud']>) {
    this.endpoint = options.endpoint || 'https://api.safelink.dev';
    this.apiKey = options.apiKey;
  }

  connect(onRulesUpdated: (rules: any[]) => void) {
    if (typeof EventSource !== 'undefined') {
      try {
        // Simple SSE connection (In reality EventSource doesn't support headers well natively in browser,
        // so we'd use a polyfill or query param for auth)
        const url = `${this.endpoint}/v1/sync?token=${this.apiKey}`;
        this.syncSource = new EventSource(url);

        this.syncSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'SYNC_RULES') {
              onRulesUpdated(data.payload);
            }
          } catch {}
        };
        
        this.syncSource.onopen = () => { this.isConnected = true; };
        this.syncSource.onerror = () => { this.isConnected = false; };
      } catch (e) {
        this.isConnected = false;
      }
    }
  }

  async verifyCloud(url: string, signal?: AbortSignal) {
    const res = await fetch(`${this.endpoint}/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ url }),
      signal: signal ?? null
    });
    if (!res.ok) throw new Error('Cloud verify failed');
    return res.json();
  }

  private telemetryQueue: any[] = [];
  private telemetryInterval: ReturnType<typeof setInterval> | null = null;

  async submitTelemetry(result: any) {
    if (!this.isConnected) return;
    
    if (this.telemetryQueue.length >= 1000) {
      // Max pending events reached, drop oldest
      this.telemetryQueue.shift();
    }

    this.telemetryQueue.push({
      url: result.normalizedUrl,
      trustScore: result.trustScore,
      riskScore: result.riskScore || 0,
      threatLevel: result.threatLevel,
      providersUsed: result.providerResults?.map((p: any) => p.name) || [],
      categories: result.categories,
      timestamp: new Date().toISOString()
    });

    if (!this.telemetryInterval) {
      // Flush every 5 seconds
      this.telemetryInterval = setInterval(() => this.flushTelemetry(), 5000);
    }
    
    if (this.telemetryQueue.length >= 50) {
      this.flushTelemetry();
    }
  }

  private async flushTelemetry() {
    if (this.telemetryQueue.length === 0) return;
    
    // Take up to 50 items
    const batch = this.telemetryQueue.splice(0, 50);
    
    try {
      await fetch(`${this.endpoint}/v1/telemetry/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ events: batch })
      });
    } catch (e) {
      // On network failure, re-queue if under limit to act as offline queue
      if (this.telemetryQueue.length + batch.length <= 1000) {
        this.telemetryQueue.unshift(...batch);
      }
    }
  }

  dispose() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
    if (this.syncSource) {
      this.syncSource.close();
    }
    // Attempt final flush
    if (this.telemetryQueue.length > 0) {
      this.flushTelemetry().catch(() => {});
    }
  }
}
