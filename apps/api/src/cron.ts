import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

export function setupCronJobs(prisma: PrismaClient) {
  // Run every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    console.log('Running Threat Intelligence sync...');
    try {
      // In a real scenario, this would fetch from OpenPhish / URLHaus APIs
      // and bulk update the DomainReputation table.
      // E.g.
      // const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/');
      // const data = await response.json();
      
      console.log('Threat Intelligence sync completed successfully.');
    } catch (error) {
      console.error('Threat Intelligence sync failed:', error);
    }
  });
}
