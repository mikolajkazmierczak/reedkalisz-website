const path = require('node:path');

const at = (...p) => path.join(__dirname, ...p);

module.exports = {
  apps: [
    {
      name: 'directus',
      cwd: at('backend/directus'),
      script: at('backend/directus/node_modules/directus/cli.js'),
      args: 'start',
      max_memory_restart: '900M',
    },
    {
      name: 'heimdall',
      cwd: at('backend/heimdall'),
      script: at('backend/heimdall/index.js'),
      max_memory_restart: '300M',
    },
    {
      name: 'sveltekit',
      cwd: at('frontend'),
      script: at('frontend/build/index.js'),
      env: { PORT: 5000, HOST: '127.0.0.1' },
      max_memory_restart: '600M',
    },
  ],
};
