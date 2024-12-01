import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DomainMappingService } from './domain-mapping.service';
import { DomainMapping } from '../../schemas/domain-mapping.scheme';
import { AuthGuard } from '@nestjs/passport';

@Controller('domain-mapping')
export class DomainMappingController {
  constructor(private readonly domainMappingService: DomainMappingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addDomainMapping(
    @Body() body: { domainName: string; pwaId: string; userId: string },
  ): Promise<DomainMapping> {
    const { domainName, pwaId, userId } = body;
    return await this.domainMappingService.addDomainMapping(
      domainName,
      pwaId,
      userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':domainName')
  async removeDomainMapping(
    @Param('domainName') domainName: string,
  ): Promise<void> {
    await this.domainMappingService.removeDomainMapping(domainName);
  }

  @Get(':domainName')
  async getMappingByDomain(
    @Param('domainName') domainName: string,
  ): Promise<DomainMapping> {
    return await this.domainMappingService.getMappingByDomain(domainName);
  }
}
