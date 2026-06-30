import { URLHausProvider } from '../src/providers/urlhaus.js';
import { OpenPhishProvider } from '../src/providers/openphish.js';
import axios from 'axios';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Providers', () => {
  let postSpy: any;

  beforeEach(() => {
    postSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('URLHausProvider', () => {
    it('should return DANGEROUS if listed', async () => {
      postSpy.mockResolvedValueOnce({
        data: { query_status: 'ok', threat: 'malware_download' }
      });

      const provider = new URLHausProvider();
      const result = await provider.check('http://bad.com');

      expect(result?.safe).toBe(false);
      expect(result?.scoreImpact).toBe(100);
      expect(result?.message).toContain('URLHaus');
    });

    it('should return SAFE if not listed', async () => {
      postSpy.mockResolvedValueOnce({
        data: { query_status: 'no_results' }
      });

      const provider = new URLHausProvider();
      const result = await provider.check('http://good.com');

      expect(result?.safe).toBe(true);
      expect(result?.scoreImpact).toBe(0);
    });

    it('should fail gracefully on network error', async () => {
      postSpy.mockRejectedValueOnce(new Error('Network error'));

      const provider = new URLHausProvider();
      const result = await provider.check('http://error.com');

      expect(result?.safe).toBe(true);
      expect(result?.scoreImpact).toBe(0);
      expect(result?.message).toContain('failed');
    });
  });

  describe('OpenPhishProvider', () => {
    it('should return SAFE for the simulated check', async () => {
      const provider = new OpenPhishProvider();
      const result = await provider.check('http://test.com');
      
      expect(result?.safe).toBe(true);
      expect(result?.message).toContain('OpenPhish');
    });
  });
});
