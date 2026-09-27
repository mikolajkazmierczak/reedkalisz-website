import { headerTabs } from '@/tabs';

export const calculationsTabs = (pathname) =>
  headerTabs(pathname, [
    { label: 'ZNAKOWANIA', path: '/admin/kalkulacje/znakowania' },
    { label: 'MARŻE I WIDOKI', path: '/admin/kalkulacje/marze-i-widoki' },
  ]);
