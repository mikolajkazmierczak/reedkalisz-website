import api from '$/api';

export async function load() {
  try {
    const res = await api.items('products').readByQuery({ limit: -1 });
    return { products: res.data };
  } catch (err) {
    console.error(err);
    return { products: null };
  }
}
