import { PUBLIC_API_URL } from '$env/static/public';
import { Directus } from '@directus/sdk';

export const baseUrl = PUBLIC_API_URL;

export default new Directus(baseUrl);

// class API {
//   constructor(baseUrl) {
//     this.baseUrl = baseUrl
//   }
//   read(collection, mode, options) {
//     try {
//       if(mode == 'query') {
//         const res = await api.items('products').readByQuery(options);
//         return res.data;
//       }
//     } catch (err) {
//       $auth = false;
//       $error = err;
//     }
//   }
//   readBySlug(collection, slug) {
//     return this.read(collection, 'query', options)
//   }
//   readByQuery(collection, query) {
//     return this.read(collection, 'query', options)
//   }
// }

// export default new API(baseUrl);

// TODO: add wrapper aroud the sdk that checks for 401 error and sets $auth=false
