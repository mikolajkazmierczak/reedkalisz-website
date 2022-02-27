# Reed Kalisz

#### Public website and a CMS to manage it.

The public website and the admin panel are both statically generated. Powered by [SvelteKit](https://kit.svelte.dev/).\
The admin panel is using a REST API that runs as a node server. Powered by [Strapi](https://strapi.io/).\
<br/>

## `Develop 👨‍💻`

#### Backend: <small>`cd backend`</small>

`npm run develop`

To rebuild the [admin panel](http://localhost:1337) run <small>`npm run build`</small>.

#### Frontend: <small>`cd frontend`</small>

`npm run dev`

<br/>

## `Deploy 🏃`

Configure a tool like [nginx](https://www.nginx.com/).\
Serve the static frontend files from the <small>`frontend/build`</small> folder on port **80**.\
Serve the REST API on port **1337**.

#### Backend: <small>`cd backend`</small>

0. Clone this repo to the server.
1. Read the official Strapi docs on [configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/deployment.html#application-configuration) and [admin panel customization](https://docs.strapi.io/developer-docs/latest/development/admin-customization.html).
2. The Strapi admin panel is not actually needed in a production environment.\
   You can safely remove it by deleting the <small>`backend/build`</small> folder if it exists. **This will save some resources!**
3. `NODE_ENV=production npm run start`

Consider running the REST API server with [pm2](https://github.com/Unitech/pm2).\
You will need to install it, create a <small>`server.js`</small> file and run <small>`pm2 start ./server.js`</small>

If you ever need it you can build the **Strapi admin panel** with <small>`NODE_ENV=production npm run build`</small>.\
However: **it really shouldn't be needed.** If something is wrong find the cause in a local dev environment.

#### Frontend: <small>`cd frontend`</small>

0. Clone this repo to the server.
1. `npm run build`
