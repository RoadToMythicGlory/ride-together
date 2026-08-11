import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GeographyModule } from './modules/geography/geography.module';
import { AuditModule } from './modules/audit/audit.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { HealthController } from './modules/health/health.controller';
import { OutboxModule } from './modules/outbox/outbox.module';
import { MailModule } from './modules/mail/mail.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { EventsModule } from './modules/events/events.module';
import { ConsentsModule } from './modules/consents/consents.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    MailModule,
    RbacModule,
    AuthModule,
    UsersModule,
    GeographyModule,
    ApplicationsModule,
    EventsModule,
    ConsentsModule,
    TenantsModule,
    RolesModule,
    OutboxModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
