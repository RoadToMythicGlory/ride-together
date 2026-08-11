import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import type { RequestUser } from '../../common/request-context';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplaceNotificationRegionsDto } from './dto/notification-regions.dto';
import { GeographyService } from './geography.service';

@Controller()
export class GeographyController {
  constructor(private readonly geography: GeographyService) {}

  @Get('regions')
  listRegions() {
    return this.geography.listRegions();
  }

  @Put('me/notification-regions')
  @UseGuards(JwtAuthGuard)
  replaceMine(
    @CurrentUser() user: RequestUser,
    @Body() dto: ReplaceNotificationRegionsDto,
  ) {
    return this.geography.replaceNotificationRegions(
      user.userId,
      user.activeTenantId,
      dto,
    );
  }
}
