import Fastify from 'fastify';
import { SafeLinkChecker } from 'safe-link-checker';

const app = Fastify({ logger: true });
const checker = new SafeLinkChecker({
  providers: ['urlhaus', 'openphish'],
  policy: 'strict',
  cache: true
});

app.post('/verify', async (request, reply) => {
  const { url } = request.body as { url: string };
  if (!url) return reply.code(400).send({ error: 'url is required' });
  
  const result = await checker.verify(url);
  return result;
});

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
