import { PUBLIC_API_URL } from '$env/static/public';
import { Directus } from '@directus/sdk';

export const baseUrl = PUBLIC_API_URL;

export default new Directus(baseUrl);

// TODO: add wrapper aroud the sdk that checks for 401 error and sets $auth=false
