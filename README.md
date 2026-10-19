<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Elouahabi-Naoufal/cheesecackery">
    <h3 align="center">Cheesecackery</h3>
  </a>

  <p align="center">
    A bakery operations console: inventory, orders, tasks, alerts, and users in one React SPA,
    backed by Express and PostgreSQL through Drizzle ORM.
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/cheesecackery/blob/main/shared/schema.ts"><strong>Explore the data model »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Elouahabi-Naoufal/cheesecackery/tree/main/server">Server</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/cheesecackery/tree/main/client">Client</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/cheesecackery/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/Elouahabi-Naoufal/cheesecackery/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#architecture">Architecture</a></li>
        <li><a href="#data-model">Data Model</a></li>
        <li><a href="#api-reference">API Reference</a></li>
        <li><a href="#interface">Interface</a></li>
        <li><a href="#known-gaps">Known Gaps</a></li>
        <li><a href="#repository-layout">Repository Layout</a></li>
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
    <li>
      <a href="#contributing">Contributing</a>
      <ul>
        <li><a href="#top-contributors">Top contributors:</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Cheesecackery is a TypeScript full-stack operations console for a small cake business. It tracks
stock, orders, staff tasks, alerts, and users, and serves the whole thing — API and UI — from a
single Express process.

The interesting part is the shape of the project rather than the feature list:

* **One process, one port.** Express owns the server. In development, Vite runs in middleware mode
  inside it; in production, the built client is served from disk. There is no separate frontend
  server to configure.
* **One schema, shared.** `shared/schema.ts` is the single Drizzle definition used by the server for
  queries and by the client for types and form validation. Adding a field means editing one file.
* **Validation at the edge.** Insert schemas are generated with `drizzle-zod`, so the API rejects a
  malformed body with a `ZodError` and the modal forms validate against the same rules.
* **Session auth, not tokens.** `express-session` with a `connect-pg-simple` store, Passport local
  strategy, and `scrypt` password hashing with `timingSafeEqual` comparison.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Architecture

```text
Browser
   │  HTTP, session cookie
   ▼
Express :5000  ────────────────┬── /api/*  → Passport + Drizzle → PostgreSQL
   │                           │
   │ dev  → Vite middleware    │ prod → dist/public (static)
   │                           │
   └── React SPA (wouter) ─────┘
```

In development `server/index.ts` calls `setupVite()`, which creates a Vite server in
`middlewareMode` with HMR wired to the HTTP server. In any other environment it calls
`serveStatic()` instead. Either way `server.listen()` binds port **5000** on `0.0.0.0` — the comment
in the source notes it is the only port that is not firewalled.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Data Model

Nine tables, all defined in `shared/schema.ts`:

| Table | Notable columns |
| --- | --- |
| `users` | `username`, `email` (both unique), `password`, `role` (`admin` \| `staff`) |
| `categories` | `name` (unique), `description` |
| `inventory_items` | `sku` (unique), `categoryId` → `categories`, `price` (decimal 10,2), `stock`, `lowStockAlert`, `soldCount` |
| `orders` | `orderNumber` (unique), `customerName`, `status`, `totalAmount`, `orderDate`, `completedAt` |
| `order_items` | `orderId` and `inventoryItemId` foreign keys, `quantity`, `unitPrice`, `totalPrice` |
| `tasks` | `assignedToId` and `assignedById` → `users`, `status`, `priority` (`low`…`urgent`), `dueDate` |
| `alerts` | `type`, `title`, `message`, `severity` (`low`…`critical`), `isRead`, `isDismissed` |
| `activity_logs` | `userId` → `users`, `action`, `entityType`, `entityId`, `details` |
| `notes` | `entityType`, `entityId`, `userId`, `content` — polymorphic attachments |

Relations are declared with Drizzle's `relations()` and include two named relations on `tasks` —
`assignedTo` and `assignedBy` — so both resolve to `users` without ambiguity.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### API Reference

Authentication, in `server/auth.ts`:

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/register` | Rejects a duplicate username with `400`; logs the new user in |
| `POST` | `/api/login` | Passport local strategy, `scrypt` comparison |
| `POST` | `/api/logout` | |
| `GET` | `/api/user` | `401` when unauthenticated |

Everything else, in `server/routes.ts`:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/inventory` | public | Accepts `search`, `category`, `status` query params |
| `GET` | `/api/inventory/:id` | public | `404` when the item does not exist |
| `POST` | `/api/inventory` | required | Validated with `insertInventoryItemSchema` |
| `PUT` | `/api/inventory/:id` | required | Partial update via `updateInventoryItemSchema` |
| `DELETE` | `/api/inventory/:id` | required | `204` on success |
| `GET` | `/api/inventory-stats` | required | `totalItems`, `lowStock`, `categories`, `totalValue` |
| `GET` | `/api/users` | admin | Strips `password` from every record before responding |
| `DELETE` | `/api/users/:id` | admin | Refuses to delete your own account |

Non-admins receive `403` from the user routes. Validation failures return `400` with the `ZodError`
payload so the client can show which field failed.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Interface

The SPA has one route (`/`) plus `/auth`; everything inside the shell is switched client-side by
section state. `client/src/components/sidebar.tsx` defines eleven sections:

| Section | Visible to | Endpoint it calls |
| --- | --- | --- |
| Dashboard | admin, staff | `/api/inventory-stats` |
| Inventory | admin, staff | `/api/inventory`, `/api/inventory-stats` |
| Data Export | admin, staff | `/api/inventory`, `/api/orders`, `/api/users`, `/api/activity-logs` |
| Users | admin only | `/api/users` |
| Orders, Analytics, Categories, Tasks, Alerts, Activity Log, Reports | admin, staff | not implemented yet |

Components under `client/src/components/ui/` are shadcn/ui primitives (Radix + Tailwind, `new-york`
style, `neutral` base colour) generated per `components.json`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Known Gaps

The UI is ahead of the API. Seven of the eleven sidebar sections call endpoints that do not exist in
`server/routes.ts` yet — `/api/orders`, `/api/categories`, `/api/tasks`, `/api/alerts`,
`/api/analytics`, `/api/activity-logs`, and most of Data Export. Those panels render their layout
and then error out on fetch.

There are also four specific defects worth knowing before you build on this:

* `server/storage.ts` filters and aggregates on `inventoryItems.category`, which is **not** a column
  in `shared/schema.ts` — the column is `categoryId`. This breaks the `category` filter on
  `GET /api/inventory` and the `categories` count in `getInventoryStats()`. `npm run check` will flag
  it.
* `server/vite.ts` imports `nanoid`, which is not declared in `package.json`.
* `serveStatic()` resolves its directory as `server/public`, but `vite.config.ts` builds the client
  to `dist/public`. The production path will not find its assets until one of the two moves.
* `package.json` is still named `rest-express`, the Replit template this started from.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Repository Layout

```text
.
├── drizzle.config.ts            # schema path + DATABASE_URL for drizzle-kit
├── vite.config.ts               # root = client/, aliases @ and @shared, outDir = dist/public
├── components.json              # shadcn/ui configuration
├── package.json                 # scripts and dependencies
├── shared/
│   └── schema.ts                # all 9 Drizzle tables, relations, and Zod insert schemas
├── server/
│   ├── index.ts                 # Express app, request logger, error handler, port 5000
│   ├── routes.ts                # inventory and user routes
│   ├── auth.ts                  # session config, Passport local strategy, auth routes
│   ├── storage.ts               # IStorage interface + DatabaseStorage implementation
│   ├── db.ts                    # pg Pool + drizzle instance
│   └── vite.ts                  # dev middleware mode / production static serving
└── client/
    ├── index.html
    └── src/
        ├── App.tsx              # providers: QueryClient, Auth, Tooltip, Toaster
        ├── pages/               # auth-page, home-page, not-found
        ├── components/          # 11 feature panels + shadcn/ui primitives
        ├── hooks/               # use-auth, use-mobile, use-toast
        └── lib/                 # queryClient, utils, protected-route
```

`shared/` is imported by both sides through the `@shared` alias, which is why the client can use the
server's types without a package boundary.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![TypeScript][TypeScript]][TypeScript-url]
* [![React][React.js]][React.js-url]
* [![Vite][Vite]][Vite-url]
* [![Express.js][Express.js]][Express.js-url]
* [![Drizzle][Drizzle]][Drizzle-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![TanStack Query][TanStack-Query]][TanStack-Query-url]
* [![TailwindCSS][TailwindCSS]][TailwindCSS-url]
* [![shadcn/ui][shadcn]][shadcn-url]
* [![Passport][Passport]][Passport-url]
* [![Zod][Zod]][Zod-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Node.js 20 and npm — the Replit configuration pins `nodejs-20`
  ```sh
  node --version
  npm --version
  ```
* PostgreSQL 16 or compatible — the Replit configuration pins `postgresql-16`; any reachable
  PostgreSQL instance works
  ```sh
  psql --version
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Elouahabi-Naoufal/cheesecackery.git
   cd cheesecackery
   ```

2. Create a PostgreSQL database
   ```sh
   createdb cheesecackery
   ```

3. Point the app at it. `DATABASE_URL` is the only required variable — both `server/db.ts` and
   `drizzle.config.ts` throw on start-up if it is missing. Create `.env` in the repository root:
   ```sh
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/cheesecackery
   ```
   `SESSION_SECRET` is optional. If it is unset, `server/auth.ts` falls back to a hardcoded
   development string, which is fine locally and not fine anywhere else.

4. Install dependencies
   ```sh
   npm install
   ```

5. Push the schema to the database. `drizzle-kit push` applies the DDL directly from
   `shared/schema.ts` — no migration files are committed.
   ```sh
   npm run db:push
   ```

6. Start the dev server
   ```sh
   npm run dev
   ```
   Vite serves the client inside Express with HMR. Open <http://localhost:5000>.

7. Create the first account through the sign-up form on `/auth`. It is created with the `staff` role
   by default — `role` is set on insert, so promoting the first admin is a direct SQL update:
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'your-username';
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | `tsx server/index.ts` with `NODE_ENV=development` — Express + Vite middleware on port 5000 |
| `npm run build` | `vite build` into `dist/public`, then `esbuild` bundles the server into `dist/index.js` |
| `npm start` | Runs `dist/index.js` with `NODE_ENV=production` |
| `npm run check` | `tsc` — type-check without emitting |
| `npm run db:push` | `drizzle-kit push` — applies `shared/schema.ts` to `DATABASE_URL` |

### Creating an inventory item

```sh
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Basque Cheesecake","sku":"BC-001","categoryId":1,"price":24.90,"stock":40,"lowStockAlert":8}'
```

The request goes through `insertInventoryItemSchema`, so an unknown field or a missing `sku` comes
back as a `400` with the Zod issue list. `PUT /api/inventory/:id` accepts a partial body.

### Searching inventory

```sh
# Substring match on name or SKU
curl "http://localhost:5000/api/inventory?search=basque"

# Filter by stock state
curl "http://localhost:5000/api/inventory?status=Low%20Stock"
curl "http://localhost:5000/api/inventory?status=Out%20of%20Stock"
```

Results are ordered by `updated_at` descending, so recently touched items surface first.

### Registering and logging in

```sh
# Register — logs you in and sets the session cookie
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"nabil","email":"nabil@example.com","password":"...","role":"admin"}'

# Log in
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"nabil","password":"..."}'

# Current session
curl http://localhost:5000/api/user -b cookies.txt

# Log out
curl -X POST http://localhost:5000/api/logout -b cookies.txt
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] Session authentication with Passport, `scrypt` hashing, and admin/staff roles
- [x] Inventory CRUD with search and stock-state filters
- [x] Inventory statistics for the dashboard
- [x] User listing and deletion restricted to admins
- [x] Full SPA shell — sidebar, header, search, eleven feature sections
- [ ] Implement the endpoints the UI already calls: `/api/orders`, `/api/categories`, `/api/tasks`,
      `/api/alerts`, `/api/analytics`, `/api/activity-logs`
- [ ] Fix the `inventoryItems.category` references in `server/storage.ts` to use the real
      `categoryId` column
- [ ] Reconcile the static asset paths — `serveStatic()` resolves `server/public`, Vite emits
      `dist/public`
- [ ] Add `nanoid` to `package.json`, or drop the dev-only template cache-buster
- [ ] Wire up order processing to decrement `inventory_items.stock` and bump `sold_count`, which the
      columns exist for but nothing writes today
- [ ] Add a seed script so a fresh database is not empty
- [ ] Rename the package from the `rest-express` template name
- [ ] Replace the in-memory `notice`-style feedback with the `useToast` hook the app already ships

See the [open issues](https://github.com/Elouahabi-Naoufal/cheesecackery/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

If you change the data model, edit `shared/schema.ts` only and re-run `npm run db:push` — it is read
by the server, the client types, and the validation schemas at once. If you add a route, add the Zod
insert schema alongside it and validate the body; `server/routes.ts` already has the `ZodError` →
`400` pattern to copy. `npm run check` is the fastest way to catch a type error.

### Top contributors:

<a href="https://github.com/Elouahabi-Naoufal/cheesecackery/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Elouahabi-Naoufal/cheesecackery" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

No license file is currently bundled with this repository. `package.json` declares `"license": "MIT"`
in its metadata, but that field is not a license grant and no `LICENSE` file is present in the
repository. Until a `LICENSE` file is added, the default GitHub terms apply — do not redistribute it
without asking.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Naoufal Elouahabi - [LinkedIn](https://www.linkedin.com/in/elouahabi-naoufal/) - elouahabi-naoufal1@gmail.com

Project Link: [https://github.com/Elouahabi-Naoufal/cheesecackery](https://github.com/Elouahabi-Naoufal/cheesecackery)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Replit](https://replit.com) — the Express + Vite `rest-express` template this project was
  scaffolded from; `server/vite.ts`, `.replit`, and the port-5000 convention come from it
* [shadcn/ui](https://ui.shadcn.com) — the `client/src/components/ui/` primitives, driven by
  `components.json`
* [Drizzle ORM](https://orm.drizzle.team) — schema, relations, and `drizzle-zod` insert schemas
* [Img Shields](https://shields.io)
* [Choose an Open Source License](https://choosealicense.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Elouahabi-Naoufal/cheesecackery.svg?style=for-the-badge
[contributors-url]: https://github.com/Elouahabi-Naoufal/cheesecackery/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Elouahabi-Naoufal/cheesecackery.svg?style=for-the-badge
[forks-url]: https://github.com/Elouahabi-Naoufal/cheesecackery/network/members
[stars-shield]: https://img.shields.io/github/stars/Elouahabi-Naoufal/cheesecackery.svg?style=for-the-badge
[stars-url]: https://github.com/Elouahabi-Naoufal/cheesecackery/stargazers
[issues-shield]: https://img.shields.io/github/issues/Elouahabi-Naoufal/cheesecackery.svg?style=for-the-badge
[issues-url]: https://github.com/Elouahabi-Naoufal/cheesecackery/issues
[license-shield]: https://img.shields.io/github/license/Elouahabi-Naoufal/cheesecackery.svg?style=for-the-badge
[license-url]: https://github.com/Elouahabi-Naoufal/cheesecackery
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/elouahabi-naoufal/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React.js-url]: https://react.dev/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[Express.js]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
[Express.js-url]: https://expressjs.com/
[Drizzle]: https://img.shields.io/badge/Drizzle-5A3EE3?style=for-the-badge&logo=drizzle&logoColor=white
[Drizzle-url]: https://orm.drizzle.team/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[TanStack-Query]: https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=tanstack&logoColor=white
[TanStack-Query-url]: https://tanstack.com/query/
[TailwindCSS]: https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[shadcn]: https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
[shadcn-url]: https://ui.shadcn.com/
[Passport]: https://img.shields.io/badge/Passport-344E96?style=for-the-badge&logo=passport&logoColor=white
[Passport-url]: https://www.passportjs.org/
[Zod]: https://img.shields.io/badge/Zod-3068B6?style=for-the-badge&logo=zod&logoColor=white
[Zod-url]: https://zod.dev/
