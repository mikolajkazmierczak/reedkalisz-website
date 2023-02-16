import { Directus } from '@directus/sdk';

// export const baseUrl = 'http://localhost:8055';
// export const baseUrl = 'http://192.168.1.10:8055';
// export const baseUrl = 'http://formixhome.ddns.net:8055';
// export const baseUrl = 'http://produktpolski.ddns.net:8055';
export const baseUrl = 'https://new.reed.kalisz.pl/api'

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
