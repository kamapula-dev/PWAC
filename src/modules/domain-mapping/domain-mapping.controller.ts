import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { DomainMappingService } from './domain-mapping.service';
import { DomainMapping } from '../../schemas/domain-mapping.scheme';
import { AuthGuard } from '@nestjs/passport';

@Controller('domain-mapping')
export class DomainMappingController {
  constructor(private readonly domainMappingService: DomainMappingService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addDomainMapping(
    @Body()
    body: {
      domainName: string;
      pwaId: string;
      userId: string;
      zoneId: string;
    },
  ): Promise<DomainMapping> {
    const { domainName, pwaId, userId, zoneId } = body;

    return this.domainMappingService.addDomainMapping(
      domainName,
      pwaId,
      userId,
      zoneId,
    );
  }

  @Get(':domainName')
  async getMappingByDomain(
    @Param('domainName') domainName: string,
  ): Promise<DomainMapping> {
    return await this.domainMappingService.getMappingByDomain(domainName);
  }
}
