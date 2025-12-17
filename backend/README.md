# Backend API - Cosmetic Management System

## Tech Stack
- NestJS 10
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- Swagger/OpenAPI

## Installation

```bash
npm install
```

## Setup

1. Copy `.env.example` to `.env`
2. Update database credentials in `.env`
3. Run migrations: `npm run migration:run`

## Development

```bash
npm run start:dev
```

API will be available at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

## Build

```bash
npm run build
npm run start:prod
```

## Testing

```bash
npm run test
npm run test:e2e
```

