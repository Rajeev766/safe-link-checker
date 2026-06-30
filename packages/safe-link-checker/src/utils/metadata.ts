import axios from 'axios';
import * as cheerio from 'cheerio';

export interface MetadataResult {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  url?: string;
}

export async function extractMetadata(url: string, timeout = 5000): Promise<MetadataResult | null> {
  try {
    const response = await axios.get(url, {
      timeout,
      maxContentLength: 1024 * 500, // 500 KB limit
      headers: {
        'User-Agent': 'safe-link-checker-bot/1.0',
        'Accept': 'text/html'
      }
    });

    if (typeof response.data !== 'string') {
      return null;
    }

    const $ = cheerio.load(response.data);
    const result: MetadataResult = { url };

    // Title
    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    if (title) result.title = title;

    // Description
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
    if (description) result.description = description;

    // Image
    const image = $('meta[property="og:image"]').attr('content');
    if (image) result.image = image;

    // Favicon
    const favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
    if (favicon) result.favicon = favicon;
    
    // Resolve relative URLs for image/favicon
    if (result.favicon && !result.favicon.startsWith('http')) {
      result.favicon = new URL(result.favicon, url).href;
    }
    if (result.image && !result.image.startsWith('http')) {
      result.image = new URL(result.image, url).href;
    }

    return result;
  } catch {
    return null;
  }
}
