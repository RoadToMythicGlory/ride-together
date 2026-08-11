import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase kebab-case',
  })
  slug!: string;
}

export class SwitchTenantDto {
  @IsString()
  tenantId!: string;
}

export class AddMemberDto {
  @IsEmail()
  email!: string;

  @IsArray()
  @ArrayUnique()
  @IsIn(['ADMIN', 'EVENT_MANAGER', 'RIDER', 'PARENT'], { each: true })
  roles!: Array<'ADMIN' | 'EVENT_MANAGER' | 'RIDER' | 'PARENT'>;
}

export class SetMemberRolesDto {
  @IsArray()
  @ArrayUnique()
  @IsIn(['ADMIN', 'EVENT_MANAGER', 'RIDER', 'PARENT'], { each: true })
  roles!: Array<'ADMIN' | 'EVENT_MANAGER' | 'RIDER' | 'PARENT'>;

  @IsOptional()
  @IsIn(['ACTIVE', 'INVITED', 'SUSPENDED'])
  status?: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
}
