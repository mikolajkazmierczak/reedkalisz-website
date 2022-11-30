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
      '#c': path.resolve(__dirname, './src/lib/website/common')
    }
  },
  plugins: [sveltekit()]
};
