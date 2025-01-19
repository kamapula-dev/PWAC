import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { DomainManagementService } from './domain-management.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';

@Controller('domains')
export class DomainManagementController {
  constructor(
    private readonly domainService: DomainManagementService,
    private readonly userService: UserService,
  ) {}

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

    if (!(email && gApiKey && domain)) {
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

  @Post('check-addition')
  async checkDomainAddition(
    @Body()
    body: {
      email: string;
      gApiKey: string;
      domain: string;
    },
  ): Promise<{ canBeAdded: boolean; message: string }> {
    const { email, gApiKey, domain } = body;

    if (!(email && gApiKey && domain)) {
      throw new HttpException(
        'Missing required parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.domainService.checkDomainAddition(email, gApiKey, domain);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/check-status')
  async checkDomainStatus(
    @Param('id') pwaId: string,
    @Request() req,
  ): Promise<string> {
    return this.domainService.checkDomainStatus(pwaId, req.user._id);
  }
}
