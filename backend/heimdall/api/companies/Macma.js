import { Api } from '../base.js';
import { fetchApi } from './EasyGifts.js';

export class Macma extends Api {
  async fetch({ company }) {
    return fetchApi(company, 'macma.pl');
  }
}
