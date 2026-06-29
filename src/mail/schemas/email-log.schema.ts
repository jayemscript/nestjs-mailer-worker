//src/mail/schemas/email-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EmailStatus } from 'src/common/enums/email-status.enum';
import { ProviderType } from 'src/common/enums/provider-type.enum';

export type EmailLogDocument = EmailLog & Document;

@Schema({ timestamps: true, collection: 'email_logs' })
export class EmailLog {
  @Prop({ required: true })
  to!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true, enum: ProviderType })
  provider!: ProviderType;

  @Prop({ required: true, enum: EmailStatus, default: EmailStatus.PENDING })
  status!: EmailStatus;

  @Prop({ required: false })
  errorMessage?: string;

  @Prop({ required: false })
  from?: string;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
