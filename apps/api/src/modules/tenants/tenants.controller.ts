import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PERMISSIONS } from '@ride-together/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../../common/request-context';
import { PoliciesGuard } from '../rbac/policies.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import {
  AddMemberDto,
  CreateTenantDto,
  SetMemberRolesDto,
} from './dto/tenants.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get('mine')
  mine(@CurrentUser() user: RequestUser) {
    return this.tenants.listMine(user);
  }

  @Get()
  listAll(@CurrentUser() user: RequestUser) {
    return this.tenants.listAll(user);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateTenantDto) {
    return this.tenants.create(user, dto);
  }

  @Get(':tenantId/members')
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  members(@CurrentUser() user: RequestUser, @Param('tenantId') tenantId: string) {
    return this.tenants.listMembers(user, tenantId);
  }

  @Post(':tenantId/members')
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  addMember(
    @CurrentUser() user: RequestUser,
    @Param('tenantId') tenantId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.tenants.addMember(user, tenantId, dto);
  }

  @Patch(':tenantId/members/:userId')
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  setRoles(
    @CurrentUser() user: RequestUser,
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: SetMemberRolesDto,
  ) {
    return this.tenants.setMemberRoles(user, tenantId, userId, dto);
  }
}
