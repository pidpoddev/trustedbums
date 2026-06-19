import { readdir, readFile } from "node:fs/promises";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF?.trim() || "vaoqvtxqvbptyxddpoju";
const CONFIG_PATH = "supabase/config.toml";
const MIGRATIONS_PATH = "supabase/migrations";

function parseFunctionConfig(configSource) {
  const functions = new Map();
  let currentFunction = null;

  for (const rawLine of configSource.split(/\r?\n/)) {
    const line = rawLine.trim();
    const sectionMatch = line.match(/^\[functions\.([^\]]+)\]$/);
    if (sectionMatch) {
      currentFunction = sectionMatch[1];
      continue;
    }

    if (line.startsWith("[") && !sectionMatch) {
      currentFunction = null;
      continue;
    }

    if (!currentFunction) {
      continue;
    }

    const verifyJwtMatch = line.match(/^verify_jwt\s*=\s*(true|false)$/);
    if (verifyJwtMatch) {
      functions.set(currentFunction, { verifyJwt: verifyJwtMatch[1] === "true" });
    }
  }

  return functions;
}

function parseCsv(value) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getLiveFunctionName(functionRecord) {
  return functionRecord.name ?? functionRecord.slug ?? functionRecord.id ?? "";
}

function getLiveVerifyJwt(functionRecord) {
  const rawValue = functionRecord.verify_jwt ?? functionRecord.verifyJwt ?? functionRecord.verifyJWT;
  if (typeof rawValue === "string") {
    return rawValue.toLowerCase() === "true";
  }

  return Boolean(rawValue);
}

function getLiveVersion(functionRecord) {
  return functionRecord.version ?? functionRecord.deploy_version ?? functionRecord.updated_at ?? "unknown";
}

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

if (!accessToken) {
  throw new Error("SUPABASE_ACCESS_TOKEN is required to prove live Supabase function provenance.");
}

const configSource = await readFile(CONFIG_PATH, "utf8");
const configuredFunctions = parseFunctionConfig(configSource);
const requestedFunctions = parseCsv(process.env.SUPABASE_PROVENANCE_FUNCTIONS);
const functionNames = requestedFunctions.length > 0 ? requestedFunctions : [...configuredFunctions.keys()].sort();

if (functionNames.length === 0) {
  throw new Error(`No Supabase functions were found in ${CONFIG_PATH}.`);
}

const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/functions`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Supabase function provenance request failed (${response.status}): ${body}`);
}

const payload = await response.json();
const liveFunctions = Array.isArray(payload) ? payload : payload.functions ?? [];
const liveByName = new Map(liveFunctions.map((functionRecord) => [getLiveFunctionName(functionRecord), functionRecord]));
const proofRows = [];
const failures = [];

for (const functionName of functionNames) {
  const expectedConfig = configuredFunctions.get(functionName);
  const liveFunction = liveByName.get(functionName);

  if (!expectedConfig) {
    failures.push(`${functionName}: missing from ${CONFIG_PATH}`);
    continue;
  }

  if (!liveFunction) {
    failures.push(`${functionName}: missing from live Supabase project ${PROJECT_REF}`);
    continue;
  }

  const liveVerifyJwt = getLiveVerifyJwt(liveFunction);
  if (liveVerifyJwt !== expectedConfig.verifyJwt) {
    failures.push(`${functionName}: live verify_jwt=${liveVerifyJwt} does not match ${CONFIG_PATH} verify_jwt=${expectedConfig.verifyJwt}`);
  }

  proofRows.push({
    name: functionName,
    version: getLiveVersion(liveFunction),
    status: liveFunction.status ?? "unknown",
    verify_jwt: liveVerifyJwt,
  });
}

const migrationFiles = (await readdir(MIGRATIONS_PATH))
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort();

if (migrationFiles.length === 0) {
  failures.push(`No migration files were found in ${MIGRATIONS_PATH}.`);
}

if (failures.length > 0) {
  console.error("Supabase release provenance failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  project_ref: PROJECT_REF,
  functions: proofRows,
  migrations: {
    count: migrationFiles.length,
    latest: migrationFiles.at(-1),
    recent: migrationFiles.slice(-5),
  },
}, null, 2));
