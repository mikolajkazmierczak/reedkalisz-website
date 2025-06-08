# Public website and CMS for REED Kalisz

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

![home](https://github.com/user-attachments/assets/d99ea562-ae3d-4ee4-820a-2ec3f1a70ddc)

![products](https://github.com/user-attachments/assets/e458e691-62f9-44db-8eff-52c4b03dcbbf)

![product](https://github.com/user-attachments/assets/7fba3346-dad7-4faf-a36d-cdfc1418fb17)

### The Admin Panel

The admin panel was built to manage calculators, products, colors, categories, menus, pages, customer inquiries, and some distinct website fragments. It includes features like hierarchical category and menu organization, handling images and files, but most importantly **automated price calculators**, which significantly improve workflow efficiency. Administrators can easily adjust pricing of multiple sets of products based on customizable calculators based on arbitrary parameters.

#### Content Management

The management of products, colors, categories, menus, pages and certain website fragments all happens in visually similiar panels. Products can be assigned to multiple categories and colors. You can also upload images and files.

#### Inquiries

A section of the panel is dedicated to managing customer inquiries, as well as adding inquiries not directly submitted through the website.

#### Calculators

Without a doubt, the most important feature of the admin panel is the **automated price calculators**. They significantly reduce the time spent on manual calculations and ensure consistent pricing in all products.

#### APIs

A crucial aspect of the website is the ability to import product data from external supplier APIs. But an even more important aspect, and for the most part why this project was even born, is the ability to automatically recalculate the pricing tables of all imported products on demand. It significantly reduces time spent managing the system.

![admin-products](https://github.com/user-attachments/assets/9ac8d2e8-b706-4bfe-ab0e-ac63a1c5879f)

![admin-product](https://github.com/user-attachments/assets/c37c03c4-166a-4c26-bc9d-434b38ebde75)

<p align="right">
  <img src="https://github.com/user-attachments/assets/c07c55c7-9ca5-4427-9ac7-6724eb609fb7" alt="admin-product-prices" style="width: 80%;">
</p>

<p align="right">
  <img src="https://github.com/user-attachments/assets/ec1b0595-b97a-43ea-abb1-ed48c7e9df45" alt="admin-product-colors" style="width: 80%;">
</p>

![admin-categories](https://github.com/user-attachments/assets/5e5045ec-cc97-41b1-b91b-860f73e3510a)

![admin-files](https://github.com/user-attachments/assets/76b5fcea-731b-47f9-b257-815f37093be4)

![admin-calculations](https://github.com/user-attachments/assets/fa9bebc7-43af-4539-ab72-2c1cf0ceae39)

![admin-api](https://github.com/user-attachments/assets/a21a542f-0710-4089-8b31-1753daaca949)

#### Development

The project was developed using agile methodology, with iterative feedback from the client ensuring the system met their expectations.

Technologically, the project leverages Directus (a Backend-as-a-Service solution) for database and API management, ensuring scalability and ease of maintenance. The frontend is built using SvelteKit, chosen for its performance and developer-friendly approach. WebSockets were also introduced (via a custom server aptly named "Heimdall") to enable real-time updates for the admin panel.

| Architecture Diagram                                                                | Use Case Diagram                                                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| <img src="https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/architektura.png" alt="architektura" style="width: 390px;" /> | <img src="https://github.com/mikolajkazmierczak/engineering-thesis/blob/main/screenshots/usecase.jpg" alt="usecase diagram" style="width: 420px;" > |

### Feedback and Results

Elementary usability tests confirmed the interface's intuitiveness, and performance benchmarks showed significant improvements over the client's previous system. Adding a typical new product from scratch now takes 76 seconds compared to 442 seconds previously. Future enhancements will include more external API integrations, scheduling tools for automatic product publication and pricing recalculation, and further UX improvements both in the admin panel and the public-facing website.

As such, this project demonstrates my ability to deliver a comprehensive, real-world, customer-driven solution that combines technical expertise and a focus on user experience.

<br/>

## `Develop 👨‍💻`

Both the public website and admin panel are statically generated. Powered by [SvelteKit](https://kit.svelte.dev/).\
The admin panel is using a REST API that runs as a node server. Powered by [Directus](https://directus.io/).

#### <small>`/backend/directus`</small> — Directus turns an SQL database into a REST API.

`npm run start` 

#### <small>`/backend/heimdall`</small> — Heimdall is a custom socket server and external API middleman.

`npm run dev`

#### <small>`/frontend`</small> — SvelteKit is a highly performant and developer friendly frontend framework.

`npm run dev` 

<br/>

## `Deploy 🏃`

Setup [nginx](https://nginx.org/).\
Consider running everything with [pm2](https://github.com/Unitech/pm2).

Serve SvelteKit on port **80**.\
Serve Directus on port **8055**.\
Serve Heimdall on port **999**.

#### <small>`/backend/directus`</small>

`npm run start` — run Directus

#### <small>`/backend/heimdall`</small>

`npm run start` — run Heimdall, a custom socket server and external API middleman

#### <small>`/frontend`</small>

`npm run build` — build SvelteKit for Node\
`node ./build` — run Node server
