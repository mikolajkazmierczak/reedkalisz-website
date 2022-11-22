import api from '$/api';

export async function load() {
  try {
    const colors = await api.items('colors').readByQuery({ limit: -1 });
    return { colors: colors.data };
  } catch (err) {
    console.error('error');
    return { colors: null };
  }
}
