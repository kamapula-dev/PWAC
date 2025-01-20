import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PWAEventLogService } from './pwa-event-log.service';
import { PwaEvent } from '../../schemas/pixel-event.scheme';

@Controller('pwa-event-log')
export class PWAEventLogController {
  constructor(private readonly eventLogService: PWAEventLogService) {}

  @Post()
  async logEvent(
    @Body()
    body: {
      pwaContentId: string;
      domain: string;
      externalId?: string;
      event: PwaEvent;
      value?: number;
      currency?: string;
    },
  ): Promise<{ status: string }> {
    const { domain, pwaContentId, externalId, event, value, currency } = body;

    if (!pwaContentId || !event) {
      throw new BadRequestException(
        'Missing required fields: pwaId, externalId, or event',
      );
    }

    await this.eventLogService.logEvent(
      pwaContentId,
      domain,
      event,
      externalId,
      value,
      currency,
    );

    return { status: 'success' };
  }
}
