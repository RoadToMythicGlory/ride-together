import { Global, Module } from '@nestjs/common';
import { PolicyEngine } from './policy.engine';
import { PoliciesGuard } from './policies.guard';

@Global()
@Module({
  providers: [PolicyEngine, PoliciesGuard],
  exports: [PolicyEngine, PoliciesGuard],
})
export class RbacModule {}
