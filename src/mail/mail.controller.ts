//src/mail/mail.controller.ts
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/send-email.dto';
import { CommonResponseDto } from '../common/dtos/common-response.dto';
import { MESSAGES } from '../common/constants/message.constant';
import { EmailLog } from './schemas/email-log.schema';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendEmailDto): Promise<CommonResponseDto<EmailLog>> {
    const data = await this.mailService.send(dto);
    return {
      status: HttpStatus.OK,
      message: MESSAGES.SUCCESS.EMAIL_SENT,
      data,
    };
  }
}
