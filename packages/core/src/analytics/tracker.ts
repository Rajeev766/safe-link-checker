export interface VerificationEvent {
  url: string;
  durationMs: number;
  cacheHit: boolean;
  providersUsed: string[];
  rulesTriggered: string[];
  threatLevel: string;
  blocked: boolean;
}

export class AnalyticsTracker {
  private events: VerificationEvent[] = [];
  
  track(event: VerificationEvent) {
    this.events.push(event);
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }

  getStats() {
    const total = this.events.length;
    if (total === 0) return null;
    
    const blocked = this.events.filter(e => e.blocked).length;
    const cacheHits = this.events.filter(e => e.cacheHit).length;
    const avgDuration = this.events.reduce((sum, e) => sum + e.durationMs, 0) / total;
    
    return {
      totalVerifications: total,
      blockedCount: blocked,
      cacheHitRate: cacheHits / total,
      averageDurationMs: avgDuration
    };
  }
}
