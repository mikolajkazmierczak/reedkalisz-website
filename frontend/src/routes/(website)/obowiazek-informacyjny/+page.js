import api from '$/api';

export async function load() {
  const fragment = await api.items('fragments').readOne(6);
  return { fragment };
}
