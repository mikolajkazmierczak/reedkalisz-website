import api from '$lib/api';

export async function load() {
  try {
    const res = await api.items('products').readByQuery({ limit: -1 });
    return { products: res.data };
  } catch (err) {
    console.log(err);
    return { products: null };
  }
}
