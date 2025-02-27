import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { Sha256 } from '@aws-crypto/sha256-js';

async function hashData(data?: string) {
  if (data) {
    const hash = new Sha256();
    hash.update(data.trim().toLowerCase());
    const result = await hash.digest();

    return Array.from(new Uint8Array(result))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  } else {
    return undefined;
  }
}

export async function sendEventWithCAPI(
  pixelId: string,
  accessToken: string,
  event: string,
) {
  try {
    const url = `https://graph.facebook.com/v16.0/${pixelId}/events?access_token=${accessToken}`;
    const json = localStorage.getItem('userData');
    const userData = JSON.parse(json || '') as Record<string, string>;

    if (userData) {
      const data = {
        data: [
          {
            event_name: event,
            event_time: Math.floor(Date.now() / 1000),
            user_data: {
              external_id: userData.externalId,
              client_ip_address: userData.ip,
              client_user_agent: userData.userAgent,
              em: [await hashData(userData.email)],
              ph: [await hashData(userData.phone)],
              fbp: userData.fbp,
              fbc: userData.fbc,
              country: [await hashData(userData.country)],
              fn: [await hashData(userData.firstName)],
              ln: [await hashData(userData.lastName)],
              db: [await hashData(userData.dob)],
            },
          },
        ],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(
          'Failed to send event via Facebook CAPI:',
          await response.text(),
        );
      } else {
        console.log('Event via CAPI was successfully sent.');
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function generateRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 8);
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${randomString}@${randomDomain}`;
}

function generateRandomPhoneNumber() {
  const randomDigits = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10),
  ).join('');
  return `1${randomDigits}`;
}

function generateRandomName() {
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
    firstName,
    lastName,
  };
}

function generateRandomBirthdate() {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 45;
  const endYear = currentYear - 22;
  const year =
    Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function getExternalId() {
  let externalId = localStorage.getItem('external_id');

  if (!externalId) {
    externalId = uuidv4();
    localStorage.setItem('external_id', externalId);
  }

  return externalId;
}

export function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.toString();
}

export function buildAppLink(
  appLink: string,
  fbc: string | undefined,
  fbp: string | undefined,
) {
  const externalId = getExternalId();
  const urlParams = getUrlParams();
  const domain = window.location.hostname;

  const url = new URL(appLink, window.location.origin);

  for (const [key, value] of url.searchParams.entries()) {
    if (
      value.includes('{external_id}') ||
      value.includes('"{external_id}"') ||
      value.includes("'{external_id}'") ||
      value.includes('`{external_id}`')
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{external_id\}/g, externalId)
          .replace(/"\{external_id\}"/g, externalId)
          .replace(/'\{external_id\}'/g, externalId)
          .replace(/`\{external_id\}`/g, externalId),
      );
    } else if (
      value.includes('{domain}') ||
      value.includes('"{domain}"') ||
      value.includes("'{domain}'") ||
      value.includes('`{domain}`')
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{domain\}/g, domain)
          .replace(/"\{domain\}"/g, domain)
          .replace(/'\{domain\}'/g, domain)
          .replace(/`\{domain\}`/g, domain),
      );
    } else if (
      value.includes('{fbp}') ||
      value.includes('"{fbp}"') ||
      value.includes("'{fbp}'") ||
      value.includes('`{fbp}`')
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{fbp\}/g, fbp || '')
          .replace(/"\{fbp\}"/g, fbp || '')
          .replace(/'\{fbp\}'/g, fbp || '')
          .replace(/`\{fbp\}`/g, fbp || ''),
      );
    } else if (
      value.includes('{fbc}') ||
      value.includes('"{fbc}"') ||
      value.includes("'{fbc}'") ||
      value.includes('`{fbc}`')
    ) {
      url.searchParams.set(
        key,
        value
          .replace(/\{fbc\}/g, fbc || '')
          .replace(/"\{fbc\}"/g, fbc || '')
          .replace(/'\{fbc\}'/g, fbc || '')
          .replace(/`\{fbc\}`/g, fbc || ''),
      );
    }
  }

  if (urlParams) {
    const additionalParams = new URLSearchParams(urlParams);
    for (const [key, value] of additionalParams.entries()) {
      if (!url.searchParams.has(key)) {
        url.searchParams.append(key, value);
      }
    }
  }

  return url.toString();
}

const getIPInfo = async () => {
  const endpoints = [
    { url: 'https://ipapi.co/json/', ipKey: 'ip', countryKey: 'country_name' },
    { url: 'http://ip-api.com/json/', ipKey: 'query', countryKey: 'country' },
  ];

  for (const { url, ipKey, countryKey } of endpoints) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Request failed: ${url}`);

      const data = await response.json();
      if (data[ipKey] && data[countryKey]) {
        return { ip: data[ipKey], country: data[countryKey] };
      }
    } catch (error) {
      console.warn(`Error fetching from ${url}:`, error);
    }
  }

  return { ip: null, country: null };
};

export async function trackExternalId(pwaId: string, pwaLink: string) {
  const externalId = getExternalId();

  try {
    const userData: Record<string, string | undefined> = {};
    const { firstName, lastName } = generateRandomName();
    const { ip, country } = await getIPInfo();
    const language =
      Intl.DateTimeFormat().resolvedOptions().locale?.split('-')[0] ??
      window.navigator.language ??
      navigator.language ??
      'en';
    const phone = generateRandomPhoneNumber();
    const email = generateRandomEmail();
    const dob = generateRandomBirthdate();
    const fbp = Cookies.get('_fbp');
    const fbc = Cookies.get('_fbc');

    userData.externalId = externalId;
    userData.pwaContentId = pwaId;
    userData.domain = window.location.hostname;
    userData.ip = ip;
    userData.country = country;
    userData.language = language;
    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.phone = phone;
    userData.email = email;
    userData.dob = dob;
    userData.userAgent = navigator.userAgent;
    userData.fbp = fbp;
    userData.fbc = fbc;

    localStorage.setItem('userData', JSON.stringify(userData));

    const response = await fetch('https://pwac.world/pwa-external-mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        offerUrl: buildAppLink(pwaLink, fbc, fbp),
      }),
    });

    if (!response.ok) {
      console.error(
        'Failed to save external_id mapping:',
        await response.text(),
      );
    } else {
      console.log('external_id mapping saved successfully.');
    }
  } catch (error) {
    console.error('Error while saving external_id mapping:', error);
  }
}

export async function logEvent(
  pwaContentId: string,
  domain: string,
  event: string,
  externalId?: string | null,
  value?: number,
  currency?: string,
) {
  try {
    const response = await fetch('https://pwac.world/pwa-event-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pwaContentId,
        domain,
        externalId,
        event,
        value,
        currency,
      }),
    });

    if (!response.ok) {
      console.error('Failed to log event:', await response.text());
    } else {
      console.log('Event logged successfully.');
    }
  } catch (error) {
    console.error('Error while logging event:', error);
  }
}
