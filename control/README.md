# Control stand

Checks the event model against scripted scenarios with known ground truth. The stand drives real browsers through a logging gateway, keeps its own journal of what it opened and when it submitted, then compares the journal with the database.

## What is checked

For every scenario the stand knows the tagged link it opened, the request that must have started the session and the moments it issued the page request and the form submission. Three criteria are evaluated per scenario:

| Criterion | A scenario passes when                                                                                                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link      | the lead has one notification, belongs to the session held in the browser cookie at submit time, that session was started by the expected request, and the events `SESSION_STARTED`, `FORM_SUBMITTED`, `LEAD_SAVED`, `NOTIFICATION_CREATED` exist in this order |
| Label     | the five `utm_*` values stored for the session equal the values of the link; an untagged link is stored as no label                                                                                                                                             |
| Interval  | `LEAD_SAVED − SESSION_STARTED` from the event log differs from `submit − page request` in the journal by at most 1 s                                                                                                                                            |

Each criterion is tested with a one-sided exact binomial test against the 95 % threshold at α = 0.05, and the report gives the matching one-sided Clopper–Pearson lower bound. With 93 scenarios the threshold is confirmed when a criterion fails in at most one scenario. The matrix is fixed in advance, so the test is a decision rule for this matrix, not an estimate for all visitors.

The stand also runs a Telegram sink: a local server that accepts `sendMessage` calls. When the site is started with `npm run start:control`, every notification is sent there and the report counts the messages received with the same text as stored.

The same scenarios are judged for two solutions to compare with:

- First touch, the usual scheme: the label and time of the browser's first visit are kept in a cookie and copied to the lead (`Lead.firstTouch`). It has no sessions, so only the label and the interval are judged, against the same journal.
- No identifiers at all: sessions are reconstructed from the gateway log by IP address, User-Agent and the 30-minute timeout, and the lead is matched by its stored IP, User-Agent and time.

## Files

| File                                               | Role                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `hypothesis.ts`                                    | thresholds of the hypothesis: 95 %, 1 s, α = 0.05                             |
| `matrix.ts`                                        | the fixed list of scenarios                                                   |
| `plan.ts`, `show-plan.ts`                          | checksum of the matrix and thresholds, and the commit a run was made from     |
| `run.ts`, `scenarios.ts`, `browser.ts`             | running: entry point, behaviour of each scenario class, browser steps         |
| `gateway.ts`, `sink.ts`                            | the stand's own records: access log and received Telegram messages            |
| `verify.ts`, `judge.ts`, `baseline.ts`, `stats.ts` | checking: entry point, per-scenario verdicts, the baseline, the binomial test |
| `report.ts`                                        | the report                                                                    |
| `selfcheck.ts`                                     | check of the stand itself: distorted records must fail their criterion        |
| `field.ts`                                         | the same three criteria on real leads, against the web server access log      |

## Scenarios

The matrix is a fixed list of 93 scenarios in 13 classes: direct visit, browsing between pages, reload, moving to another form page, second tab (untagged and with another tagged link), second tagged link, session timeout, late submission, repeated submission, link preview bot before the visitor, two visitors behind one address, delayed submission (0.4 and 0.8 s) and disabled JavaScript. Every scenario has a browser profile, an entry page and locale, a form and a label variant.

The matrix, the boundary set and the thresholds are fixed before a run. `npm run control:plan` prints their SHA-256 and the current commit; every run stores the same pair in `meta.json` and the report shows it. If the checksum at verification differs from the stored one, the run is not conclusive.

Eight boundary scenarios run next to the matrix and are reported separately: cookies cleared before submission, bot-only visits, a filled honeypot field and a submission delayed by 1.8 s. They show how the system accounts for cases outside its limits.

Limits of the stand itself:

- Timeout scenarios move `Session.lastSeenAt` back in the database instead of waiting 30 minutes, so the stand needs write access to the database of the site under test, and both must use the same `SESSION_TIMEOUT_SECONDS`. Do not point the stand at production.
- The baseline is not evaluated for the two time-shifted classes, because the access log does not see the shift.
- Messenger in-app browsers are not covered here, see the manual protocol.

## Running

The site must be running and use the same database as `DATABASE_URL`.

```bash
npx playwright install chromium firefox webkit   # once
npm run build && npm run start:control           # in another terminal
npm run control                                  # run the scenarios, then verify
```

`npm run control:selfcheck` checks the stand itself on a finished run (`CONTROL_RUN_ID`, the latest by default). It takes every scenario that passed all three criteria, applies 15 distortions to in-memory copies of its records and of its journal entry (a missing notification, another lead or session in the notification, a changed label, events out of order, times shifted by three tolerances and so on) and expects the verification to stop counting the scenario for the criterion the distortion targets. The database is not changed. The outcome is written to `selfcheck.md` and `selfcheck.json`; the command exits with an error if any distortion goes unnoticed.

Results are written to `control/out/<run id>/`: `journal.jsonl` (the stand's own record), `access.log` (gateway log), `telegram.log` (messages received by the sink), `report.md` and `report.json`.

Environment variables:

| Variable              | Default                   | Purpose                           |
| --------------------- | ------------------------- | --------------------------------- |
| `CONTROL_TARGET`      | `http://127.0.0.1:3000`   | site under test                   |
| `CONTROL_ENGINES`     | `chromium,firefox,webkit` | engines available on this machine |
| `CONTROL_CONCURRENCY` | `4`                       | scenarios run in parallel         |
| `CONTROL_PAUSE_MS`    | `0`                       | pause after each scenario         |
| `CONTROL_ONLY`        | all                       | comma-separated scenario ids      |
| `CONTROL_RUN_ID`      | timestamp                 | name of the output folder         |

To have the notifications delivered to a real Telegram chat, start the site with `npm run start` and its own `TELEGRAM_*` values and run the stand with `CONTROL_CONCURRENCY=1 CONTROL_PAUSE_MS=3000`: a group accepts about 20 messages a minute, and the site sends each notification once.

If an engine is missing from `CONTROL_ENGINES`, its scenarios run on the first listed engine and the report is marked as a technical run: no conclusion about the thresholds is drawn from it. The engines the selected scenarios need are launched before the first scenario; if one fails to start, the run stops without writing results.

Control data is recognisable by the `nv_scn` parameter in `Session.landingPath` and by the `@control.navil.test` mailbox domain. `reports/funnel.sql` excludes it.

## Real leads

The matrix is scripted, so its outcome says little about visitors the stand does not control. `npm run control:field` evaluates the same three criteria on real leads of a period, with the web server access log as the independent record: nginx writes one JSON line per request and passes its request id to the site, and the site stores the id in the events.

| Criterion | A lead passes when                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link      | it has a session and one notification that names this lead and this session, the events are in order, and the access log has both the page request that started the session and the form submission |
| Label     | the label stored for the session and stated in the notification equals the label in the logged page request                                                                                         |
| Interval  | `LEAD_SAVED − SESSION_STARTED` differs from the interval between the two logged requests by at most 1 s                                                                                             |

A lead without a session fails all three. The test and the thresholds are the same as for the matrix. A conclusion needs at least 59 leads, the smallest sample in which zero failures confirm the 95 % threshold at α = 0.05; with fewer leads the report says that the data is insufficient. The report also counts the leads whose first-touch label differs from the logged one.

```bash
FIELD_FROM=2026-12-02 FIELD_TO=2026-12-24 FIELD_ACCESS_LOG=navil.access.log npm run control:field
```

`FIELD_ACCESS_LOG` takes a comma-separated list of files copied from the host. Control data and spam are excluded; `FIELD_INCLUDE_CONTROL=1` includes control data to check the command itself after a stand run through nginx. The report in `control/out/field-<from>_<to>/` lists lead ids only.

## Manual scenarios

Messenger in-app browsers cannot be automated. `manual-protocol.md` describes the scenarios to run by hand on real devices.
