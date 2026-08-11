import {
  ArrayUnique,
  Equals,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsArray()
  @ArrayUnique()
  @IsIn(['RIDER', 'PARENT'], { each: true })
  capabilities!: Array<'RIDER' | 'PARENT'>;

  @IsBoolean()
  @Equals(true, { message: 'You must confirm you are 18 or older' })
  ageAttested18!: boolean;

  @IsBoolean()
  @Equals(true, { message: 'You must accept the Terms of Service' })
  acceptedTerms!: boolean;

  @IsBoolean()
  @Equals(true, { message: 'You must accept the Privacy Policy' })
  acceptedPrivacy!: boolean;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

export class GoogleAuthDto {
  /** Google ID token (credential) obtained on the client */
  @IsString()
  @MinLength(20)
  idToken!: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;

  // Registration fields — required only when creating a new account via Google
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(['RIDER', 'PARENT'], { each: true })
  capabilities?: Array<'RIDER' | 'PARENT'>;

  @IsOptional()
  @IsBoolean()
  ageAttested18?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptedTerms?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptedPrivacy?: boolean;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  token!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class VerifyEmailDto {
  @IsString()
  @MinLength(20)
  token!: string;
}

export class SwitchTenantDto {
  @IsString()
  tenantId!: string;
}
