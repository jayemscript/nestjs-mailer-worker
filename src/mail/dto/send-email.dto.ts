import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MESSAGES } from '../../common/constants/message.constant';
import { REGEX } from '../../common/constants/regex.constants';
import { ProviderType } from '../../common/enums/provider-type.enum';
import { EmailOrigin } from '../../common/enums/email-origin.enum';

export class SendEmailDto {
  @ApiProperty({ example: 'meal-guides-api' })
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @ApiProperty({ enum: EmailOrigin, example: EmailOrigin.SYSTEM })
  @IsEnum(EmailOrigin, {
    message: `origin must be one of: ${Object.values(EmailOrigin).join(', ')}`,
  })
  origin!: EmailOrigin;

  @ApiPropertyOptional({ example: 'user_123', description: 'Required when origin is user' })
  @ValidateIf((dto: SendEmailDto) => dto.origin === EmailOrigin.USER)
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail({}, { message: MESSAGES.VALIDATION.INVALID_EMAIL })
  to!: string;

  @ApiProperty({ example: 'Welcome to The Meal Guides' })
  @IsString({ message: MESSAGES.VALIDATION.SUBJECT_REQUIRED })
  subject!: string;

  @ApiPropertyOptional({ enum: ProviderType, example: ProviderType.SMTP })
  @IsOptional()
  @IsEnum(ProviderType, {
    message: `provider must be one of: ${Object.values(ProviderType).join(', ')}`,
  })
  provider?: ProviderType;

  @ApiPropertyOptional({ description: 'MongoDB mail account ID authorized for appId' })
  @IsOptional()
  @IsString()
  mailAccountId?: string;

  @ApiPropertyOptional({ example: '<p>Welcome</p>' })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ example: 'Welcome' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ example: 'The Meal Guides Team <connect@themealguides.com>' })
  @IsOptional()
  @Matches(REGEX.EMAIL_FROM, {
    message: 'from must be an email or a display name with an email address',
  })
  from?: string;
}
