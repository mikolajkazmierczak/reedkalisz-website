import api from '$/api';

export async function load({ depends }) {
  depends('website:layout');

  const layout = (await api.items('fragments').readOne(12)).data;

  return { layout };
}
