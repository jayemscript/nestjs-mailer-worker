import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ApplicationsService } from '../../applications/applications.service';

@Injectable()
export class ApplicationIdGuard implements CanActivate {
  constructor(private readonly applicationsService: ApplicationsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const appIds = this.getAppIds(request);

    await Promise.all(appIds.map((appId) => this.applicationsService.assertActive(appId)));
    return true;
  }

  private getAppIds(request: Request): string[] {
    const body = request.body as { appId?: string; emails?: Array<{ appId?: string }> };
    const appIds = Array.isArray(body?.emails)
      ? body.emails.map((email) => email.appId).filter((appId): appId is string => Boolean(appId))
      : [body?.appId ?? request.params.appId].filter((appId): appId is string => Boolean(appId));

    return [...new Set(appIds)];
  }
}
