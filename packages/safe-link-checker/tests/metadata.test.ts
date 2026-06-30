import { SafeLinkChecker } from '../src/checker.js';
import axios from 'axios';
import { jest } from '@jest/globals';

jest.unstable_mockModule('axios', () => {
  return {
    default: {
      get: jest.fn(),
    }
  };
});

describe('Metadata extraction', () => {
  let getSpy: any;

  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should extract Open Graph metadata correctly', async () => {
    const html = `
      <html>
        <head>
          <title>Test Page</title>
          <meta property="og:title" content="OG Title">
          <meta property="og:description" content="OG Description">
          <meta property="og:image" content="https://example.com/image.png">
          <link rel="icon" href="/favicon.ico">
        </head>
      </html>
    `;
    
    getSpy.mockResolvedValueOnce({ data: html });

    const checker = new SafeLinkChecker();
    const result = await checker.getMetadata('https://example.com');
    
    expect(result).not.toBeNull();
    expect(result?.title).toBe('OG Title');
    expect(result?.description).toBe('OG Description');
    expect(result?.image).toBe('https://example.com/image.png');
    expect(result?.favicon).toBe('https://example.com/favicon.ico');
  });

  it('should fallback to standard tags if OG not present', async () => {
    const html = `
      <html>
        <head>
          <title>Standard Title</title>
          <meta name="description" content="Standard Description">
        </head>
      </html>
    `;
    
    getSpy.mockResolvedValueOnce({ data: html });

    const checker = new SafeLinkChecker();
    const result = await checker.getMetadata('https://example.com');
    
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Standard Title');
    expect(result?.description).toBe('Standard Description');
    expect(result?.image).toBeUndefined();
  });
});
