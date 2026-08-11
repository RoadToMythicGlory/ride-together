import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PERMISSIONS } from '@ride-together/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../../common/request-context';
import { PoliciesGuard } from '../rbac/policies.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import {
  CreateEventDto,
  ParticipationRespondDto,
  PublishEventDto,
  RsvpDto,
} from './dto/events.dto';
import { EventsService } from './events.service';

@Controller()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Post('events')
  @RequirePermission(PERMISSIONS.EVENTS_CREATE)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateEventDto) {
    return this.events.create(user, dto);
  }

  @Get('events')
  @RequirePermission(PERMISSIONS.EVENTS_READ_PUBLIC)
  list(@CurrentUser() user: RequestUser) {
    return this.events.listPublic(user);
  }

  @Get('events/mine/rsvps')
  @RequirePermission(PERMISSIONS.RSVP_MANAGE_OWN)
  myRsvps(@CurrentUser() user: RequestUser) {
    return this.events.myRsvps(user);
  }

  @Get('events/:id')
  @RequirePermission(PERMISSIONS.EVENTS_READ_PUBLIC)
  getOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.events.getOne(user, id);
  }

  @Patch('events/:id/status')
  @RequirePermission(PERMISSIONS.EVENTS_PUBLISH)
  setStatus(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: PublishEventDto,
  ) {
    return this.events.setStatus(user, id, dto);
  }

  @Post('events/:id/rsvp')
  @RequirePermission(PERMISSIONS.RSVP_MANAGE_OWN)
  rsvp(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: RsvpDto,
  ) {
    return this.events.rsvp(user, id, dto);
  }

  @Get('events/:id/rsvps')
  @RequirePermission(PERMISSIONS.EVENTS_MANAGE)
  listRsvps(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.events.listRsvps(user, id);
  }

  @Get('participations/mine')
  @RequirePermission(PERMISSIONS.APPLICATIONS_READ_OWN)
  myParticipations(@CurrentUser() user: RequestUser) {
    return this.events.parentParticipations(user);
  }

  @Post('participations/:id/respond')
  @RequirePermission(PERMISSIONS.APPLICATIONS_READ_OWN)
  respond(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: ParticipationRespondDto,
  ) {
    return this.events.respondParticipation(user, id, dto);
  }
}
