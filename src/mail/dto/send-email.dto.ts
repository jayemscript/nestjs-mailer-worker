//src/mail/dto/send-email.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { MESSAGES } from '../../common/constants/message.constant';
import { REGEX } from '../../common/constants/regex.constants';
import { ProviderType } from '../../common/enums/provider-type.enum';

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @IsEmail({}, { message: MESSAGES.VALIDATION.INVALID_EMAIL })
  to!: string;

  @IsString({ message: MESSAGES.VALIDATION.SUBJECT_REQUIRED })
  subject!: string;

  @IsOptional()
  @IsEnum(ProviderType, {
    message: `provider must be one of: ${Object.values(ProviderType).join(', ')}`,
  })
  provider?: ProviderType;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @Matches(REGEX.EMAIL, { message: MESSAGES.VALIDATION.INVALID_EMAIL })
  from?: string;
}
