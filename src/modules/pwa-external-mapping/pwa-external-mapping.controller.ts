import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PWAExternalMappingService } from './pwa-external-mapping.service';

@Controller('pwa-external-mapping')
export class PWAExternalMappingController {
  constructor(private readonly mappingService: PWAExternalMappingService) {}

  @Post()
  async saveMapping(
    @Body()
    body: {
      externalId: string;
      pwaContentId: string;
      domain: string;
      ip: string;
      userAgent: string;
    },
  ): Promise<{ status: string }> {
    const { externalId, pwaContentId, domain, ip, userAgent } = body;

    if (!externalId || !pwaContentId || !domain || !ip || !userAgent) {
      throw new BadRequestException('Missing required params');
    }

    await this.mappingService.saveMapping(
      externalId,
      pwaContentId,
      domain,
      ip,
      userAgent,
    );

    return { status: 'success' };
  }
}
