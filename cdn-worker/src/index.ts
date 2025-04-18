import JSZip from 'jszip';

const BUCKET_URL = 'https://pwac-media.s3.eu-north-1.amazonaws.com';
const DOMAIN_MAPPING_API_URL = 'https://pwac.world/domain-mapping';

const CACHE_TTL_SECONDS = 60;

addEventListener('fetch', (event) => {
  // @ts-ignore
  event.respondWith(handleRequest(event));
});

async function handleRequest(event): Promise<Response> {
  try {
    const request = event.request;
    const url = new URL(request.url);
    const domainName = url.hostname;
    const requestedFile = url.pathname.slice(1) || 'index.html';

    // @ts-ignore
    const cache = caches.default;

    const cacheKey = new Request(
      `https://${domainName}/${requestedFile}`,
      request,
    );
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const mappingResponse = await fetch(
      `${DOMAIN_MAPPING_API_URL}/${domainName}`,
    );
    if (!mappingResponse.ok) {
      return new Response('Domain mapping not found', { status: 404 });
    }

    const { pwaId } = await mappingResponse.json();
    if (!pwaId) {
      return new Response('PWA ID not found for the domain', { status: 404 });
    }

    const archiveUrl = `${BUCKET_URL}/${pwaId}.zip`;
    const archiveResponse = await fetch(archiveUrl);
    if (!archiveResponse.ok) {
      return new Response('Archive not found', { status: 404 });
    }

    const archiveArrayBuffer = await archiveResponse.arrayBuffer();
    const zip = await JSZip.loadAsync(archiveArrayBuffer);

    const file = zip.file(requestedFile);
    if (!file) {
      return new Response('File not found in archive', { status: 404 });
    }

    let fileContent = await file.async('uint8array');
    let contentType = getContentType(requestedFile);
    const deviceType = getDeviceType(request);

    let shouldRedirect = false;
    let redirectUrl = '';
    const trackerConfigFile = zip.file('tracker.config.json');

    if (trackerConfigFile && requestedFile === 'index.html') {
      try {
        const configContent = await trackerConfigFile.async('text');
        const config = JSON.parse(configContent);

        const handleTrafficDirection = async (
          direction: string,
          customUrl?: string,
        ) => {
          switch (direction) {
            case 'WHITE_PAGE':
              if (config.whitePageHtml) {
                fileContent = new TextEncoder().encode(config.whitePageHtml);
                contentType = 'text/html';
              }
              break;

            case 'OFFER_URL':
              if (config.offerUrl) {
                redirectUrl = config.offerUrl;
                shouldRedirect = true;
              }
              break;

            case 'CUSTOM_URL':
              if (customUrl) {
                redirectUrl = customUrl;
                shouldRedirect = true;
              }
              break;

            case 'INSTALL_PAGE':
              break;
          }
        };

        if (config.devices) {
          if (config.devices.androidOnly?.enabled) {
            if (
              deviceType !== 'android' &&
              config.devices.androidOnly.irrelevantTraffic
            ) {
              const { direction, url } =
                config.devices.androidOnly.irrelevantTraffic;
              await handleTrafficDirection(direction, url);
            }
          } else {
            const deviceConfig = config.devices[deviceType];
            if (deviceConfig) {
              const { direction, url } = deviceConfig;
              await handleTrafficDirection(direction, url);
            }
          }
        }
      } catch (configError) {
        console.error('Error processing tracker config:', configError);
      }
    }

    if (shouldRedirect && redirectUrl) {
      return Response.redirect(redirectUrl, 302);
    }

    const response = new Response(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Device-Type': deviceType,
      },
    });

    // @ts-ignore
    event.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
      return 'application/javascript';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

function getDeviceType(request: Request): string {
  const ua = request.headers.get('User-Agent') || '';
  const userAgent = ua.toLowerCase();

  if (/telegram|telegrambot/i.test(ua)) {
    return 'telegram';
  }

  if (/\bandroid\b/.test(userAgent)) {
    return 'android';
  }

  const isIOS =
    /(iphone|ipad|ipod)/.test(userAgent) ||
    (/macintosh/.test(userAgent) && /mobile/.test(userAgent)) ||
    (/safari/.test(userAgent) && !/chrome|android/.test(userAgent));

  if (isIOS) {
    return 'ios';
  }

  return 'desktop';
}
