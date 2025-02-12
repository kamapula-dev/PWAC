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
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('event') event?: PwaEvent,
  ) {
    if (!pwaContentId) {
      throw new BadRequestException('pwaContentId is required');
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      const date = new Date(startDateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid startDate');
      }
      startDate = date;
    }

    if (endDateStr) {
      const date = new Date(endDateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid endDate');
      }
      endDate = date;
    }

    return this.eventLogService.getEventStats(
      pwaContentId,
      startDate,
      endDate,
      event,
    );
  }
}
