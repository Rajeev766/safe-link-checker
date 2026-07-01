/**
 * HTTPS Validator Tests
 *
 * All tests use Jest module mocking to avoid real network requests.
 * We mock Node's built-in `https` and `http` modules at the module level,
 * then configure each test's EventEmitter-based request mock inline.
 */

import { jest } from '@jest/globals';
import type { RequestOptions } from 'https';
import type { ClientRequest } from 'http';

// ─── Build a reusable fake https.request ─────────────────────────────────────

type RequestCallback = (res: { statusCode: number; resume: () => void }) => void;

interface FakeReq {
  _cb?: RequestCallback;
  _errorHandler?: (err: Error) => void;
  _timeoutHandler?: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => FakeReq;
  end: () => void;
  destroy: () => void;
}

function makeFakeRequest(): FakeReq {
  const req: FakeReq = {
    on(event, handler) {
      if (event === 'error') this._errorHandler = handler as (err: Error) => void;
      if (event === 'timeout') this._timeoutHandler = handler;
      return this;
    },
    end() {},
    destroy() {},
  };
  return req;
}

// ─── Mock https / http modules ────────────────────────────────────────────────

const mockHttpsRequest = jest.fn<typeof import('https').request>();
const mockHttpRequest = jest.fn<typeof import('http').request>();

jest.unstable_mockModule('https', () => ({ default: { request: mockHttpsRequest } }));
jest.unstable_mockModule('http', () => ({ default: { request: mockHttpRequest } }));

const { validateHttps } = await import('../src/validators/https.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockSuccess(mock = mockHttpsRequest) {
  const req = makeFakeRequest();
  mock.mockImplementation(((_opts: RequestOptions | string | URL, cb: RequestCallback) => {
    // Simulate immediate successful response
    setImmediate(() => cb({ statusCode: 200, resume: () => {} }));
    return req as unknown as ClientRequest;
  }) as typeof import('https').request);
  return req;
}

function mockError(code: string, message = 'Error', mock = mockHttpsRequest) {
  const req = makeFakeRequest();
  mock.mockImplementationOnce(((_opts: import('https').RequestOptions, _cb: RequestCallback) => {
    setImmediate(() => {
      const err: NodeJS.ErrnoException = new Error(message);
      err.code = code;
      req._errorHandler?.(err);
    });
    return req as unknown as import('http').ClientRequest;
  }) as unknown as typeof import('https').request);
  return req;
}

function mockTimeout(mock = mockHttpsRequest) {
  const req = makeFakeRequest();
  mock.mockImplementationOnce(((_opts: import('https').RequestOptions, _cb: RequestCallback) => {
    setImmediate(() => req._timeoutHandler?.());
    return req as unknown as import('http').ClientRequest;
  }) as unknown as typeof import('https').request);
  return req;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('validateHttps', () => {
  beforeEach(() => {
    mockHttpsRequest.mockReset();
    mockHttpRequest.mockReset();
  });

  // ── HTTPS — valid certificate ──────────────────────────────────────────────
  describe('HTTPS with valid certificate', () => {
    it('should return safe=true and scoreImpact=0 for a good HTTPS URL', async () => {
      mockSuccess();
      const res = await validateHttps('https://example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
      expect(res.message).toContain('HTTPS is enabled');
      expect(res.metadata?.httpsStatus).toBe('HTTPS');
    });

    it('should accept any 2xx/4xx/5xx response as valid TLS', async () => {
      const req = makeFakeRequest();
      mockHttpsRequest.mockImplementationOnce(((_opts: import('https').RequestOptions, cb: RequestCallback) => {
        setImmediate(() => cb({ statusCode: 404, resume: () => {} }));
        return req as unknown as ReturnType<typeof import('https').request>;
      }) as unknown as typeof import('https').request);
      const res = await validateHttps('https://example.com/missing');
      expect(res.safe).toBe(true);
      expect(res.metadata?.httpsStatus).toBe('HTTPS');
    });
  });

  // ── HTTP_ONLY ──────────────────────────────────────────────────────────────
  describe('HTTP-only URLs', () => {
    it('should detect HTTP_ONLY when HTTPS probe succeeds', async () => {
      mockSuccess(); // HTTPS probe on example.com succeeds
      const res = await validateHttps('http://example.com');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(20);
      expect(res.metadata?.httpsStatus).toBe('HTTP_ONLY');
      expect(res.message).toContain('HTTPS version is available');
    });

    it('should still mark HTTP_ONLY when HTTPS probe is unreachable', async () => {
      mockError('ECONNREFUSED', 'Connection refused');
      const res = await validateHttps('http://example.com');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(20);
      expect(res.metadata?.httpsStatus).toBe('HTTP_ONLY');
    });

    it('should mark CERT_ERROR when HTTPS probe finds a cert problem on HTTP URL', async () => {
      mockError('CERT_HAS_EXPIRED', 'certificate has expired');
      const res = await validateHttps('http://example.com');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(40);
      expect(res.metadata?.httpsStatus).toBe('CERT_ERROR');
    });
  });

  // ── Certificate errors ─────────────────────────────────────────────────────
  describe('certificate errors', () => {
    const certCodes = [
      'CERT_HAS_EXPIRED',
      'CERT_NOT_YET_VALID',
      'DEPTH_ZERO_SELF_SIGNED_CERT',
      'SELF_SIGNED_CERT_IN_CHAIN',
      'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      'ERR_TLS_CERT_ALTNAME_INVALID',
    ];

    it.each(certCodes)('should detect cert error for code %s', async (code) => {
      mockError(code, `TLS error: ${code}`);
      const res = await validateHttps('https://bad-cert.example.com');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(40);
      expect(res.metadata?.httpsStatus).toBe('CERT_ERROR');
      expect(res.message).toContain('TLS/SSL certificate error');
    });
  });

  // ── Timeout handling ───────────────────────────────────────────────────────
  describe('timeout handling', () => {
    it('should return safe=true with no penalty on request timeout event', async () => {
      mockTimeout();
      const res = await validateHttps('https://slow.example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
      expect(res.metadata?.httpsStatus).toBe('TIMEOUT');
      expect(res.message).toContain('timed out');
    });

    it('should return safe=true with no penalty on ETIMEDOUT error code', async () => {
      mockError('ETIMEDOUT', 'connect ETIMEDOUT');
      const res = await validateHttps('https://slow.example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
      expect(res.metadata?.httpsStatus).toBe('TIMEOUT');
    });

    it('should return safe=true with no penalty on ECONNRESET', async () => {
      mockError('ECONNRESET', 'socket hang up');
      const res = await validateHttps('https://slow.example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
    });
  });

  // ── Unreachable server ─────────────────────────────────────────────────────
  describe('unreachable server', () => {
    it('should return safe=true with no penalty when server is not found (ENOTFOUND)', async () => {
      mockError('ENOTFOUND', 'getaddrinfo ENOTFOUND nonexistent.example.com');
      const res = await validateHttps('https://nonexistent.example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
      expect(res.metadata?.httpsStatus).toBe('UNREACHABLE');
      expect(res.message).toContain('No penalty applied');
    });

    it('should return safe=true with no penalty when connection is refused (ECONNREFUSED)', async () => {
      mockError('ECONNREFUSED', 'connect ECONNREFUSED 127.0.0.1:443');
      const res = await validateHttps('https://example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
      expect(res.metadata?.httpsStatus).toBe('UNREACHABLE');
    });

    it('should return safe=true with no penalty for ENETUNREACH', async () => {
      mockError('ENETUNREACH', 'network unreachable');
      const res = await validateHttps('https://example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
    });
  });

  // ── Malformed URL ──────────────────────────────────────────────────────────
  describe('malformed URL', () => {
    it('should return SKIPPED safely for an unparseable URL', async () => {
      const res = await validateHttps('not-a-url');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
      expect(res.metadata?.httpsStatus).toBe('SKIPPED');
    });
  });

  // ── Custom timeout param ───────────────────────────────────────────────────
  describe('custom timeout', () => {
    it('should forward the timeout to the request options', async () => {
      mockSuccess();
      await validateHttps('https://example.com', 1000);
      const [opts] = mockHttpsRequest.mock.calls[0] as unknown as [import('https').RequestOptions, RequestCallback];
      expect(opts.timeout).toBe(1000);
    });
  });
});
