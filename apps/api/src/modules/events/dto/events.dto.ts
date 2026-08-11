import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  aboutText?: string;

  @IsOptional()
  @IsString()
  audienceText?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  flowSteps?: string[];

  @IsDateString()
  startsAt!: string;

  @IsString()
  regionId!: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  publicMeetingArea?: string;

  @IsOptional()
  @IsString()
  exactLocation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  riderTarget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  childCapacity?: number;
}

export class PublishEventDto {
  @IsIn(['OPEN_FOR_RIDERS', 'PLANNING', 'CONFIRMED', 'CANCELLED', 'POSTPONED'])
  status!: string;
}

export class RsvpDto {
  @IsIn(['INTERESTED', 'CONFIRMED', 'CANCELLED'])
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  motorcycleInfo?: string;

  @IsOptional()
  @IsBoolean()
  hasPassenger?: boolean;
}

export class ParticipationRespondDto {
  @IsIn(['PARENT_CONFIRMED', 'PARENT_DECLINED'])
  status!: string;
}
