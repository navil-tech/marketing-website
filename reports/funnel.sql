-- Early funnel and data integrity of the event model.
-- Run: psql "$DATABASE_URL" -f reports/funnel.sql
-- Control scenarios are excluded by their markers: nv_scn in the landing path and the control mailbox domain.

\echo 'Sessions per day: browsers, bots, labelled share'
SELECT
  date_trunc('day', s."startedAt" AT TIME ZONE 'Asia/Jerusalem')::date AS day,
  count(*) FILTER (WHERE s."client" = 'BROWSER') AS browser_sessions,
  count(*) FILTER (WHERE s."client" = 'BOT') AS bot_sessions,
  count(*) FILTER (WHERE s."client" = 'BROWSER' AND (s."utmSource" IS NOT NULL OR s."utmMedium" IS NOT NULL OR s."utmCampaign" IS NOT NULL OR s."utmTerm" IS NOT NULL OR s."utmContent" IS NOT NULL)) AS labelled_sessions,
  count(*) FILTER (WHERE s."client" = 'BROWSER' AND NOT (s."utmSource" IS NOT NULL OR s."utmMedium" IS NOT NULL OR s."utmCampaign" IS NOT NULL OR s."utmTerm" IS NOT NULL OR s."utmContent" IS NOT NULL)) AS unlabelled_sessions
FROM "Session" s
WHERE s."landingPath" NOT LIKE '%nv_scn=%'
GROUP BY 1
ORDER BY 1;

\echo 'Funnel by source label: sessions, saved leads, median time to lead'
SELECT
  coalesce(s."utmSource", '(no label)') AS source,
  coalesce(s."utmMedium", '') AS medium,
  coalesce(s."utmCampaign", '') AS campaign,
  count(DISTINCT s."id") AS sessions,
  count(DISTINCT l."id") FILTER (WHERE l."kind" = 'SHIPPER') AS shipper_leads,
  count(DISTINCT l."id") FILTER (WHERE l."kind" = 'CARRIER') AS carrier_leads,
  round(
    (percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM saved."occurredAt" - started."occurredAt")))::numeric,
    1
  ) AS median_seconds_to_lead
FROM "Session" s
LEFT JOIN "Lead" l ON l."sessionId" = s."id" AND NOT l."isSpam"
LEFT JOIN "Event" started ON started."sessionId" = s."id" AND started."type" = 'SESSION_STARTED'
LEFT JOIN "Event" saved ON saved."leadId" = l."id" AND saved."type" = 'LEAD_SAVED'
WHERE s."client" = 'BROWSER' AND s."landingPath" NOT LIKE '%nv_scn=%'
GROUP BY 1, 2, 3
ORDER BY sessions DESC;

\echo 'Saved leads by kind and region'
SELECT l."kind", l."region", count(*) AS leads
FROM "Lead" l
WHERE NOT l."isSpam" AND l."email" NOT LIKE '%@control.navil.test'
GROUP BY 1, 2
ORDER BY 1, 3 DESC;

\echo 'Integrity: linked leads, notifications, complete event chains'
SELECT
  count(*) AS saved_leads,
  count(*) FILTER (WHERE l."sessionId" IS NOT NULL) AS leads_with_session,
  count(*) FILTER (WHERE l."sessionId" IS NULL) AS leads_without_session,
  count(n."id") AS notifications_created,
  count(*) FILTER (WHERE n."status" = 'SENT') AS notifications_sent,
  count(*) FILTER (WHERE n."status" = 'FAILED') AS notifications_failed,
  count(*) FILTER (
    WHERE l."sessionId" IS NOT NULL
      AND EXISTS (SELECT 1 FROM "Event" e WHERE e."sessionId" = l."sessionId" AND e."type" = 'SESSION_STARTED')
      AND EXISTS (SELECT 1 FROM "Event" e WHERE e."sessionId" = l."sessionId" AND e."type" = 'FORM_SUBMITTED')
      AND EXISTS (SELECT 1 FROM "Event" e WHERE e."leadId" = l."id" AND e."type" = 'LEAD_SAVED')
      AND EXISTS (SELECT 1 FROM "Event" e WHERE e."leadId" = l."id" AND e."type" = 'NOTIFICATION_CREATED')
  ) AS linked_leads
FROM "Lead" l
LEFT JOIN "Notification" n ON n."leadId" = l."id"
WHERE NOT l."isSpam" AND l."email" NOT LIKE '%@control.navil.test';

\echo 'Submissions received and leads saved (control scenarios included)'
SELECT
  count(*) FILTER (WHERE e."type" = 'FORM_SUBMITTED') AS forms_received,
  count(*) FILTER (WHERE e."type" = 'LEAD_SAVED') AS leads_saved
FROM "Event" e;
