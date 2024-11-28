import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DomainManagementService } from './domain-management.service';

@Controller('domains')
export class DomainManagementController {
  constructor(private readonly domainService: DomainManagementService) {}

  @Post('add')
  async addDomain(
    @Body()
    body: {
      email: string;
      apiToken: string;
      domain: string;
      accountId: string;
    },
  ) {
    const { email, apiToken, domain, accountId } = body;

    if (!email || !apiToken || !domain) {
      throw new HttpException(
        'Missing required parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.domainService.addDomain(
      email,
      apiToken,
      domain,
      accountId,
    );
  }
}
