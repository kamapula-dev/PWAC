import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PostbackEvent,
  PWAExternalMapping,
} from '../../schemas/pwa-external-mapping.scheme';
import crypto from 'crypto';

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
    const nameData = this.generateRandomName();
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
            country: mapping.country
              ? this.hashData(mapping.country)
              : undefined,
            first_name: nameData.firstName,
            last_name: nameData.lastName,
            dob: this.generateRandomBirthdate(),
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
    const randomString = Math.random().toString(36).substring(2, 8);
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${randomString}@${randomDomain}`;
    return this.hashData(email);
  }

  private generateRandomPhoneNumber() {
    const randomDigits = Array.from({ length: 10 }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
    const phone = `+1${randomDigits}`;
    return this.hashData(phone);
  }

  private generateRandomName() {
    const firstNames = [
      'John',
      'Jane',
      'Alice',
      'Bob',
      'Charlie',
      'Eve',
      'Frank',
      'Grace',
      'Hannah',
      'Ivy',
      'Jack',
      'Karen',
      'Liam',
      'Mia',
      'Noah',
      'Olivia',
      'Paul',
      'Quinn',
      'Ruby',
      'Sophia',
      'Thomas',
      'Uma',
      'Violet',
      'William',
      'Xander',
      'Yara',
      'Zoe',
      'Emma',
      'Lily',
      'James',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Jones',
      'Brown',
      'Davis',
      'Miller',
      'Wilson',
      'Moore',
      'Taylor',
      'Anderson',
      'Thomas',
      'Jackson',
      'White',
      'Harris',
      'Martin',
      'Thompson',
      'Garcia',
      'Martinez',
      'Robinson',
      'Clark',
      'Rodriguez',
      'Lewis',
      'Lee',
      'Walker',
      'Hall',
      'Allen',
      'Young',
      'King',
      'Scott',
    ];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return {
      firstName: this.hashData(firstName),
      lastName: this.hashData(lastName),
    };
  }

  private generateRandomBirthdate() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 45;
    const endYear = currentYear - 22;
    const year =
      Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const birthdate = `${year}-${month}-${day}`;
    return this.hashData(birthdate);
  }

  private hashData(data: string) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
