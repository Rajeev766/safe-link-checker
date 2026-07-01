import type { CheckResult } from '@safe-link-checker/types';

export class EvidenceEngine {
  
  static process(rawChecks: (CheckResult | null)[]): CheckResult[] {
    const validChecks = rawChecks.filter((c): c is CheckResult => c !== null);
    
    // Deduplicate by name/title
    const map = new Map<string, CheckResult>();
    
    for (const check of validChecks) {
      const key = check.title || check.name;
      if (!map.has(key)) {
        map.set(key, check);
      } else {
        // Merge severity or confidence if duplicates found
        const existing = map.get(key)!;
        if ((check.scoreImpact || 0) > (existing.scoreImpact || 0)) {
          map.set(key, check);
        }
      }
    }
    
    return Array.from(map.values());
  }

  static categorize(evidence: CheckResult[]): Record<string, number> {
    const categories: Record<string, number> = {};
    for (const item of evidence) {
      const cat = item.category || 'other';
      categories[cat] = (categories[cat] || 0) + (item.scoreContribution || item.scoreImpact || 0);
    }
    return categories;
  }
}
