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
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.picture,
        },
        android: {
          notification: {
            color: payload.color,
            icon: payload.icon,
            imageUrl: payload.picture,
            clickAction: 'OPEN_URL_ACTION',
          },
        },
        webpush: {
          notification: {
            badge: payload.badge,
            icon: payload.icon,
            image: payload.picture,
          },
          data: {
            url: payload.url || '',
          },
        },
        data: {
          url: payload.url || '',
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
      console.error('Error sending pushes:', error);
      return { success: false, error };
    }
  }
}
