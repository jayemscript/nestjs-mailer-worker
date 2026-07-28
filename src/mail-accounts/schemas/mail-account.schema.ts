import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { ProviderType } from '../../common/enums/provider-type.enum';

export type MailAccountDocument = MailAccount & Document;

@Schema({ timestamps: true, collection: 'mail_accounts' })
export class MailAccount {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: false, type: String, default: null, trim: true })
  description?: string | null;

  @Prop({ required: true, enum: ProviderType, default: ProviderType.SMTP })
  provider!: ProviderType;

  @Prop({ required: true, type: [String], index: true })
  appIds!: string[];

  @Prop({ required: true, enum: ApplicationStatus, default: ApplicationStatus.ACTIVE })
  status!: ApplicationStatus;

  @Prop({ required: true, select: false })
  encryptedCredentials!: string;
}

export const MailAccountSchema = SchemaFactory.createForClass(MailAccount);
