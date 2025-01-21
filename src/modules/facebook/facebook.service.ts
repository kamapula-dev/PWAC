import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PostbackEvent,
  PWAExternalMapping,
} from '../../schemas/pwa-external-mapping.scheme';

@Injectable()
export class FacebookService {
  constructor(private readonly httpService: HttpService) {}

  async sendEventToFacebook(
    postbackEvent: PostbackEvent,
    pixelId: string,
    accessToken: string,
    sentEvent: string,
    mapping: PWAExternalMapping,
    value?: number,
    currency?: string,
  ) {
    const url = `https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`;

    const data = {
      data: [
        {
          event_name: sentEvent,
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            external_id: mapping.externalId,
            client_ip_address: mapping.ip,
            client_user_agent: mapping.userAgent,
            email: this.generateRandomEmail(),
            phone: this.generateRandomPhoneNumber(),
            fbp: mapping.fbp,
            fbc: mapping.fbc,
            country: mapping.country,
          },
          ...(postbackEvent === PostbackEvent.dep && {
            custom_data: {
              value: value ?? 100,
              currency: currency ?? 'USD',
            },
          }),
        },
      ],
    };

    try {
      const response = await firstValueFrom(this.httpService.post(url, data));
      return response.data;
    } catch (error) {
      Logger.error(
        'Facebook CAPI error:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }

  private generateRandomEmail() {
    const randomUsername = Math.random().toString(36).substring(2, 8);
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return `${randomUsername}@${randomDomain}`;
  }

  private generateRandomPhoneNumber() {
    const randomDigits = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    return `+1${randomDigits}`;
  }
}
