import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PostbackEvent,
  PWAExternalMapping,
} from '../../schemas/pwa-external-mapping.scheme';

import { Sha256 } from '@aws-crypto/sha256-js';

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
            em: [await this.hashData(mapping.email)],
            ph: [await this.hashData(mapping.phone)],
            fbp: mapping.fbp,
            fbc: mapping.fbc,
            country: [await this.hashData(mapping.country)],
            fn: [await this.hashData(mapping.firstName)],
            ln: [await this.hashData(mapping.lastName)],
            db: [await this.hashData(mapping.dob)],
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
      Logger.error('Facebook CAPI error:', error);
      throw error;
    }
  }

  private async hashData(data?: string) {
    if (data) {
      const hash = new Sha256();
      hash.update(data.trim().toLowerCase());
      const result = await hash.digest();
      return Buffer.from(result).toString('hex');
    } else {
      return undefined;
    }
  }
}
