import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DomainManagementService } from './domain-management.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('domains')
export class DomainManagementController {
  constructor(private readonly domainService: DomainManagementService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  async addDomain(
    @Body()
    body: {
      email: string;
      gApiKey: string;
      domain: string;
      pwaId: string;
    },
    @Request() req,
  ) {
    const userId = req.user._id;
    const { email, gApiKey, domain, pwaId } = body;

    if (!email || !gApiKey || !domain) {
      throw new HttpException(
        'Missing required parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.domainService.addDomain(
      email,
      gApiKey,
      domain,
      pwaId,
      userId,
    );
  }
}
