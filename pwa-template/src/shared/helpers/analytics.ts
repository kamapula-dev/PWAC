export function getExternalId() {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get('external_id');
}

export async function trackExternalId(pwaId: string) {
  const externalId = getExternalId();

  if (externalId) {
    const storedExternalId = localStorage.getItem('external_id');

    if (!storedExternalId || storedExternalId !== externalId) {
      localStorage.setItem('external_id', externalId);

      try {
        const response = await fetch('https://pwac.world/external-mapping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            externalId: externalId,
            pwaId: pwaId,
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
  } else {
    console.log('No external_id found in the URL.');
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
    const response = await fetch('https://pwac.world/event-log', {
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