import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { xmlToJson, fetchSimpleApi } from '../utils.js';
import { parseItems } from '../common.js';
import { parsePrice, parseSize } from './EasyGifts.js';

function parseImages(images) {
  const url = 'https://bluecollection.eu/assets/img/';
  if (typeof images === 'string') return [url + images];
  return images.map(img => url + img);
}

function parse(company, products, stocks, images) {
  products = xmlToJson(products).productDetails.product;
  stocks = xmlToJson(stocks).stockData.product;
  images = xmlToJson(images).products.product;

  const items = products.map($ => {
    const [productCode, colorCode] = $.index.split('-');
    const name = $.name?.pl || '';
    const description = $.description?.pl || '';
    const size = parseSize(typeof $.dimensions === 'string' ? $.dimensions : '');
    const amount = Number(stocks.find(s => s.index === $.index)?.stock);
    return {
      name,
      code: productCode,
      slug: slugify([productCode, name], { key: true }),
      seo_title: name,
      seo_description: description,
      description,
      size_x: size.x,
      size_y: size.y,
      size_z: size.z,
      materials: typeof $.materialPl === 'string' ? $.materialPl.split(',').map(m => m.trim()) : [],
      price: parsePrice(company, $.price.pln, $.isDiscountPrices === 'True'),
      _storage: {
        img: parseImages(images.find(i => i.index === $.index)?.files?.fileName),
        amount,
        api_color_code: colorCode,
        api_color_id: $.index,
        color_first: $.colorProduct
      }
    };
  });

  return parseItems(items);
}

export class BlueCollection extends Api {
  async fetch({ company }) {
    return fetchSimpleApi({
      company,
      routes: ['product_details_pl', 'stock_data', 'product_images'],
      url: route => `https://bluecollection.eu/assets/xml/${route}.xml`,
      parse
    });
  }
}
