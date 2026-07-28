import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export class CreateApplicationDto {
  @ApiProperty({ example: 'meal-guides-api' })
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @ApiProperty({ example: 'The Meal Guides API' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Handles customer meal plans.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, default: ApplicationStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
