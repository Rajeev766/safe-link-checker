import { URLHausProvider } from '../src/providers/urlhaus.js';
import { OpenPhishProvider } from '../src/providers/openphish.js';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Providers', () => {
  let fetchSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('URLHausProvider', () => {
    it('should return DANGEROUS if listed (online API)', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ query_status: 'ok', threat: 'malware_download' })
      } as unknown as Response);

      const provider = new URLHausProvider();
      const result = await provider.check('http://bad.com');

      expect(result?.safe).toBe(false);
      expect(result?.scoreImpact).toBe(100);
      expect(result?.message).toContain('URLHaus');
    });

    it('should return SAFE if not listed (online API)', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ query_status: 'no_results' })
      } as unknown as Response);

      const provider = new URLHausProvider();
      const result = await provider.check('http://good.com');

      expect(result?.safe).toBe(true);
      expect(result?.scoreImpact).toBe(0);
    });

    it('should handle timeout/failure gracefully', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const provider = new URLHausProvider();
      const result = await provider.check('http://error.com');

      expect(result?.safe).toBe(true); // Fails open
      expect(result?.message).toContain('failed');
    });
    
    it('should cache results', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ query_status: 'ok', threat: 'malware' })
      } as unknown as Response);

      const provider = new URLHausProvider();
      await provider.check('http://bad.com');
      const cached = await provider.check('http://bad.com'); // Should hit cache

      expect(cached?.safe).toBe(false);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('OpenPhishProvider', () => {
    it('should return SAFE (simulated)', async () => {
      const provider = new OpenPhishProvider();
      const result = await provider.check('http://test.com');
      expect(result?.safe).toBe(true);
      expect(result?.message).toContain('OpenPhish');
    });
  });
});
