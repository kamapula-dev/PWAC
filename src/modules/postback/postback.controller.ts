import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PWAExternalMappingService } from '../pwa-external-mapping/pwa-external-mapping.service';
import { PWAEventLogService } from '../pwa-event-log/pwa-event-log.service';
import { PwaEvent } from '../../schemas/pixel-event.scheme';
import { FacebookService } from '../facebook/facebook.service';
import { PWAContentService } from '../pwa-content/pwa-content.service';
import { UserService } from '../user/user.service';

@Controller('postback')
export class PostbackController {
  constructor(
    private readonly mappingService: PWAExternalMappingService,
    private readonly eventLogService: PWAEventLogService,
    private readonly pwaContentService: PWAContentService,
    private readonly facebookService: FacebookService,
    private readonly userService: UserService,
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

    const pwaContentId =
      await this.mappingService.findPwaByExternalId(externalId);

    if (!pwaContentId) {
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

    const pwaContent =
      await this.pwaContentService.findOneTrusted(pwaContentId);

    if (!pwaContent) {
      throw new BadRequestException(
        `PWAContent not found for _id=${pwaContentId}`,
      );
    }

    const user = await this.userService.findById(pwaContent.user.toString());
    const existingPwa = user.pwas.find((p) => p.pwaContentId === pwaContentId);

    const loggedEvent = await this.eventLogService.logEvent(
      pwaContentId,
      existingPwa.domainName,
      pwaEvent,
      externalId,
      numericValue,
      currency,
    );

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