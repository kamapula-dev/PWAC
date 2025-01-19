import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FacebookService {
  constructor(private readonly httpService: HttpService) {}

  async sendEventToFacebook(
    pixelId: string,
    accessToken: string,
    eventName: string,
    value?: number,
    currency?: string,
    externalId?: string,
  ) {
    const url = `https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`;

    const data = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          ...(value && currency ? { metadata: { value, currency } } : {}),
        },
      ],
    };

    try {
      const response = await firstValueFrom(this.httpService.post(url, data));
      return response.data;
    } catch (error) {
      console.error(
        'Facebook CAPI error:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }
}
