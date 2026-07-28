import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SendEmailDto } from './send-email.dto';

export class SendBulkEmailDto {
  @ApiProperty({ type: () => SendEmailDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SendEmailDto)
  emails!: SendEmailDto[];
}
