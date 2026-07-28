import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export class UpdateApplicationDto {
  @ApiPropertyOptional({ example: 'The Meal Guides API' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Handles customer meal plans.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
