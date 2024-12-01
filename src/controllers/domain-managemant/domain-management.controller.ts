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
      gApiKey: string;
      domain: string;
    },
  ) {
    const { email, gApiKey, domain } = body;

    if (!email || !gApiKey || !domain) {
      throw new HttpException(
        'Missing required parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.domainService.addDomain(email, gApiKey, domain);
  }
}
