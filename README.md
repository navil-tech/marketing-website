# Navil marketing website

Next.js 16 site in three locales (ru, en, he). Lead forms are stored in PostgreSQL through Prisma.

## Local setup

```bash
cp .env.example .env
npm install                                   # postinstall generates the prisma client
docker compose -f docker-compose.dev.yml up -d
npm run db:deploy                             # applies prisma/migrations
npm run dev
```

Environment variables are listed in `.env.example`: `DATABASE_URL` for the app and `POSTGRES_*` for the dev database, which listens on `127.0.0.1:$POSTGRES_PORT`. Keep `DATABASE_URL` in sync with the `POSTGRES_*` values.

## Database

Schema: `prisma/schema.prisma`, one `Lead` row per submitted form. After changing it run `npm run db:migrate -- --name <change>` and commit the migration. `npm run db:studio` opens Prisma Studio.

## Docker image

`Dockerfile` builds one image; the production compose file lives in the infrastructure repository.

The container runs `prisma migrate deploy` and then `next start` on port 3000 as a non-root user, so every start applies pending migrations to `DATABASE_URL` before serving.

The app expects a reverse proxy that terminates TLS and sets `X-Forwarded-For`: the attribution cookie is `secure` in production and the stored `ip` is the first entry of that header.
