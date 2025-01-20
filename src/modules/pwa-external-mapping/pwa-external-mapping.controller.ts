import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PWAExternalMappingService } from './pwa-external-mapping.service';

@Controller('pwa-external-mapping')
export class PWAExternalMappingController {
  constructor(private readonly mappingService: PWAExternalMappingService) {}

  @Post()
  async saveMapping(
    @Body() body: { externalId: string; pwaContentId: string; domain: string },
  ): Promise<{ status: string }> {
    const { externalId, pwaContentId, domain } = body;

    if (!externalId || !pwaContentId || !domain) {
      throw new BadRequestException(
        'Missing externalId, pwaContentId or domain',
      );
    }

    await this.mappingService.saveMapping(externalId, pwaContentId, domain);

    return { status: 'success' };
  }
}
