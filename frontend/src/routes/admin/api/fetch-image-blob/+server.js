import fetch from 'node-fetch';
import { error } from '@sveltejs/kit';
import { apiAgent } from 'reedkalisz-shared/ca/AXPOL';

export const GET = async ({ url }) => {
  // fetch image blob from the given URL
  const imageUrl = url.searchParams.get('url');
  if (!imageUrl) throw error(400, 'Missing image URL');

  try {
    const fakeBrowserAgent =
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0. 2272.118 Safari/537.36';
    const res = await fetch(imageUrl, {
      agent: apiAgent, // use the custom https agent with the intermediate certificate
      method: 'GET',
      headers: {
        Accept: '*/*', // for some reason, the api works with this and not 'Content-Type'
        'User-Agent': fakeBrowserAgent
      }
    });

    if (!res.ok) throw error(res.status, `failed to fetch image blob: ${res.statusText}`);
    const blob = await res.blob();
    return new Response(blob);
  } catch (err) {
    console.error('Error fetching image:', err);
    throw error(500, `internal server error while fetching image blob: ${imageUrl}`);
  }
};
