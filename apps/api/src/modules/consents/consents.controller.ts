import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PERMISSIONS } from '@ride-together/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../../common/request-context';
import { PoliciesGuard } from '../rbac/policies.guard';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { ConsentsService } from './consents.service';

class ConsentItemDto {
  @IsString()
  consentType!: string;

  @IsString()
  version!: string;

  @IsBoolean()
  accepted!: boolean;

  @IsOptional()
  @IsString()
  applicationId?: string;
}

class SaveConsentsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConsentItemDto)
  items!: ConsentItemDto[];
}

@Controller('me/consents')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ConsentsController {
  constructor(private readonly consents: ConsentsService) {}

  @Get()
  @RequirePermission(PERMISSIONS.CONSENTS_MANAGE_OWN)
  list(@CurrentUser() user: RequestUser) {
    return this.consents.listMine(user);
  }

  @Put()
  @RequirePermission(PERMISSIONS.CONSENTS_MANAGE_OWN)
  save(@CurrentUser() user: RequestUser, @Body() dto: SaveConsentsDto) {
    return this.consents.saveMany(user, dto.items);
  }
}
