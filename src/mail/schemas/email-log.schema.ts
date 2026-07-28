import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EmailStatus } from '../../common/enums/email-status.enum';
import { ProviderType } from '../../common/enums/provider-type.enum';

export type EmailLogDocument = EmailLog & Document;

@Schema({ timestamps: true, collection: 'mail_logs' })
export class EmailLog {
  @Prop({ required: true })
  appId!: string;

  @Prop({ required: true })
  to!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: false, type: String })
  html?: string;

  @Prop({ required: false, type: String })
  text?: string;

  @Prop({ required: true, enum: ProviderType })
  provider!: ProviderType;

  @Prop({
    required: true,
    enum: EmailStatus,
    default: EmailStatus.PENDING,
  })
  status!: EmailStatus;

  @Prop({ required: false })
  errorMessage?: string;

  @Prop({ required: false })
  from?: string;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
