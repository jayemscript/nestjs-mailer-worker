import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderType } from '../../common/enums/provider-type.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { SmtpCredentialsDto } from './smtp-credentials.dto';

export class CreateMailAccountDto {
  @ApiProperty({ example: 'GoDaddy Support' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Shared customer support mailbox' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProviderType, default: ProviderType.SMTP })
  @IsOptional()
  @IsEnum(ProviderType)
  provider?: ProviderType;

  @ApiProperty({ type: [String], example: ['meal-guides-api', 'admin-api'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  appIds!: string[];

  @ApiPropertyOptional({ enum: ApplicationStatus, default: ApplicationStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({ type: () => SmtpCredentialsDto })
  @ValidateNested()
  @Type(() => SmtpCredentialsDto)
  credentials!: SmtpCredentialsDto;
}
