#!/usr/bin/env node

import crypto from "node:crypto";

const API_URL = "https://api.dreamhost.com/";
const key = process.env.DREAMHOST_API_KEY;

function usage(exitCode = 0) {
  console.log(`Usage:
  DREAMHOST_API_KEY=... node scripts/dreamhost-dns.mjs list [domain]
  DREAMHOST_API_KEY=... node scripts/dreamhost-dns.mjs add <record> <type> <value> [comment]
  DREAMHOST_API_KEY=... node scripts/dreamhost-dns.mjs remove <record> <type> <value>

Examples:
  node scripts/dreamhost-dns.mjs list trustedbums.com
  node scripts/dreamhost-dns.mjs add selector1._domainkey.trustedbums.com CNAME selector1-example._domainkey.example.onmicrosoft.com
`);
  process.exit(exitCode);
}

async function callDreamHost(cmd, params = {}) {
  if (!key) {
    throw new Error("Missing DREAMHOST_API_KEY in the environment.");
  }

  const url = new URL(API_URL);
  url.searchParams.set("key", key);
  url.searchParams.set("cmd", cmd);
  url.searchParams.set("format", "json");

  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(name, value);
    }
  }

  if (cmd !== "dns-list_records") {
    url.searchParams.set("unique_id", crypto.randomUUID());
  }

  const response = await fetch(url);
  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`DreamHost returned non-JSON response (${response.status}): ${text}`);
  }

  if (!response.ok || payload.result === "error") {
    const reason = payload.reason || payload.data || text;
    throw new Error(`DreamHost ${cmd} failed: ${reason}`);
  }

  return payload;
}

function printRecords(records, domain) {
  const filtered = domain
    ? records.filter((record) => record.record === domain || record.record.endsWith(`.${domain}`))
    : records;

  if (filtered.length === 0) {
    console.log(domain ? `No records found for ${domain}.` : "No records found.");
    return;
  }

  for (const record of filtered) {
    console.log(`${record.record}\t${record.type}\t${record.value}`);
  }
}

const [command, ...args] = process.argv.slice(2);

try {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
  }

  if (command === "list") {
    const [domain] = args;
    const payload = await callDreamHost("dns-list_records");
    printRecords(payload.data || [], domain);
  } else if (command === "add") {
    const [record, type, value, comment] = args;
    if (!record || !type || !value) usage(1);
    const payload = await callDreamHost("dns-add_record", { record, type, value, comment });
    console.log(payload.data || "record_added");
  } else if (command === "remove") {
    const [record, type, value] = args;
    if (!record || !type || !value) usage(1);
    const payload = await callDreamHost("dns-remove_record", { record, type, value });
    console.log(payload.data || "record_removed");
  } else {
    usage(1);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
