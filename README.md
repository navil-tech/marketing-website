# Navil marketing website

Next.js 16 site in three locales (ru, en, he). Visits, lead forms and notifications are stored in PostgreSQL through Prisma as one event model.

## Local setup

```bash
cp .env.example .env                          # then fill in the values
npm install                                   # postinstall generates the prisma client
docker compose -f docker-compose.dev.yml up -d
npm run db:deploy                             # applies prisma/migrations
npm run dev
```

Environment variables are listed in `.env.example`: `DATABASE_URL` for the app and `POSTGRES_*` for the dev database, which listens on `127.0.0.1:$POSTGRES_PORT`. Keep `DATABASE_URL` in sync with the `POSTGRES_*` values. `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are optional: without them notifications are created and stored but not sent. `TELEGRAM_THREAD_ID` is the number of a topic in a group with topics; without it the message goes to the general topic.

## Database

Schema: `prisma/schema.prisma`. After changing it run `npm run db:migrate -- --name <change>` and commit the migration. `npm run db:studio` opens Prisma Studio.

## Event model

| Table          | One row per                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `Session`      | visit of one browser: source label (`utm_*`), landing path, referrer, client kind (`BROWSER` or `BOT`) |
| `Lead`         | saved form, linked to its session through `sessionId`                                                  |
| `Notification` | Telegram message built from a saved lead, with its delivery status                                     |
| `Event`        | step of the sequence: `SESSION_STARTED`, `FORM_SUBMITTED`, `LEAD_SAVED`, `NOTIFICATION_CREATED`        |

| File                     | Role                                                                  |
| ------------------------ | --------------------------------------------------------------------- |
| `proxy.ts`               | decides which requests are page requests and sets the session cookie  |
| `lib/source-label.ts`    | reads the `utm_*` label from a link                                   |
| `lib/sessions.ts`        | the session rule and the session records                              |
| `lib/first-touch.ts`     | the label of the first visit, kept in a cookie and copied to the lead |
| `lib/events.ts`          | the only place that writes events                                     |
| `lib/lead-submission.ts` | form received, lead saved, notification created                       |
| `lib/notifications.ts`   | message text and delivery to Telegram                                 |

`proxy.ts` registers every document request of a site page. The session id lives in the `nv_sid` cookie; a new session starts when the cookie is missing, when 30 minutes passed since the previous page request (`SESSION_TIMEOUT_SECONDS`), or when the request carries a source label different from the session's. Sessions are per browser, not per tab: a form submission belongs to the browser's current session, the one named by the cookie at the moment of submission, however long the form stayed open.

A request without the `Sec-Fetch-Dest` header (old browsers, bots) is treated as a page request; navigation inside the app does not reach the server as a document and does not extend the session. Label values are stored as given, without control characters, up to 255 characters.

A lead is never dropped because of tracking: submitted without a session cookie, or when the event writes fail, it is saved with an empty `sessionId` and counted separately. A submission with a filled honeypot field is saved as spam and gets no notification. Notifications are sent after the response. A send is repeated up to three times only while the connection to Telegram cannot be established, so a message is never posted twice. A message that was not delivered keeps the status `CREATED` or `FAILED` and shows up in `reports/funnel.sql`; when Telegram does not answer within 30 seconds the status is `FAILED` with the error `delivery unknown`, because the message may still have been posted.

Next to the event model the site keeps the usual first-touch record: the first page request of a browser stores its label and time in the `nv_ft` cookie for 90 days, and a submitted form copies it to `Lead.firstTouch`. It does not take part in the event model; the control stand uses it as the solution to compare with.

All timestamps of the event model come from the database clock (`clock_timestamp()`), and `Event.id` gives the order of events. Time to lead is `LEAD_SAVED.occurredAt − SESSION_STARTED.occurredAt`.

`reports/funnel.sql` prints the early funnel and the integrity counters. `control/` holds the stand that checks the model against scripted scenarios, see `control/README.md`.

## Docker image

`Dockerfile` builds one image; the production compose file lives in the infrastructure repository.

The container runs `prisma migrate deploy` and then `next start` on port 3000 as a non-root user, so every start applies pending migrations to `DATABASE_URL` before serving.

`NODE_OPTIONS` in the image gives every connection attempt 2 seconds instead of Node's default 250 ms. On a host without IPv6 the default drops an IPv4 connection that takes longer and then fails on the unreachable IPv6 address; about 3 % of the requests to Telegram were lost this way.

The app expects a reverse proxy that terminates TLS and sets `X-Forwarded-For`, `X-Forwarded-Proto` and `X-Request-Id`: the tracking cookies are `secure` when the forwarded protocol is `https`, the stored `ip` is the first entry of `X-Forwarded-For`, and the request id is written to the events so they can be matched with the proxy access log.
