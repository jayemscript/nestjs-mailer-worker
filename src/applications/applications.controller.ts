import { Body, Controller, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { CommonResponseDto } from '../common/dtos/common-response.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationsService } from './applications.service';
import { Application } from './schemas/application.schema';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Applications')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an application identity' })
  async create(
    @Body() dto: CreateApplicationDto,
  ): Promise<CommonResponseDto<Application>> {
    const data = await this.applicationsService.create(dto);
    return { status: HttpStatus.CREATED, message: 'Application created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List applications' })
  async findAll(): Promise<CommonResponseDto<Application[]>> {
    const data = await this.applicationsService.findAll();
    return { status: HttpStatus.OK, message: 'Applications retrieved', data };
  }

  @Patch(':appId')
  @ApiOperation({ summary: 'Update an application or deactivate it' })
  async update(
    @Param('appId') appId: string,
    @Body() dto: UpdateApplicationDto,
  ): Promise<CommonResponseDto<Application>> {
    const data = await this.applicationsService.update(appId, dto);
    return { status: HttpStatus.OK, message: 'Application updated', data };
  }
}
