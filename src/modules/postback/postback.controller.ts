import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PWAExternalMappingService } from '../pwa-external-mapping/pwa-external-mapping.service';
import { PWAEventLogService } from '../pwa-event-log/pwa-event-log.service';
import { PwaEvent } from '../../schemas/pixel-event.scheme';
import { FacebookService } from '../facebook/facebook.service';
import { PWAContentService } from '../pwa-content/pwa-content.service';

@Controller('postback')
export class PostbackController {
  constructor(
    private readonly mappingService: PWAExternalMappingService,
    private readonly eventLogService: PWAEventLogService,
    private readonly pwaContentService: PWAContentService,
    private readonly facebookService: FacebookService,
  ) {}

  @Get()
  async handlePostback(
    @Query('externalId') externalId: string,
    @Query('event') event: string,
    @Query('value') value: string,
    @Query('currency') currency: string,
  ) {
    if (!externalId || !event) {
      throw new BadRequestException('Missing externalId or event');
    }

    const pwaId = await this.mappingService.findPwaByExternalId(externalId);

    if (!pwaId) {
      throw new BadRequestException(
        `No PWA found for externalId=${externalId}`,
      );
    }

    let pwaEvent: PwaEvent;

    switch (event) {
      case 'reg':
        pwaEvent = PwaEvent.Registration;
        break;
      case 'dep':
        pwaEvent = PwaEvent.Deposit;
        break;
      default:
        throw new BadRequestException(`Invalid event: ${event}`);
    }

    const numericValue = value ? parseFloat(value) : undefined;

    const loggedEvent = await this.eventLogService.logEvent(
      pwaId,
      pwaEvent,
      externalId,
      numericValue,
      currency,
    );

    const pwaContent = await this.pwaContentService.findOneTrusted(pwaId);

    if (!pwaContent) {
      throw new BadRequestException(`PWAContent not found for _id=${pwaId}`);
    }

    if (pwaContent.pixel && pwaContent.pixel.length > 0) {
      for (const px of pwaContent.pixel) {
        const pixelEvent = px.events.find(
          ({ triggerEvent }) => triggerEvent === pwaEvent,
        );

        if (pixelEvent) {
          await this.facebookService.sendEventToFacebook(
            px.pixelId,
            px.token,
            pixelEvent.sentEvent,
            numericValue,
            currency,
            externalId,
          );
        } else {
          throw new BadRequestException(
            `Event was not found in the pixel, event: ${event}`,
          );
        }
      }
    }

    return {
      status: 'ok',
      eventLogged: loggedEvent,
    };
  }
}
