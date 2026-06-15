import { createSign } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const dataApiBaseUrl = "https://analyticsdata.googleapis.com/v1beta";
const adminApiBaseUrl = "https://analyticsadmin.googleapis.com/v1beta";
const tokenUrl = "https://oauth2.googleapis.com/token";

const customDimensions = [
  {
    displayName: "Portal area",
    parameterName: "portal_area",
    description: "Trusted Bums route area: public, auth, admin, client, bum, or portal.",
    scope: "EVENT",
  },
  {
    displayName: "Route group",
    parameterName: "route_group",
    description: "Aggregate route group without private IDs.",
    scope: "EVENT",
  },
  {
    displayName: "Auth gate",
    parameterName: "auth_gate",
    description: "Whether the route is public, auth, or protected.",
    scope: "EVENT",
  },
  {
    displayName: "Is portal route",
    parameterName: "is_portal_route",
    description: "Whether the route is part of the authenticated portal.",
    scope: "EVENT",
  },
];

const reportPresets = {
  overview: {
    endpoint: "runReport",
    body: ({ startDate, endDate, limit }) => ({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "eventCount" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit,
    }),
  },
  routes: {
    endpoint: "runReport",
    body: ({ startDate, endDate, limit }) => ({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "eventCount" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    }),
  },
  events: {
    endpoint: "runReport",
    body: ({ startDate, endDate, limit }) => ({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    }),
  },
  portal: {
    endpoint: "runReport",
    body: ({ startDate, endDate, limit }) => ({
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: "customEvent:portal_area" },
        { name: "customEvent:route_group" },
        { name: "customEvent:auth_gate" },
        { name: "customEvent:is_portal_route" },
      ],
      metrics: [{ name: "eventCount" }, { name: "activeUsers" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "trustedbums_route_view" },
        },
      },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    }),
  },
  realtime: {
    endpoint: "runRealtimeReport",
    body: ({ limit }) => ({
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit,
    }),
  },
};

function getArgs(argv) {
  const [command, ...rawArgs] = argv.slice(2);
  const args = {};

  for (const rawArg of rawArgs) {
    if (!rawArg.startsWith("--")) {
      continue;
    }

    const [key, ...valueParts] = rawArg.slice(2).split("=");
    args[key] = valueParts.length ? valueParts.join("=") : "true";
  }

  return { command, args };
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. See docs/google-analytics-api.md for setup.`);
  }
  return value;
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function readServiceAccount() {
  const keyPath = getRequiredEnv("GOOGLE_APPLICATION_CREDENTIALS");
  const key = JSON.parse(readFileSync(keyPath, "utf8"));

  if (!key.client_email || !key.private_key) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS must point to a service-account JSON key with client_email and private_key.");
  }

  return key;
}

async function getAccessToken(scopes) {
  const impersonatedServiceAccount = process.env.GA4_IMPERSONATE_SERVICE_ACCOUNT?.trim();
  if (impersonatedServiceAccount) {
    return execFileSync(
      "gcloud",
      [
        "auth",
        "application-default",
        "print-access-token",
        `--impersonate-service-account=${impersonatedServiceAccount}`,
        `--scopes=${scopes.join(",")}`,
        "--quiet",
      ],
      { encoding: "utf8" },
    ).trim();
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() || process.env.GA4_AUTH_MODE === "gcloud") {
    return execFileSync(
      "gcloud",
      ["auth", "application-default", "print-access-token", `--scopes=${scopes.join(",")}`, "--quiet"],
      { encoding: "utf8" },
    ).trim();
  }

  const key = readServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: key.client_email,
      scope: scopes.join(" "),
      aud: tokenUrl,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsignedJwt = `${header}.${claims}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(key.private_key, "base64url");
  const assertion = `${unsignedJwt}.${signature}`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Google OAuth token request failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload.access_token;
}

async function googleRequest({ url, method = "GET", body, token }) {
  const quotaProject = process.env.GOOGLE_CLOUD_QUOTA_PROJECT?.trim() || process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(quotaProject ? { "X-Goog-User-Project": quotaProject } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(async () => ({ text: await response.text().catch(() => "") }));

  if (!response.ok) {
    throw new Error(`Google API request failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

function getPropertyId() {
  return getRequiredEnv("GA4_PROPERTY_ID").replace(/^properties\//, "");
}

function parseCsv(value, fallback) {
  if (!value) {
    return fallback;
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeReportResponse(response) {
  const dimensionHeaders = response.dimensionHeaders?.map((header) => header.name) ?? [];
  const metricHeaders = response.metricHeaders?.map((header) => header.name) ?? [];
  const rows = response.rows?.map((row) => {
    const output = {};
    dimensionHeaders.forEach((name, index) => {
      output[name] = row.dimensionValues?.[index]?.value ?? "";
    });
    metricHeaders.forEach((name, index) => {
      output[name] = row.metricValues?.[index]?.value ?? "0";
    });
    return output;
  }) ?? [];

  return {
    rowCount: response.rowCount ?? rows.length,
    dimensionHeaders,
    metricHeaders,
    rows,
  };
}

async function runReport(args) {
  const propertyId = getPropertyId();
  const token = await getAccessToken(["https://www.googleapis.com/auth/analytics.readonly"]);
  const presetName = args.preset ?? "overview";
  const preset = reportPresets[presetName];

  if (!preset) {
    throw new Error(`Unknown preset "${presetName}". Use one of: ${Object.keys(reportPresets).join(", ")}`);
  }

  const limit = Number(args.limit ?? 25);
  const startDate = args["start-date"] ?? "7daysAgo";
  const endDate = args["end-date"] ?? "today";
  const customDimensionsArg = parseCsv(args.dimensions, undefined);
  const customMetricsArg = parseCsv(args.metrics, undefined);
  const body = customDimensionsArg || customMetricsArg
    ? {
        dateRanges: preset.endpoint === "runRealtimeReport" ? undefined : [{ startDate, endDate }],
        dimensions: (customDimensionsArg ?? []).map((name) => ({ name })),
        metrics: (customMetricsArg ?? ["activeUsers"]).map((name) => ({ name })),
        limit,
      }
    : preset.body({ startDate, endDate, limit });

  if (body.dateRanges === undefined) {
    delete body.dateRanges;
  }

  const endpoint = preset.endpoint === "runRealtimeReport"
    ? `${dataApiBaseUrl}/properties/${propertyId}:runRealtimeReport`
    : `${dataApiBaseUrl}/properties/${propertyId}:runReport`;

  const response = await googleRequest({ url: endpoint, method: "POST", body, token });
  const normalized = normalizeReportResponse(response);
  console.log(JSON.stringify({
    property: `properties/${propertyId}`,
    preset: presetName,
    startDate: preset.endpoint === "runRealtimeReport" ? undefined : startDate,
    endDate: preset.endpoint === "runRealtimeReport" ? undefined : endDate,
    ...normalized,
  }, null, 2));
}

async function listCustomDimensions({ propertyId, token }) {
  const dimensions = [];
  let pageToken;

  do {
    const url = new URL(`${adminApiBaseUrl}/properties/${propertyId}/customDimensions`);
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }
    const response = await googleRequest({ url, token });
    dimensions.push(...(response.customDimensions ?? []));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return dimensions;
}

async function setupCustomDimensions() {
  const propertyId = getPropertyId();
  const token = await getAccessToken(["https://www.googleapis.com/auth/analytics.edit"]);
  const existing = await listCustomDimensions({ propertyId, token });
  const existingByParameter = new Map(existing.map((dimension) => [dimension.parameterName, dimension]));
  const results = [];

  for (const dimension of customDimensions) {
    const existingDimension = existingByParameter.get(dimension.parameterName);
    if (existingDimension) {
      results.push({
        action: "exists",
        parameterName: dimension.parameterName,
        displayName: existingDimension.displayName,
        name: existingDimension.name,
      });
      continue;
    }

    const created = await googleRequest({
      url: `${adminApiBaseUrl}/properties/${propertyId}/customDimensions`,
      method: "POST",
      body: dimension,
      token,
    });
    results.push({
      action: "created",
      parameterName: dimension.parameterName,
      displayName: created.displayName,
      name: created.name,
    });
  }

  console.log(JSON.stringify({ property: `properties/${propertyId}`, results }, null, 2));
}

function printHelp() {
  console.log(`Usage:
  pnpm ga4:report -- --preset=overview --start-date=7daysAgo --end-date=today
  pnpm ga4:report -- --preset=routes --limit=25
  pnpm ga4:report -- --preset=events
  pnpm ga4:report -- --preset=portal
  pnpm ga4:report -- --preset=realtime
  pnpm ga4:setup-custom-dimensions

Required environment:
  GA4_PROPERTY_ID

Authentication options:
  Preferred local path: authenticated gcloud ADC account
  Keyless service account path: GA4_IMPERSONATE_SERVICE_ACCOUNT
  Optional service account path: GOOGLE_APPLICATION_CREDENTIALS

Optional quota project:
  GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_QUOTA_PROJECT

Optional report args:
  --preset=overview|routes|events|portal|realtime
  --start-date=YYYY-MM-DD|7daysAgo
  --end-date=YYYY-MM-DD|today
  --limit=25
  --dimensions=eventName,pagePath
  --metrics=eventCount,activeUsers`);
}

async function main() {
  const { command, args } = getArgs(process.argv);

  if (!command || command === "help" || args.help) {
    printHelp();
    return;
  }

  if (command === "report") {
    await runReport(args);
    return;
  }

  if (command === "setup-custom-dimensions") {
    await setupCustomDimensions();
    return;
  }

  throw new Error(`Unknown command "${command}".`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
