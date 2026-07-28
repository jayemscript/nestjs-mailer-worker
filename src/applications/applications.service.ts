import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application, ApplicationDocument } from './schemas/application.schema';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,
  ) {}

  async create(dto: CreateApplicationDto): Promise<Application> {
    const existing = await this.applicationModel.exists({ appId: dto.appId });
    if (existing) {
      throw new ConflictException(`Application already exists: ${dto.appId}`);
    }

    try {
      return await this.applicationModel.create({
        ...dto,
        status: dto.status ?? ApplicationStatus.ACTIVE,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(`Application already exists: ${dto.appId}`);
      }
      throw error;
    }
  }

  async findAll(): Promise<Application[]> {
    return this.applicationModel.find().sort({ createdAt: -1 }).exec();
  }

  async update(appId: string, dto: UpdateApplicationDto): Promise<Application> {
    const application = await this.applicationModel
      .findOneAndUpdate(
        { appId },
        dto,
        { returnDocument: 'after', runValidators: true },
      )
      .exec();
    if (!application) {
      throw new NotFoundException(`Application does not exist: ${appId}`);
    }
    return application;
  }

  async assertActive(appId: string): Promise<void> {
    const application = await this.findByAppId(appId);
    if (application.status !== ApplicationStatus.ACTIVE) {
      throw new ForbiddenException(`Application is deactivated: ${appId}`);
    }
  }

  async assertExists(appId: string): Promise<void> {
    await this.findByAppId(appId);
  }

  private async findByAppId(appId: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findOne({ appId }).exec();
    if (!application) {
      throw new NotFoundException(`Application does not exist: ${appId}`);
    }
    return application;
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
