import { verifyLink } from 'safe-link-checker';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { url } = await request.json();
      if (!url) return new Response('Missing url', { status: 400 });

      // Runs the Edge implementation of safe-link-checker automatically
      const result = await verifyLink(url);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e: any) {
      return new Response(e.message, { status: 500 });
    }
  }
};
