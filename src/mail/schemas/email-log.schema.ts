import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EmailStatus } from '../../common/enums/email-status.enum';
import { ProviderType } from '../../common/enums/provider-type.enum';
import { EmailOrigin } from '../../common/enums/email-origin.enum';

export type EmailLogDocument = EmailLog & Document;

@Schema({ timestamps: true, collection: 'mail_logs' })
export class EmailLog {
  @Prop({ required: true })
  appId!: string;

  @Prop({ required: true, enum: EmailOrigin })
  origin!: EmailOrigin;

  @Prop({ required: false, type: String, default: null })
  userId?: string | null;

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

  @Prop({ required: false, type: String })
  mailAccountId?: string;

  @Prop({
    required: true,
    enum: EmailStatus,
    default: EmailStatus.PENDING,
  })
  status!: EmailStatus;

  @Prop({ required: false })
  errorMessage?: string;

  @Prop({ required: false })
  providerMessageId?: string;

  @Prop({ required: false, type: [String] })
  acceptedRecipients?: string[];

  @Prop({ required: false, type: [String] })
  rejectedRecipients?: string[];

  @Prop({ required: false })
  providerResponse?: string;

  @Prop({ required: false })
  from?: string;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
