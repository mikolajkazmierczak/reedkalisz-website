import api from '$/api';

export async function load({ data, depends }) {
  depends('website:layout');

  const { data: layout } = await api.items('fragments').readOne(12);
  return { ...data, layout };
}
