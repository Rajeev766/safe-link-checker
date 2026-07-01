import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient, Project } from '@prisma/client';
import { SafeLinkChecker } from 'safe-link-checker';
import { z } from 'zod';
import type { PickledResult } from '@safe-link-checker/types';

const app = fastify({ logger: true, trustProxy: true });
const prisma = new PrismaClient();
const checker = new SafeLinkChecker({
  providers: ['openphish', 'urlhaus']
});

app.register(helmet);
app.register(cors);
app.register(compress);
app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Setup hooks for realtime SSE clients
const sseClients = new Map<string, any[]>();

declare module 'fastify' {
  interface FastifyRequest {
    project: Project;
  }
}

app.decorateRequest('project', null);

app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
  if (request.url === '/health') return;
  const authHeader = request.headers.authorization || request.headers['x-api-key'];
  if (!authHeader) {
    return reply.status(401).send({ error: 'Unauthorized: Missing API Key' });
  }
  const token = (authHeader as string).replace('Bearer ', '');
  
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: token },
    include: { project: true }
  });

  if (!apiKey) {
    return reply.status(401).send({ error: 'Unauthorized: Invalid API Key' });
  }

  request.project = apiKey.project;
  
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } }).catch(() => {});
});

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date() };
});

const VerifyBodySchema = z.object({ url: z.string().url() });
const VerifyBatchBodySchema = z.object({ urls: z.array(z.string().url()) });

app.post('/v1/verify', async (request: FastifyRequest, reply: FastifyReply) => {
  const parseResult = VerifyBodySchema.safeParse(request.body);
  if (!parseResult.success) return reply.status(400).send({ error: 'Valid URL is required' });
  const { url } = parseResult.data;
  const project = request.project;

  try {
    const result = await checker.verify(url);
    
    await prisma.verificationEvent.create({
      data: {
        projectId: project.id,
        url,
        trustScore: result.trustScore ?? 0,
        riskScore: (result as any).riskScore ?? 50,
        threatLevel: (result as any).threatLevel ?? 'UNKNOWN',
        decision: result.decision ?? 'ALLOW',
        cacheHit: result.fromCache ?? false,
        durationMs: 0,
        providersUsed: (result as any).providerResults ? (result as any).providerResults.map((p: any) => p.name).join(',') : '',
        rulesTriggered: (result as any).checks ? (result as any).checks.filter((e: any) => e.detector === 'rule-engine').map((e: any) => e.name).join(',') : ''
      }
    });

    return result;
  } catch (error: unknown) {
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/v1/verify/batch', async (request: FastifyRequest, reply: FastifyReply) => {
  const parseResult = VerifyBatchBodySchema.safeParse(request.body);
  if (!parseResult.success) return reply.status(400).send({ error: 'Array of valid URLs is required' });
  const { urls } = parseResult.data;
  const project = request.project;

  try {
    // Cast to any at the API gateway boundary — we receive the full enriched result
    // from the SDK but the compiled type definitions may differ from the runtime object.
    const verifyResults = await checker.verifyLinks(urls) as any[];
    const results: PickledResult[] = verifyResults.map(r => ({
      url: r.url,
      safe: r.safe,
      decision: (r.decision ?? 'ALLOW') as import('@safe-link-checker/types').DecisionAction,
      trustScore: r.trustScore ?? 0,
      riskScore: r.riskScore ?? 50,
      classification: r.classification ?? 'Unknown',
      threatLevel: r.threatLevel ?? 'UNKNOWN',
      securityBadge: (r.trustScore ?? 0) > 80 ? '\u{1F7E2} SAFE' : (r.trustScore ?? 0) > 50 ? '\u{1F7E1} SUSPICIOUS' : '\u{1F534} DANGEROUS',
      riskColor: (r.trustScore ?? 0) > 80 ? 'green' : (r.trustScore ?? 0) > 50 ? 'yellow' : 'red',
      summary: r.summary ?? '',
      recommendation: r.recommendation ?? r.recommendations?.[0] ?? ''
    }));
    
    const logData = results.map(result => ({
      projectId: project.id,
      url: result.url,
      trustScore: result.trustScore,
      riskScore: result.riskScore,
      threatLevel: result.threatLevel,
      decision: result.decision,
      cacheHit: false,
      durationMs: 0,
      providersUsed: '',
      rulesTriggered: ''
    }));
    
    await prisma.verificationEvent.createMany({ data: logData });
    return results;
  } catch (error: unknown) {
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
});

// Realtime SSE Sync for SDK Clients
app.get('/v1/sync', async (request: FastifyRequest, reply: FastifyReply) => {
  const project = request.project;
  
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.flushHeaders();

  // Send initial configurations (Rules)
  const rules = await prisma.rule.findMany({ where: { projectId: project.id, enabled: true } });
  reply.raw.write(`data: ${JSON.stringify({ type: 'SYNC_RULES', payload: rules })}\n\n`);

  if (!sseClients.has(project.id)) {
    sseClients.set(project.id, []);
  }
  sseClients.get(project.id)!.push(reply.raw);

  request.raw.on('close', () => {
    const clients = sseClients.get(project.id);
    if (clients) {
      const index = clients.indexOf(reply.raw);
      if (index !== -1) clients.splice(index, 1);
    }
  });
});

import { crawlUrl, correlateAI } from './crawler.js';

const TelemetryEventSchema = z.object({
  url: z.string().url(),
  trustScore: z.number(),
  riskScore: z.number(),
  threatLevel: z.string(),
  providersUsed: z.array(z.string()).optional()
});

const TelemetryBatchBodySchema = z.object({
  events: z.array(TelemetryEventSchema)
});

app.post('/v1/telemetry/batch', async (request: FastifyRequest, reply: FastifyReply) => {
  const parseResult = TelemetryBatchBodySchema.safeParse(request.body);
  if (!parseResult.success) return reply.status(400).send({ error: 'Valid Telemetry batch payload required' });
  const { events } = parseResult.data;
  const project = request.project;

  try {
    const logData = events.map(data => ({
      projectId: project.id,
      url: data.url,
      trustScore: data.trustScore,
      riskScore: data.riskScore,
      threatLevel: data.threatLevel,
      decision: 'TELEMETRY',
      cacheHit: false,
      durationMs: 0,
      providersUsed: data.providersUsed?.join(',') || '',
      rulesTriggered: ''
    }));

    // 1. Ingest telemetry events
    await prisma.verificationEvent.createMany({ data: logData });

    // 2. Add to Threat Graph asynchronously
    setTimeout(async () => {
      try {
        for (const data of events) {
          const urlNode = await prisma.threatNode.upsert({
            where: { value: data.url },
            update: { 
              trustScore: Math.floor((data.trustScore + 50) / 2),
              riskScore: Math.floor((data.riskScore + 50) / 2)
            },
            create: {
              type: 'url',
              value: data.url,
              trustScore: data.trustScore,
              riskScore: data.riskScore,
              attributes: '{}'
            }
          });

          const domainMatch = data.url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
          if (domainMatch && domainMatch[1]) {
            const domain = domainMatch[1];
            const domainNode = await prisma.threatNode.upsert({
              where: { value: domain },
              update: {},
              create: { type: 'domain', value: domain, attributes: '{}' }
            });

            await prisma.threatEdge.upsert({
              where: { sourceId_targetId_type: { sourceId: urlNode.id, targetId: domainNode.id, type: 'HOSTED_ON' } },
              update: {},
              create: { sourceId: urlNode.id, targetId: domainNode.id, type: 'HOSTED_ON' }
            });
          }
        }
      } catch (err) {
        app.log.error(err);
      }
    }, 0);

    return { status: 'ingested' };
  } catch (err) {
    app.log.error(err);
    return reply.status(500).send({ error: 'Failed to ingest telemetry batch' });
  }
});

const ReportSchema = z.object({
  url: z.string().url(),
  reportType: z.string(),
  description: z.string().optional()
});

app.post('/v1/community/report', async (request: FastifyRequest, reply: FastifyReply) => {
  const parseResult = ReportSchema.safeParse(request.body);
  if (!parseResult.success) return reply.status(400).send({ error: 'Valid report payload required' });
  const { url, reportType, description } = parseResult.data;
  
  try {
    const report = await prisma.communityReport.create({
      data: { url, reportType, description: description || '', status: 'pending' }
    });
    return { status: 'submitted', reportId: report.id };
  } catch (err) {
    app.log.error(err);
    return reply.status(500).send({ error: 'Submission failed' });
  }
});

// Realtime Threat Feed SSE
app.get('/v1/feeds/realtime', async (request, reply) => {
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.flushHeaders();

  reply.raw.write(`data: ${JSON.stringify({ type: 'FEED_CONNECTED', timestamp: Date.now() })}\n\n`);

  // Simulate pushing live threat updates to feed subscribers
  const interval = setInterval(() => {
    reply.raw.write(`data: ${JSON.stringify({ 
      type: 'THREAT_UPDATE', 
      threat: { url: `phishing-demo-${Math.random().toString(36).substring(7)}.com`, type: 'Phishing', aiConfidence: 98 }
    })}\n\n`);
  }, 5000);

  request.raw.on('close', () => {
    clearInterval(interval);
  });
});

import { setupCronJobs } from './cron.js';

const start = async () => {
  try {
    await prisma.$connect();
    // Create a mock master project and API key for testing if they don't exist
    const org = await prisma.organization.upsert({
      where: { id: 'org-1' },
      update: {},
      create: { id: 'org-1', name: 'Acme Corp' }
    });
    const proj = await prisma.project.upsert({
      where: { id: 'proj-1' },
      update: {},
      create: { id: 'proj-1', name: 'Production', organizationId: org.id }
    });
    await prisma.apiKey.upsert({
      where: { keyHash: 'sk_test_12345' },
      update: {},
      create: { keyHash: 'sk_test_12345', name: 'Test Key', projectId: proj.id, scopes: 'all' }
    });

    setupCronJobs(prisma);
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
