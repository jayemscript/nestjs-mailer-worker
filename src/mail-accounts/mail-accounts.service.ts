import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ApplicationsService } from '../applications/applications.service';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { ProviderType } from '../common/enums/provider-type.enum';
import { CredentialEncryptionService } from './credential-encryption.service';
import { CreateMailAccountDto } from './dto/create-mail-account.dto';
import { SmtpCredentialsDto } from './dto/smtp-credentials.dto';
import { UpdateMailAccountDto } from './dto/update-mail-account.dto';
import { MailAccount, MailAccountDocument } from './schemas/mail-account.schema';

export interface MailAccountResponse {
  id: string;
  name: string;
  description?: string | null;
  provider: ProviderType;
  appIds: string[];
  status: ApplicationStatus;
}

export interface ResolvedMailAccount {
  id: string;
  provider: ProviderType;
  credentials: SmtpCredentialsDto;
}

@Injectable()
export class MailAccountsService {
  constructor(
    @InjectModel(MailAccount.name)
    private readonly mailAccountModel: Model<MailAccountDocument>,
    private readonly applicationsService: ApplicationsService,
    private readonly encryptionService: CredentialEncryptionService,
  ) {}

  async create(dto: CreateMailAccountDto): Promise<MailAccountResponse> {
    this.assertSmtpProvider(dto.provider);
    const appIds = this.uniqueAppIds(dto.appIds);
    await this.assertApplicationsExist(appIds);

    const account = await this.mailAccountModel.create({
      name: dto.name,
      description: dto.description,
      provider: ProviderType.SMTP,
      appIds,
      status: dto.status ?? ApplicationStatus.ACTIVE,
      encryptedCredentials: this.encryptionService.encrypt(dto.credentials),
    });
    return this.toResponse(account);
  }

  async findAll(): Promise<MailAccountResponse[]> {
    const accounts = await this.mailAccountModel.find().sort({ createdAt: -1 }).exec();
    return accounts.map((account) => this.toResponse(account));
  }

  async findOne(id: string): Promise<MailAccountResponse> {
    const account = await this.findDocument(id);
    return this.toResponse(account);
  }

  async update(id: string, dto: UpdateMailAccountDto): Promise<MailAccountResponse> {
    this.assertValidId(id);
    const update: Partial<MailAccount> = {};
    if (dto.name !== undefined) {
      update.name = dto.name;
    }
    if (dto.description !== undefined) {
      update.description = dto.description;
    }
    if (dto.status !== undefined) {
      update.status = dto.status;
    }

    if (dto.appIds) {
      update.appIds = this.uniqueAppIds(dto.appIds);
      await this.assertApplicationsExist(update.appIds);
    }
    if (dto.credentials) {
      update.encryptedCredentials = this.encryptionService.encrypt(dto.credentials);
    }

    const account = await this.mailAccountModel
      .findByIdAndUpdate(id, update, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();
    if (!account) {
      throw new NotFoundException(`Mail account does not exist: ${id}`);
    }
    return this.toResponse(account);
  }

  async resolveForApplication(id: string, appId: string): Promise<ResolvedMailAccount> {
    this.assertValidId(id);
    const account = await this.mailAccountModel.findById(id).select('+encryptedCredentials').exec();
    if (!account) {
      throw new NotFoundException(`Mail account does not exist: ${id}`);
    }
    if (account.status !== ApplicationStatus.ACTIVE) {
      throw new BadRequestException(`Mail account is deactivated: ${id}`);
    }
    if (!account.appIds.includes(appId)) {
      throw new BadRequestException(`Mail account ${id} is not available to application: ${appId}`);
    }
    if (account.provider !== ProviderType.SMTP) {
      throw new BadRequestException(`Mail account provider is not supported: ${account.provider}`);
    }

    return {
      id: account._id.toString(),
      provider: account.provider,
      credentials: this.encryptionService.decrypt(account.encryptedCredentials),
    };
  }

  private async assertApplicationsExist(appIds: string[]): Promise<void> {
    await Promise.all(appIds.map((appId) => this.applicationsService.assertExists(appId)));
  }

  private uniqueAppIds(appIds: string[]): string[] {
    const uniqueAppIds = [...new Set(appIds.map((appId) => appId.trim()).filter(Boolean))];
    if (!uniqueAppIds.length) {
      throw new BadRequestException('At least one application appId is required');
    }
    return uniqueAppIds;
  }

  private assertSmtpProvider(provider?: ProviderType): void {
    if (provider && provider !== ProviderType.SMTP) {
      throw new BadRequestException('Database mail accounts currently support only the smtp provider');
    }
  }

  private async findDocument(id: string): Promise<MailAccountDocument> {
    this.assertValidId(id);
    const account = await this.mailAccountModel.findById(id).exec();
    if (!account) {
      throw new NotFoundException(`Mail account does not exist: ${id}`);
    }
    return account;
  }

  private toResponse(account: MailAccountDocument): MailAccountResponse {
    return {
      id: account._id.toString(),
      name: account.name,
      description: account.description,
      provider: account.provider,
      appIds: account.appIds,
      status: account.status,
    };
  }

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid mail account ID: ${id}`);
    }
  }
}
