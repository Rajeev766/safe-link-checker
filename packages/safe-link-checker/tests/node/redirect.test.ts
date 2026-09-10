import { traceRedirects } from '@safe-link-checker/node-runtime';
import http from 'http';
import https from 'https';
import type { AddressInfo } from 'net';
import { jest } from '@jest/globals';

describe('Redirect Validator', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      if (req.url === '/start') {
        res.writeHead(302, { Location: '/mid' });
        res.end();
      } else if (req.url === '/mid') {
        res.writeHead(301, { Location: '/end' });
        res.end();
      } else if (req.url === '/end') {
        res.writeHead(200);
        res.end('OK');
      } else if (req.url === '/loop1') {
        res.writeHead(302, { Location: '/loop2' });
        res.end();
      } else if (req.url === '/loop2') {
        res.writeHead(302, { Location: '/loop1' });
        res.end();
      } else if (req.url === '/downgrade') {
        // Mock a downgrade, though starting from http to http isn't a downgrade,
        // we'll just test the logic directly or through a mocked https server if needed.
        res.writeHead(302, { Location: 'http://example.com/end' });
        res.end();
      } else if (req.url === '/long') {
        res.writeHead(302, { Location: '/long1' });
        res.end();
      } else if (req.url?.startsWith('/long')) {
        const num = parseInt(req.url.replace('/long', ''), 10);
        res.writeHead(302, { Location: `/long${num + 1}` });
        res.end();
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(0, () => {
      const addr = server.address() as AddressInfo;
      baseUrl = `http://localhost:${addr.port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should follow redirects', async () => {
    const trace = await traceRedirects(`${baseUrl}/start`);
    expect(trace.redirectCount).toBe(2);
    expect(trace.finalUrl).toBe(`${baseUrl}/end`);
    expect(trace.chain).toEqual([
      `${baseUrl}/start`,
      `${baseUrl}/mid`,
      `${baseUrl}/end`
    ]);
    expect(trace.anomalies).toEqual([]);
  });

  it('should detect redirect loop', async () => {
    const trace = await traceRedirects(`${baseUrl}/loop1`);
    expect(trace.anomalies).toContain('LOOP');
    // Follows loop1 -> loop2 -> loop1 and detects loop
  });

  it('should detect max redirects exceeded', async () => {
    const trace = await traceRedirects(`${baseUrl}/long`, { maxRedirects: 3 });
    expect(trace.anomalies).toContain('MAX_REDIRECTS_EXCEEDED');
    expect(trace.redirectCount).toBe(3);
  });

  it('should detect protocol downgrade', async () => {
    // Mock https.request to avoid needing a real TLS server
    const mockRequest = jest.spyOn(https, 'request').mockImplementation((url, options, cb) => {
      let callback = cb;
      if (typeof options === 'function') callback = options;
      
      const res = {
        statusCode: 302,
        headers: { location: 'http://example.com/downgraded' },
        on: jest.fn(),
        destroy: jest.fn(),
        resume: jest.fn()
      };
      
      if (callback) {
        callback(res);
      }
      
      return {
        on: jest.fn(),
        end: jest.fn(),
        destroy: jest.fn()
      } as any;
    });

    try {
      const trace = await traceRedirects(`https://secure.example.com/start`);
      expect(trace.anomalies).toContain('PROTOCOL_DOWNGRADE');
      expect(trace.redirectCount).toBe(0); // It stops tracing immediately on downgrade
    } finally {
      mockRequest.mockRestore();
    }
  });
});
