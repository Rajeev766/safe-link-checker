import type { VerificationResult } from '@safe-link-checker/types';

type SubscriberCallback = (result: VerificationResult) => void;

export class RealtimeSubscriptionEngine {
  private subscriptions = new Map<string, Set<SubscriberCallback>>();
  private intervals = new Map<string, NodeJS.Timeout>();
  
  // Requires a verify function injected to perform the periodic updates
  constructor(private verifyFn: (url: string) => Promise<VerificationResult>) {}

  subscribe(url: string, callback: SubscriberCallback, intervalMs = 60000) {
    if (!this.subscriptions.has(url)) {
      this.subscriptions.set(url, new Set());
      // Start polling
      const timer = setInterval(async () => {
        try {
          const result = await this.verifyFn(url);
          const cbs = this.subscriptions.get(url);
          if (cbs) {
            for (const cb of cbs) cb(result);
          }
        } catch {
          // ignore network errors on poll
        }
      }, intervalMs);
      this.intervals.set(url, timer);
    }
    
    this.subscriptions.get(url)!.add(callback);
    
    // Trigger immediate initial check
    this.verifyFn(url).then(callback).catch(() => {});
  }

  unsubscribe(url: string, callback?: SubscriberCallback) {
    const cbs = this.subscriptions.get(url);
    if (!cbs) return;
    
    if (callback) {
      cbs.delete(callback);
    } else {
      cbs.clear();
    }
    
    if (cbs.size === 0) {
      this.subscriptions.delete(url);
      const timer = this.intervals.get(url);
      if (timer) {
        clearInterval(timer);
        this.intervals.delete(url);
      }
    }
  }
}
