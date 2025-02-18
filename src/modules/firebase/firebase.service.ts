import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FirebaseAdmin') private readonly firebaseApp: admin.app.App,
  ) {}

  async sendPushToMultipleDevices(
    tokens: string[],
    payload: {
      title: string;
      body: string;
      color?: string;
      badge?: string;
      icon?: string;
      picture?: string;
      url?: string;
    },
  ) {
    if (!tokens.length) {
      return { success: false, message: 'No tokens provided' };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
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
        },
      },
      apns: {
        payload: {
          aps: {
            badge: payload.badge ? Number(payload.badge) : undefined,
            'mutable-content': 1,
          },
        },
        fcmOptions: {
          imageUrl: payload.picture,
        },
      },
      webpush: {
        notification: {
          badge: payload.badge,
          icon: payload.icon,
          image: payload.picture,
        },
        data: {
          click_action: payload.url || '',
        },
      },
      data: {
        click_action: payload.url || '',
      },
    };

    try {
      const response = await this.firebaseApp
        .messaging()
        .sendEachForMulticast(message);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending multicast push:', error);
      return { success: false, error };
    }
  }
}
