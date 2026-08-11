import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../../common/request-context';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UsersService } from './users.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.users.getMe(user.userId, user.activeTenantId, user.permissions);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.userId, dto);
  }

  @Get('me/export')
  exportMe(@CurrentUser() user: RequestUser) {
    return this.users.exportMe(user.userId);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: RequestUser, @Body() dto: DeleteAccountDto) {
    return this.users.deleteAccount(user.userId, dto.confirmation);
  }
}
