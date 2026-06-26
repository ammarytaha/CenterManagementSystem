# نظام إدارة السنتر التعليمي — Center Management System

Full-stack educational-center management system (Arabic RTL) built for Loop.

- **Frontend:** React 18 + Vite + Tailwind CSS (design tokens from the
  `design-system` skill — purple brand, pill shapes, Roboto, automatic dark mode)
- **Backend:** Node.js + Express (REST under `/api`)
- **Database:** PostgreSQL 18 (via Docker Compose) + Prisma ORM
- **Auth:** JWT, bcrypt, role-based (admin / staff / accountant)

## Prerequisites

- Node.js 20+ (tested on 24)
- Docker + Docker Compose

## Quick start

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start PostgreSQL (Docker)
npm run db:up

# 3. Create the database schema
npm run migrate

# 4. Seed sample data (users, teachers, groups, students, attendance, payments)
npm run seed

# 5. Run backend + frontend together
npm run dev
```

- API: http://localhost:4000  (health check: `/api/health`)
- App: http://localhost:5173

## Workspace scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run server + client together |
| `npm run dev:server` | Server only (port 4000) |
| `npm run dev:client` | Client only (port 5173) |
| `npm run db:up` / `db:down` | Start / stop the Postgres container |
| `npm run migrate` | Apply Prisma migrations |
| `npm run seed` | Seed sample data |

## Seed credentials

_Added in Milestone 9 (database seeding)._

## Project layout

```
client/   React + Vite + Tailwind frontend
server/   Express + Prisma API
.claude/skills/design-system/   UI design system (read before building any UI)
docker-compose.yml              Postgres 18 service
```
