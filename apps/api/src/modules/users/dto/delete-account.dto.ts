import { Equals, IsString } from 'class-validator';

export class DeleteAccountDto {
  /** User must type DELETE to confirm irreversible account deletion (App Store 5.1.1v). */
  @IsString()
  @Equals('DELETE', { message: 'Type DELETE to confirm account deletion' })
  confirmation!: string;
}
