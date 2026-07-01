import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { SafeLinkChecker } from 'safe-link-checker';

const app = fastify({ logger: true });
const prisma = new PrismaClient();
const checker = new SafeLinkChecker({
  providers: ['openphish', 'urlhaus']
});

// Plugins
app.register(helmet);
app.register(cors);
app.register(compress);
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date() };
});

// Verify link
app.post('/v1/verify', async (request, reply) => {
  const { url } = request.body as { url: string };
  if (!url) {
    return reply.status(400).send({ error: 'URL is required' });
  }

  try {
    const result = await checker.verify(url);
    
    // Log to DB
    await prisma.verificationLog.create({
      data: {
        url,
        normalizedUrl: result.normalizedUrl,
        safe: result.safe,
        score: result.score,
        riskLevel: result.riskLevel
      }
    });

    return result;
  } catch (error: unknown) {
    app.log.error(error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return reply.status(500).send({ error: msg });
  }
});

// Batch Verify
app.post('/v1/verify/batch', async (request, reply) => {
  const { urls } = request.body as { urls: string[] };
  if (!urls || !Array.isArray(urls)) {
    return reply.status(400).send({ error: 'Array of URLs is required' });
  }

  try {
    const results = await checker.verifyLinks(urls);
    
    // Bulk insert logs
    const logData = results.map((result, i) => ({
      url: urls[i],
      normalizedUrl: result.normalizedUrl,
      safe: result.safe,
      score: result.score,
      riskLevel: result.riskLevel
    }));
    
    await prisma.verificationLog.createMany({ data: logData });

    return results;
  } catch (error: unknown) {
    app.log.error(error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return reply.status(500).send({ error: msg });
  }
});

// Stats
app.get('/stats', async () => {
  const totalVerifications = await prisma.verificationLog.count();
  const maliciousLinks = await prisma.verificationLog.count({ where: { safe: false } });
  
  return {
    totalVerifications,
    maliciousLinks,
    safeLinks: totalVerifications - maliciousLinks,
  };
});

import { setupCronJobs } from './cron.js';

const start = async () => {
  try {
    await prisma.$connect();
    setupCronJobs(prisma);
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
