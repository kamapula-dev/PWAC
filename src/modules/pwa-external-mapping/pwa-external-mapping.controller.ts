import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PWAExternalMappingService } from './pwa-external-mapping.service';

@Controller('external-mapping')
export class PWAExternalMappingController {
  constructor(private readonly mappingService: PWAExternalMappingService) {}

  @Post()
  async saveMapping(
    @Body() body: { externalId: string; pwaId: string },
  ): Promise<{ status: string }> {
    const { externalId, pwaId } = body;

    if (!externalId || !pwaId) {
      throw new BadRequestException('Missing externalId or pwaId');
    }

    await this.mappingService.saveMapping(externalId, pwaId);

    return { status: 'success' };
  }
}
