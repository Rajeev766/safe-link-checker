import { SafeLinkChecker } from '../src/checker.js';
import { jest } from '@jest/globals';
import http from 'http';
import type { AddressInfo } from 'net';

describe('Metadata extraction', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      if (req.url === '/og') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head>
              <title>Test Page</title>
              <meta property="og:title" content="OG Title">
              <meta property="og:description" content="OG Description">
              <meta property="og:image" content="https://example.com/image.png">
              <link rel="icon" href="/favicon.ico">
            </head>
          </html>
        `);
      } else if (req.url === '/standard') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head>
              <title>Standard Title</title>
              <meta name="description" content="Standard Description">
            </head>
          </html>
        `);
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
    jest.restoreAllMocks();
  });

  it('should extract Open Graph metadata correctly', async () => {
    const checker = new SafeLinkChecker();
    const result = await checker.getMetadata(`${baseUrl}/og`);
    
    expect(result).not.toBeNull();
    expect(result?.title).toBe('OG Title');
    expect(result?.description).toBe('OG Description');
    expect(result?.image).toBe('https://example.com/image.png');
    // Favicon was resolved against the base URL in the test server
    expect(result?.favicon).toBe(`${baseUrl}/favicon.ico`);
  });

  it('should fallback to standard tags if OG not present', async () => {
    const checker = new SafeLinkChecker();
    const result = await checker.getMetadata(`${baseUrl}/standard`);
    
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Standard Title');
    expect(result?.description).toBe('Standard Description');
    expect(result?.image).toBeUndefined();
  });
});
