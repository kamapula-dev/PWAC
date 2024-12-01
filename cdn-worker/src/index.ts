import JSZip from 'jszip';

const BUCKET_URL = 'https://pwac-media.s3.eu-north-1.amazonaws.com';
const DOMAIN_MAPPING_API_URL = 'https://pwac.world/domain-mapping';

addEventListener('fetch', (event) => {
  // @ts-ignore
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const domainName = url.hostname;
    const requestedFile = url.pathname.slice(1) || 'index.html';

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

    const fileContent = await file.async('uint8array');
    const contentType = getContentType(requestedFile);

    return new Response(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
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
