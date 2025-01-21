import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PostbackEvent,
  PWAExternalMapping,
} from '../../schemas/pwa-external-mapping.scheme';
import SHA256 from 'crypto-js/sha256';

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
            email: this.hashData(mapping.email),
            phone: this.hashData(mapping.phone),
            fbp: mapping.fbp,
            fbc: mapping.fbc,
            country: mapping.country
              ? this.hashData(mapping.country)
              : undefined,
            first_name: this.hashData(mapping.firstName),
            last_name: this.hashData(mapping.lastName),
            dob: this.hashData(mapping.dob),
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

  private hashData(data: string) {
    return SHA256(data).toString();
  }
}
