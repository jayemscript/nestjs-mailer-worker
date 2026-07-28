//src/mail/mail.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
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
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { ApplicationIdGuard } from '../common/guards/application-id.guard';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Mail')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send one email' })
  @UseGuards(ApplicationIdGuard)
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendEmailDto): Promise<CommonResponseDto<EmailLog>> {
    const data = await this.mailService.send(dto);
    return {
      status: HttpStatus.OK,
      message: MESSAGES.SUCCESS.EMAIL_SENT,
      data,
    };
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send up to 100 emails' })
  @UseGuards(ApplicationIdGuard)
  @HttpCode(HttpStatus.OK)
  async sendBulk(
    @Body() dto: SendBulkEmailDto,
  ): Promise<CommonResponseDto<EmailLog[]>> {
    const data = await this.mailService.sendBulk(dto.emails);
    return { status: HttpStatus.OK, message: MESSAGES.SUCCESS.EMAIL_SENT, data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all email logs' })
  async findAll(): Promise<CommonResponseDto<EmailLog[]>> {
    const data = await this.mailService.findAll();
    return { status: HttpStatus.OK, message: 'Email logs retrieved', data };
  }

  @Get('app/:appId')
  @ApiOperation({ summary: 'Get all email logs for an application' })
  @UseGuards(ApplicationIdGuard)
  async findByAppId(@Param('appId') appId: string): Promise<CommonResponseDto<EmailLog[]>> {
    const data = await this.mailService.findByAppId(appId);
    return { status: HttpStatus.OK, message: 'Email logs retrieved', data };
  }

  @Get('app/:appId/user/:userId')
  @ApiOperation({ summary: 'Get user-originated email logs for an application and user' })
  @UseGuards(ApplicationIdGuard)
  async findByAppIdAndUserId(
    @Param('appId') appId: string,
    @Param('userId') userId: string,
  ): Promise<CommonResponseDto<EmailLog[]>> {
    const data = await this.mailService.findByAppIdAndUserId(appId, userId);
    return { status: HttpStatus.OK, message: 'Email logs retrieved', data };
  }
}
