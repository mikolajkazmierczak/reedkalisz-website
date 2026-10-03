const fs = require('node:fs');
const path = require('node:path');

const at = (...p) => path.join(__dirname, ...p);

// scripts/deploy.sh checks the "beta" branch out here, next to this repo
const beta = (...p) => path.join(`${__dirname}-beta`, ...p);

const betaApp = {
  name: 'sveltekit-beta',
  cwd: beta('frontend'),
  script: beta('frontend/build/index.js'),
  env: { PORT: 5001, HOST: '127.0.0.1' },
  max_memory_restart: '600M',
};

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
      // V8 sizes its young generation by the machine (128 MB on a big one): a big scan's parsing went past 400 MB.
      // Capped, AXPOL and MidOcean scans peak ~100 MB lower, as fast.
      node_args: '--max-semi-space-size=16',
      // a restart mid-scan loses the scan: well above a scan's peak, with room for two at once (only for a runaway)
      max_memory_restart: '768M',
    },
    {
      name: 'sveltekit',
      cwd: at('frontend'),
      script: at('frontend/build/index.js'),
      env: { PORT: 5000, HOST: '127.0.0.1' },
      max_memory_restart: '600M',
    },
    ...(fs.existsSync(beta('frontend/build/index.js')) ? [betaApp] : []),
  ],
};
