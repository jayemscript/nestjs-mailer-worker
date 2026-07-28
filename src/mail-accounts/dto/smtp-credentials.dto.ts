import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { REGEX } from '../../common/constants/regex.constants';

export class SmtpCredentialsDto {
  @ApiProperty({ example: 'smtpout.secureserver.net' })
  @IsString()
  @IsNotEmpty()
  host!: string;

  @ApiProperty({ example: 465 })
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  secure!: boolean;

  @ApiProperty({ example: 'support@example.com' })
  @IsEmail()
  user!: string;

  @ApiProperty({ example: 'mailbox-password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  pass!: string;

  @ApiPropertyOptional({ example: 'The Meal Guides Team <connect@themealguides.com>' })
  @IsOptional()
  @Matches(REGEX.EMAIL_FROM, {
    message: 'from must be an email or a display name with an email address',
  })
  from?: string;
}
