import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true, collection: 'applications' })
export class Application {
  @Prop({ required: true, unique: true, index: true, trim: true })
  appId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: false, type: String, default: null, trim: true })
  description?: string | null;

  @Prop({
    required: true,
    enum: ApplicationStatus,
    default: ApplicationStatus.ACTIVE,
  })
  status!: ApplicationStatus;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
