import { config as loadDotenv } from 'dotenv';
import { resolve } from 'path';
import { loadEnv } from '@ride-together/config';
import { prisma } from '@ride-together/database';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

loadDotenv({ path: resolve(__dirname, '../../../.env') });

async function claimOutboxBatch(limit = 50) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      Array<{
        id: string;
        event_type: string;
        payload: unknown;
        tenant_id: string | null;
      }>
    >`
      SELECT id, event_type, payload, tenant_id
      FROM outbox_events
      WHERE published_at IS NULL
        AND available_at <= NOW()
      ORDER BY created_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    `;

    return rows;
  });
}

async function main() {
  const env = loadEnv();
  const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const queue = new Queue('domain-events', { connection });

  console.log('[worker] outbox relay started');

  const tick = async () => {
    try {
      const rows = await claimOutboxBatch();
      for (const row of rows) {
        await queue.add(
          row.event_type,
          {
            outboxId: row.id,
            tenantId: row.tenant_id,
            payload: row.payload,
          },
          { jobId: row.id, removeOnComplete: 1000 },
        );
        await prisma.outboxEvent.update({
          where: { id: row.id },
          data: {
            publishedAt: new Date(),
            attempts: { increment: 1 },
          },
        });
      }
    } catch (err) {
      console.error('[worker] relay tick failed', err);
    }
  };

  await tick();
  setInterval(tick, 2000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
