import { sveltekit } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('vite').UserConfig} */
const config = {
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

export default config;
