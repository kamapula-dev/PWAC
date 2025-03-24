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
      icon?: string;
      badge?: string;
      picture?: string;
      url: string;
    }[],
  ) {
    if (tokens.length !== payloads.length) {
      return { success: false, message: 'Tokens and payloads count mismatch' };
    }

    const messages: admin.messaging.Message[] = tokens.map((token, index) => {
      const payload = payloads[index];

      return {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.picture && { imageUrl: payload.picture }),
        },
        data: {
          url: payload.url,
          ...(payload.icon && { icon: payload.icon }),
          ...(payload.badge && { badge: payload.badge }),
        },
        android: {
          notification: {
            color: payload.color,
            icon: payload.icon || 'ic_stat_notification',
            clickAction: 'OPEN_URL',
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
          response: response,
        },
      };
    } catch (error) {
      console.error('Error sending pushes:', error);
      return { success: false, error };
    }
  }
}
