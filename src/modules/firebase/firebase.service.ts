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

      const iconUrl = `${payload.icon}?${Date.now()}`;
      const badgeUrl = `${payload.badge}?${Date.now()}`;
      const imageUrl = payload.picture
        ? `${payload.picture}?${Date.now()}`
        : undefined;

      return {
        token,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: iconUrl,
            badge: badgeUrl,
            image: imageUrl,
            requireInteraction: true,
            data: {
              url: payload.url,
            },
          },
          fcmOptions: {
            link: payload.url,
          },
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
