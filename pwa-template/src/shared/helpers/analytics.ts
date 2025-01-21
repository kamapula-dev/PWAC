import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

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
  const paramsString = urlParams.toString();

  localStorage.setItem('url_params', paramsString);

  return paramsString;
}

export function buildAppLink(appLink: string) {
  const externalId = getExternalId();
  const urlParams = getUrlParams();

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
export async function trackExternalId(pwaId: string) {
  const externalId = getExternalId();

  let ip = null;
  let country = null;

  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    ip = ipData.ip;
  } catch (error) {
    console.warn('Failed to retrieve IP:', error);
  }

  try {
    if (ip) {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoResponse.json();
      country = geoData.country_name;
    }
  } catch (error) {
    console.warn('Failed to retrieve country:', error);
  }

  try {
    const response = await fetch('https://pwac.world/pwa-external-mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        externalId: externalId,
        pwaContentId: pwaId,
        domain: window.location.hostname,
        ip: ip,
        country: country,
        userAgent: navigator.userAgent,
        fbp: Cookies.get('_fbp'),
        fbc: Cookies.get('_fbc'),
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
