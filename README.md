# Reed Kalisz

## Public website and a CMS to manage it.

Both the public website and admin panel are statically generated. Powered by [SvelteKit](https://kit.svelte.dev/).\
The admin panel is using a REST API that runs as a node server. Powered by [Directus](https://directus.io/).

<br/>

## `Develop 👨‍💻`

### Backend: <small>`/backend`</small>

#### Directus: <small>`/backend/directus`</small>

Directus turns an SQL database into a REST API.

`npm run start` ([docs](https://docs.directus.io/self-hosted/installation/cli/#_3-start-your-project))

#### Heimdall: <small>`/backend/heimdall`</small>

Heimdall is a server that performs actions based on the information from the admin panel.

`npm run dev`

### Frontend: <small>`/frontend`</small>

`npm run dev` ([docs](https://kit.svelte.dev/docs/introduction#getting-started))

<br/>

## `Deploy 🏃`

Configure a tool like [nginx](https://www.nginx.com/). Make sure you run everything on HTTPS.\
Serve SvelteKit on port **80**.\
Serve Directus on port **8055**.\
Serve Heimdall on port **999**.

#### Backend: <small>`/backend`</small>

0. Clone this repo to the server.
1. Read the official [docs on Directus deployment](https://docs.directus.io/self-hosted/installation/ubuntu/).
2. Run Heimdall. (<small>`npm run start`</small>)

Consider running the backend with [pm2](https://github.com/Unitech/pm2).

#### Frontend: <small>`/frontend`</small>

0. Clone this repo to the server.
1. Build (<small>`npm run build`</small>) and run the node server.
