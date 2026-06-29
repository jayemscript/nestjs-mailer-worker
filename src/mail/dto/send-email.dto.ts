//src/mail/dto/send-email.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { MESSAGES } from 'src/common/constants/message.constant';
import { REGEX } from 'src/common/constants/regex.constants';

export class SendEmailDto {
  @IsEmail({}, { message: MESSAGES.VALIDATION.INVALID_EMAIL })
  to!: string;

  @IsString({ message: MESSAGES.VALIDATION.SUBJECT_REQUIRED })
  subject!: string;

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