import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Query,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PWAEventLogService } from './pwa-event-log.service';
import { PwaEvent } from '../../schemas/pixel-event.scheme';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Get('stats/all')
  async getStatsForAllPwas(
    @Request() req,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Query('event') event?: PwaEvent,
  ) {
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

    const user = req.user;

    if (!user || !user.pwas || user.pwas.length === 0) {
      throw new NotFoundException('No PWAs found for this user');
    }

    const statsPromises = user.pwas.map((pwa) =>
      this.eventLogService
        .getEventStats(pwa.pwaContentId, startDate, endDate, event)
        .then((stats) => ({
          pwaContentId: pwa.pwaContentId,
          stats,
        })),
    );

    return Promise.all(statsPromises);
  }
}
