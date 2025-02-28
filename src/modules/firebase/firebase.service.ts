import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseApp: admin.app.App,
  ) {}

  async sendPushToMultipleDevices(
    tokens: string[],
    payloads: {
      title: string;
      body: string;
      color?: string;
      badge?: string;
      icon?: string;
      picture?: string;
      url?: string;
    }[],
  ) {
    if (tokens.length !== payloads.length) {
      return { success: false, message: 'Tokens and payloads count mismatch' };
    }

    const messages: admin.messaging.Message[] = tokens.map((token, index) => {
      const payload = payloads[index];

      return {
        token,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon,
            badge: payload.badge,
            image: payload.picture,
            data: {
              url: payload.url,
            },
          },
        },
        data: {
          url: payload.url,
        },
      };
    });

    try {
      const response = await this.firebaseApp.messaging().sendEach(messages);
      return {
        success: true,
        response: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          responses: response.responses,
        },
      };
    } catch (error) {
      console.error('PWA Push Error:', error);
      return { success: false, error };
    }
  }
}
