import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { SmtpCredentialsDto } from './smtp-credentials.dto';

export class UpdateMailAccountDto {
  @ApiPropertyOptional({ example: 'GoDaddy Support' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Shared customer support mailbox' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['meal-guides-api', 'admin-api'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appIds?: string[];

  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ type: () => SmtpCredentialsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SmtpCredentialsDto)
  credentials?: SmtpCredentialsDto;
}
