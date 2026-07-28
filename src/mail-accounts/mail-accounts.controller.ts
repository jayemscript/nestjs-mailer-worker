import { Body, Controller, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CommonResponseDto } from '../common/dtos/common-response.dto';
import { CreateMailAccountDto } from './dto/create-mail-account.dto';
import { UpdateMailAccountDto } from './dto/update-mail-account.dto';
import { MailAccountResponse, MailAccountsService } from './mail-accounts.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Mail accounts')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('mail-accounts')
export class MailAccountsController {
  constructor(private readonly mailAccountsService: MailAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an encrypted SMTP mail account and share it with applications' })
  async create(@Body() dto: CreateMailAccountDto): Promise<CommonResponseDto<MailAccountResponse>> {
    const data = await this.mailAccountsService.create(dto);
    return { status: HttpStatus.CREATED, message: 'Mail account created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List mail accounts without credentials' })
  async findAll(): Promise<CommonResponseDto<MailAccountResponse[]>> {
    const data = await this.mailAccountsService.findAll();
    return { status: HttpStatus.OK, message: 'Mail accounts retrieved', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mail-account metadata without credentials' })
  async findOne(@Param('id') id: string): Promise<CommonResponseDto<MailAccountResponse>> {
    const data = await this.mailAccountsService.findOne(id);
    return { status: HttpStatus.OK, message: 'Mail account retrieved', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mail-account metadata, access, status, or credentials' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMailAccountDto,
  ): Promise<CommonResponseDto<MailAccountResponse>> {
    const data = await this.mailAccountsService.update(id, dto);
    return { status: HttpStatus.OK, message: 'Mail account updated', data };
  }
}
