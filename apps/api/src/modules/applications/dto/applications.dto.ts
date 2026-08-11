import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  nickname!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ageYears?: number;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  privateStory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonSummary?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  likesMotorcycles?: boolean;

  @IsOptional()
  @IsBoolean()
  noiseSensitivity?: boolean;

  @IsBoolean()
  acceptParticipation!: boolean;

  @IsBoolean()
  acceptPrivacy!: boolean;

  /** Optional: parent chooses to allow sharing the child's story (curated / with consent). */
  @IsOptional()
  @IsBoolean()
  shareStory?: boolean;
}

export class TransitionApplicationDto {
  @IsIn([
    'UNDER_REVIEW',
    'MORE_INFO_REQUIRED',
    'APPROVED',
    'WAITLISTED',
    'REJECTED',
    'WITHDRAWN',
  ])
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class AssignApplicationDto {
  @IsString()
  eventId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
