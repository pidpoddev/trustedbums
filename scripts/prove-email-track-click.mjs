#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const requiredEnv = ["QA_SUPABASE_FUNCTIONS_URL", "SUPABASE_ACCESS_TOKEN"];
const missing = requiredEnv.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}.`);
}

function dbQuery(sql) {
  const output = execFileSync("supabase", ["db", "query", "--linked", "-o", "json", sql], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(output).rows ?? [];
}

const metadata = {
  tracking_id: "TB-0025",
  proof: "safe-seeded-valid-delivery-click",
  created_by: "scripts/prove-email-track-click.mjs",
  created_at: new Date().toISOString(),
};

const insertSql = `
insert into public.admin_email_deliveries
  (recipient_group, recipient_email, subject, body, metadata, status, triggered_by, category, is_test)
values
  (
    'CUSTOM',
    'qa+tb0025@trustedbums.test',
    'TB-0025 email-track valid click proof',
    'Safe seeded delivery for TB-0025 valid click tracking proof.',
    '${JSON.stringify(metadata).replace(/'/g, "''")}'::jsonb,
    'SENT',
    'QA_SMOKE',
    'transactional',
    true
  )
returning id;
`;

const deliveryId = dbQuery(insertSql)[0]?.id;

if (!deliveryId) {
  throw new Error("Unable to create the seeded admin_email_deliveries proof row.");
}

const functionsUrl = process.env.QA_SUPABASE_FUNCTIONS_URL.replace(/\/+$/, "");
const targetUrl = "https://trustedbums.com/privacy-policy/";
const clickUrl = new URL(`${functionsUrl}/email-track/click`);
clickUrl.searchParams.set("d", deliveryId);
clickUrl.searchParams.set("u", targetUrl);

const response = await fetch(clickUrl, {
  redirect: "manual",
  headers: {
    "user-agent": "TrustedBums TB-0025 proof smoke",
  },
});

const location = response.headers.get("location");

if (response.status !== 302 || location !== targetUrl) {
  throw new Error(`Expected 302 redirect to ${targetUrl}; got ${response.status} ${location ?? "(no location)"}.`);
}

const rows = dbQuery(`
select
  d.id,
  d.is_test,
  d.status,
  d.clicked_at is not null as clicked,
  d.last_engaged_at is not null as engaged,
  d.engagement_score,
  count(e.id) filter (
    where e.event_type = 'CLICK'
      and e.clicked_url = '${targetUrl.replace(/'/g, "''")}'
  )::int as click_events
from public.admin_email_deliveries d
left join public.admin_email_events e on e.delivery_id = d.id
where d.id = '${deliveryId.replace(/'/g, "''")}'
group by d.id, d.is_test, d.status, d.clicked_at, d.last_engaged_at, d.engagement_score;
`);

const proof = rows[0];

if (!proof?.is_test || proof.status !== "SENT" || !proof.clicked || !proof.engaged || proof.engagement_score < 3 || proof.click_events < 1) {
  throw new Error(`Email-track click proof did not record correctly: ${JSON.stringify(proof)}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      trackingId: "TB-0025",
      deliveryId,
      redirectStatus: response.status,
      redirectLocation: location,
      clickEvents: proof.click_events,
      engagementScore: proof.engagement_score,
      retainedProofRow: true,
    },
    null,
    2,
  ),
);
