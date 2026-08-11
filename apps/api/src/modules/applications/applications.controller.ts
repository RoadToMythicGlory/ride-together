import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PERMISSIONS } from '@ride-together/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../../common/request-context';
import { PoliciesGuard } from '../rbac/policies.guard';
import {
  RequireAnyPermission,
  RequirePermission,
} from '../rbac/require-permission.decorator';
import { ApplicationsService } from './applications.service';
import {
  AssignApplicationDto,
  CreateApplicationDto,
  TransitionApplicationDto,
} from './dto/applications.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  @RequirePermission(PERMISSIONS.APPLICATIONS_CREATE)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateApplicationDto) {
    return this.applications.create(user, dto);
  }

  @Get('mine')
  @RequirePermission(PERMISSIONS.APPLICATIONS_READ_OWN)
  mine(@CurrentUser() user: RequestUser) {
    return this.applications.listMine(user);
  }

  @Get('queue')
  @RequirePermission(PERMISSIONS.APPLICATIONS_REVIEW)
  queue(@CurrentUser() user: RequestUser) {
    return this.applications.listQueue(user);
  }

  @Get(':id')
  @RequireAnyPermission(PERMISSIONS.APPLICATIONS_READ_OWN, PERMISSIONS.APPLICATIONS_REVIEW)
  getOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.applications.getOne(user, id);
  }

  @Patch(':id/status')
  @RequireAnyPermission(PERMISSIONS.APPLICATIONS_REVIEW, PERMISSIONS.APPLICATIONS_READ_OWN)
  transition(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: TransitionApplicationDto,
  ) {
    return this.applications.transition(user, id, dto);
  }

  @Post(':id/assign')
  @RequirePermission(PERMISSIONS.APPLICATIONS_ASSIGN)
  assign(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: AssignApplicationDto,
  ) {
    return this.applications.assign(user, id, dto);
  }
}
