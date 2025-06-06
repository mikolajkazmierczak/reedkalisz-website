# Engineering Thesis

## Public website with a CMS to manage it.

This project was created for [REED](https://reed.kalisz.pl/) company that specializes in comprehensive printing and advertising services.
They needed a web-based system designed to support product catalog management and handle customer inquiries. It consists of two main components: a public-facing website and an admin panel.

The system is tailored to the client's requirements, with some key features:

- personalized pricing panels with automatic bulk editing,
- ad hoc importing of product data from external supplier APIs,
- on demand pricing recalculation of all imported products using external APIs,
- straightforward menu, category and file management,
- intuitive product display, without needless clutter.

### The Public Website

The public website enables customers to browse products, view detailed information, and submit inquiries. A simple menu was provided that allows to gradually expand nested categories, thus filtering the products.

![publiczna_strona](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/publiczna_strona.png)

![produkt](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/produkt_1.png)

### The Admin Panel

The admin panel was built to manage calculators, products, colors, categories, menus, pages, customer inquiries, and some distinct website fragments. It includes features like hierarchical category and menu organization, handling images and files, but most importantly **automated price calculators**, which significantly improve workflow efficiency. Administrators can easily adjust pricing of multiple sets of products based on customizable calculators based on arbitrary parameters.

#### Content Management

The management of products, colors, categories, menus, pages and certain website fragments all happens in visually similiar panels. Products can be assigned to multiple categories and colors. You can also upload images and files.

![product list view](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/widok_produkty.png)

![single product view](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/widok_produkt_1.png)

<p align="right">
  <img src="screenshots/widok_produkt_4.jpg" alt="product pricing view" style="width: 80%;">
</p>

<p align="right">
  <img src="screenshots/widok_produkt_6.png" alt="product colors view" style="width: 80%;">
</p>

![alt text](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/widok_kategorie.png)

![alt text](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/widok_pliki.png)

#### Inquiries

A section of the panel is dedicated to managing customer inquiries, as well as adding inquiries not directly submitted through the website.

![alt text](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/widok_zapytania.jpg)

#### Calculators

Without a doubt, the most important feature of the admin panel is the **automated price calculators**. They significantly reduce the time spent on manual calculations and ensure consistent pricing in all products.

![alt text](https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/widok_kalkulacje.jpg)

#### APIs

A crucial aspect of the website is the ability to import product data from external supplier APIs. But an even more important aspect, and for the most part why this project was even born, is the ability to automatically recalculate the pricing tables of all imported products on demand. It significantly reduces time spent managing the system.

![]()

#### Development

The project was developed using agile methodology, with iterative feedback from the client ensuring the system met their expectations.

Technologically, the project leverages Directus (a Backend-as-a-Service solution) for database and API management, ensuring scalability and ease of maintenance. The frontend is built using SvelteKit, chosen for its performance and developer-friendly approach. WebSockets were also introduced (via a custom server aptly named "Heimdall") to enable real-time updates for the admin panel.

| Architecture Diagram                                                                | Use Case Diagram                                                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| <img src="https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/architektura.png" alt="architektura" style="width: 390px;" /> | <img src="https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/usecase.jpg" alt="usecase diagram" style="width: 420px;" > |

### Feedback and Results

Elementary usability tests confirmed the interface's intuitiveness, and performance benchmarks showed significant improvements over the client's previous system. Adding a typical new product from scratch now takes 76 seconds compared to 442 seconds previously. Future enhancements will include more external API integrations, scheduling tools for automatic product publication and pricing recalculation, and further UX improvements both in the admin panel and the public-facing website.

This project demonstrates my ability to deliver a comprehensive, real-world, customer-driven solution that combines technical expertise and a focus on user experience.

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

## `Develop 👨‍💻`

Both the public website and admin panel are statically generated. Powered by [SvelteKit](https://kit.svelte.dev/).\
The admin panel is using a REST API that runs as a node server. Powered by [Directus](https://directus.io/).

### Backend: <small>`/backend`</small>

#### 1. Directus: <small>`/backend/directus`</small>

Directus turns an SQL database into a REST API.

`npm run start`

#### 2. Heimdall: <small>`/backend/heimdall`</small>

Heimdall is a custom server that performs actions based on the information from the admin panel.

`npm run dev`

### Frontend: <small>`/frontend`</small>

`npm run dev`

<br/>

## `Deploy 🏃`

Setup [nginx](https://nginx.org/).\
Consider running everything with [pm2](https://github.com/Unitech/pm2).

Serve SvelteKit on port **80**.\
Serve Directus on port **8055**.\
Serve Heimdall on port **999**.

<br/>

#### Backend: <small>`/backend`</small>

1. Run Directus (<small>`npm run start`</small>)
2. Run Heimdall (<small>`npm run start`</small>)
