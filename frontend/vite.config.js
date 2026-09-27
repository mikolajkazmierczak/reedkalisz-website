import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

export default {
  resolve: {
    alias: {
      $: path.resolve(__dirname, './src/lib/shared'),
      $c: path.resolve(__dirname, './src/lib/shared/common'),
      '@': path.resolve(__dirname, './src/lib/admin'),
      '@c': path.resolve(__dirname, './src/lib/admin/common'),
      '#': path.resolve(__dirname, './src/lib/website'),
      '#c': path.resolve(__dirname, './src/lib/website/common'),
      '%': 'reedkalisz-shared',
    },
  },
  plugins: [sveltekit()],
  // pdfmake is imported on the first "PDF" click (see the product's report.js): known up front, the dev server doesn't
  // stop to bundle it then and reload the page
  optimizeDeps: {
    include: ['pdfmake', 'pdfmake/js/qrEnc.js'],
  },
};
