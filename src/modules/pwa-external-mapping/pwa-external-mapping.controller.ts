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
      userAgent: string;
      ip?: string;
      country?: string;
      dob?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
    },
  ): Promise<{ status: string }> {
    const {
      externalId,
      pwaContentId,
      ip,
      domain,
      userAgent,
      country,
      dob,
      firstName,
      lastName,
      phone,
      email,
    } = body;

    if (!externalId || !pwaContentId || !domain || !userAgent) {
      throw new BadRequestException('Missing required params');
    }

    await this.mappingService.saveMapping(
      externalId,
      pwaContentId,
      domain,
      userAgent,
      ip,
      country,
      dob,
      firstName,
      lastName,
      phone,
      email,
    );

    return { status: 'success' };
  }
}
