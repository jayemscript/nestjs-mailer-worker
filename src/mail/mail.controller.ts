//src/mail/mail.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/send-email.dto';
import { CommonResponseDto } from 'src/common/dtos/common-response.dto';
import { MESSAGES } from 'src/common/constants/message.constant';
import { EmailLog } from './schemas/email-log.schema';

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