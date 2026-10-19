<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<br />
<div align="center">
  <h3 align="center">Rest API Full-Stack App</h3>

  <p align="center">
    A full-stack TypeScript application with a Vite/React client, an Express API, a shared
    Drizzle schema and PostgreSQL. The client is branded Cheesecackery, a bakery operations
    console.
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app"><strong>Explore the source »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

This project is a full-stack TypeScript application scaffolded from Replit's `rest-express`
template and extended into a bakery operations console. The UI brands itself **Cheesecackery**
and manages inventory, orders, staff tasks, alerts, exports and users.

The architecture is intentionally compact:

* **One process, one port.** Express serves the API. In development Vite runs in middleware mode
  inside Express; in production the built client is served from disk. The server listens on port
  `5000`.
* **One shared schema.** `shared/schema.ts` defines nine Drizzle tables, their relations and
  `drizzle-zod` insert schemas. The server, client types and form validation all read from it.
* **Session authentication.** `express-session` with a PostgreSQL store, Passport local strategy,
  `scrypt` password hashing and `timingSafeEqual` comparison. Users have an `admin` or `staff`
  role.
* **Inventory API.** Search by name or SKU, filter by stock state, create/update/delete items,
  and compute dashboard statistics.

Implemented API routes include `/api/register`, `/api/login`, `/api/logout`, `/api/user`,
`/api/inventory`, `/api/inventory/:id`, `/api/inventory-stats`, `/api/users` and
`/api/users/:id`. Admin-only user routes reject non-admins, and user responses omit passwords.

The client includes eleven sections: Dashboard, Inventory, Orders, Analytics, Categories, Tasks,
Alerts, Data Export, Users, Activity Log and Reports. Several of those panels render their layout
but call API routes that are not implemented yet—see the roadmap.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![TypeScript][TypeScript]][TypeScript-url]
* [![React][React.js]][React-url]
* [![Vite][Vite]][Vite-url]
* [![Tailwind CSS][TailwindCSS]][TailwindCSS-url]
* [![Express.js][Express.js]][Express.js-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![Drizzle ORM][Drizzle]][Drizzle-url]
* [![Zod][Zod]][Zod-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

* Node.js 20 and npm (`.replit` pins `nodejs-20`)
* PostgreSQL 16 or compatible
* A database URL the app can reach

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app.git
   cd rest-api-fullstack-app
   ```

2. Create a PostgreSQL database
   ```sh
   createdb cheesecackery
   ```

3. Create `.env` in the repository root
   ```sh
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/cheesecackery
   SESSION_SECRET=replace-with-a-long-random-value
   ```
   `DATABASE_URL` is required. `SESSION_SECRET` falls back to a development string if omitted.

4. Install dependencies
   ```sh
   npm install
   ```

5. Push the schema to the database
   ```sh
   npm run db:push
   ```

6. Start the development server
   ```sh
   npm run dev
   ```

7. Open <http://localhost:5000>. Register through `/auth`; new accounts are created with the
   `staff` role. To promote the first administrator:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'your-username';
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

| Script | Purpose |
| --- | --- |
| `npm run dev` | Express + Vite middleware on port 5000 |
| `npm run build` | Build the client into `dist/public` and bundle the server |
| `npm start` | Run the production server |
| `npm run check` | Type-check with `tsc` |
| `npm run db:push` | Apply `shared/schema.ts` to `DATABASE_URL` |

Typical flow:

1. Sign in at `/auth`.
2. Use **Inventory** to add products with a SKU, category, price, stock and low-stock threshold.
3. Search by name or SKU, and filter by low stock or out-of-stock state.
4. Review totals on the dashboard.
5. Administrators can list and delete users from **Users**.

Example inventory request:
```sh
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Basque Cheesecake","sku":"BC-001","categoryId":1,"price":24.90,"stock":40,"lowStockAlert":8}'
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Session authentication with Passport, `scrypt` hashing and admin/staff roles
- [x] Shared Drizzle schema, relations and Zod insert schemas
- [x] Inventory CRUD with search and stock-state filters
- [x] Inventory statistics and admin-only user management
- [x] Eleven-section SPA shell
- [ ] Implement the endpoints the UI already calls: orders, categories, tasks, alerts, analytics
      and activity logs
- [ ] Fix the `inventoryItems.category` references in `server/storage.ts`; the column is
      `categoryId`
- [ ] Reconcile the static asset paths between `serveStatic()` and the Vite output directory
- [ ] Add the missing `nanoid` dependency used by the Vite helper
- [ ] Wire order processing to decrement stock and increment `soldCount`
- [ ] Add a seed script and rename the package from the template name

See the [open issues](https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/issues) for a
full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire,
and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<a href="https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Elouahabi-Naoufal/rest-api-fullstack-app" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

This project is not licensed — all rights reserved.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Naoufal Elouahabi - [LinkedIn](https://www.linkedin.com/in/elouahabi-naoufal/) - elouahabi-naoufal1@gmail.com

Project Link: [https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app](https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

* [Replit](https://replit.com) — the Express + Vite `rest-express` template this project started
  from
* [Drizzle ORM](https://orm.drizzle.team)
* [shadcn/ui](https://ui.shadcn.com/)
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
* [Img Shields](https://shields.io)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/Elouahabi-Naoufal/rest-api-fullstack-app.svg?style=for-the-badge
[contributors-url]: https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Elouahabi-Naoufal/rest-api-fullstack-app.svg?style=for-the-badge
[forks-url]: https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/network/members
[stars-shield]: https://img.shields.io/github/stars/Elouahabi-Naoufal/rest-api-fullstack-app.svg?style=for-the-badge
[stars-url]: https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/stargazers
[issues-shield]: https://img.shields.io/github/issues/Elouahabi-Naoufal/rest-api-fullstack-app.svg?style=for-the-badge
[issues-url]: https://github.com/Elouahabi-Naoufal/rest-api-fullstack-app/issues
[license-shield]: https://img.shields.io/badge/license-none-lightgrey?style=for-the-badge
[license-url]: #license
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/elouahabi-naoufal/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[TailwindCSS]: https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[Express.js]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
[Express.js-url]: https://expressjs.com/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Drizzle]: https://img.shields.io/badge/Drizzle-5A3EE3?style=for-the-badge&logo=drizzle&logoColor=white
[Drizzle-url]: https://orm.drizzle.team/
[Zod]: https://img.shields.io/badge/Zod-3068B6?style=for-the-badge&logo=zod&logoColor=white
[Zod-url]: https://zod.dev/
