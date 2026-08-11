import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ArrayUnique, IsArray, IsString } from 'class-validator';
import { PERMISSIONS } from '@ride-together/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../../common/request-context';
import { PoliciesGuard } from '../rbac/policies.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { RolesService } from './roles.service';

class SetRolePermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions!: string[];
}

@Controller()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get('roles')
  @RequirePermission(PERMISSIONS.ROLES_MANAGE)
  listRoles(@CurrentUser() user: RequestUser) {
    return this.roles.listRoles(user);
  }

  @Get('permissions')
  @RequirePermission(PERMISSIONS.ROLES_MANAGE)
  listPermissions() {
    return this.roles.listPermissions();
  }

  @Put('roles/:key/permissions')
  @RequirePermission(PERMISSIONS.ROLES_MANAGE)
  setPermissions(
    @CurrentUser() user: RequestUser,
    @Param('key') key: string,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.roles.setRolePermissions(user, key, dto.permissions);
  }
}
