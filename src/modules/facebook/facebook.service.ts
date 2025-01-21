import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FacebookService {
  constructor(private readonly httpService: HttpService) {}

  async sendEventToFacebook(
    pixelId: string,
    accessToken: string,
    eventName: string,
    external_id: string,
    ip: string,
    userAgent: string,
    value?: number,
    currency?: string,
  ) {
    const url = `https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`;

    const data = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            external_id,
            client_ip_address: ip,
            client_user_agent: userAgent,
          },
          ...(value && currency
            ? {
                custom_data: {
                  value,
                  currency,
                },
              }
            : {}),
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
}
