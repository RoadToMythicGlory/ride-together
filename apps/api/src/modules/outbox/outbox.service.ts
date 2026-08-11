import { Injectable } from '@nestjs/common';
import { Prisma } from '@ride-together/database';
import { PrismaService } from '../../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(
    input: {
      tenantId?: string | null;
      aggregateType: string;
      aggregateId: string;
      eventType: string;
      payload: Prisma.InputJsonValue;
      idempotencyKey?: string;
    },
    tx?: Tx,
  ) {
    const db = tx ?? this.prisma;
    return db.outboxEvent.create({
      data: {
        tenantId: input.tenantId ?? null,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        eventType: input.eventType,
        payload: input.payload,
        idempotencyKey: input.idempotencyKey,
      },
    });
  }
}
