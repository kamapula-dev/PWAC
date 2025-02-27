import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Patch,
  NotFoundException,
} from '@nestjs/common';
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
      language?: string;
      dob?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      offerUrl?: string;
    },
  ): Promise<{ status: string }> {
    const {
      externalId,
      pwaContentId,
      ip,
      domain,
      userAgent,
      country,
      language,
      dob,
      firstName,
      lastName,
      phone,
      email,
      offerUrl,
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
      language,
      dob,
      firstName,
      lastName,
      phone,
      email,
      offerUrl,
    );

    return { status: 'success' };
  }

  @Patch()
  async updatePushToken(
    @Body()
    body: {
      externalId: string;
      pushToken: string;
    },
  ): Promise<{ status: string }> {
    const { externalId, pushToken } = body;

    if (!(externalId && pushToken)) {
      throw new BadRequestException('Missing required params');
    }

    const updatedMapping = await this.mappingService.updatePushToken(
      externalId,
      pushToken,
    );

    if (!updatedMapping) {
      throw new NotFoundException('Mapping not found');
    }

    return { status: 'success' };
  }
}
