import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
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

  @Get('stats')
  async getStats(
    @Query('pwaContentId') pwaContentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('event') event?: PwaEvent,
  ): Promise<{
    opens: number;
    installs: number;
    registrations: number;
    deposits: number;
  }> {
    if (!pwaContentId) {
      throw new BadRequestException('pwaContentId is required');
    }

    return this.eventLogService.getEventStats(
      pwaContentId,
      startDate,
      endDate,
      event,
    );
  }
}
