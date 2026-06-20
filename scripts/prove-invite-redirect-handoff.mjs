#!/usr/bin/env node

import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { chromium } from "@playwright/test";

const requiredEnv = ["QA_BASE_URL", "QA_SUPABASE_FUNCTIONS_URL", "CLERK_SECRET_KEY", "QA_ADMIN_EMAIL"];
const missing = requiredEnv.filter((name) => !process.env[name]?.trim());

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}.`);
}

const targetEmail = process.env.TB_INVITE_SMOKE_EMAIL?.trim() || `ryanmp29+tb0026-${Date.now()}@gmail.com`;
const requestedRedirect = "https://trustedbums.com/client/dashboard?next=https://evil.example/phish";
const expectedRedirect = "https://trustedbums.com/login";
const baseUrl = process.env.QA_BASE_URL.replace(/\/+$/, "");
const functionsUrl = process.env.QA_SUPABASE_FUNCTIONS_URL.replace(/\/+$/, "");

await clerkSetup({ dotenv: false });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ baseURL: baseUrl });

try {
  await page.addInitScript(() => {
    window.localStorage.setItem("trustedbums:first-login-walkthrough:disable-autostart", "true");
  });
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForFunction(() => Boolean(window.Clerk?.loaded), undefined, { timeout: 30_000 });
  await clerk.signIn({ page, emailAddress: process.env.QA_ADMIN_EMAIL });
  await page.waitForFunction(() => Boolean(window.Clerk?.session), undefined, { timeout: 30_000 });

  const token = await page.evaluate(async () => {
    return (await window.Clerk?.session?.getToken?.()) ?? null;
  });

  if (!token) {
    throw new Error("Unable to read an authenticated Clerk session token for the QA admin.");
  }

  const response = await fetch(`${functionsUrl}/invite-bum`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: targetEmail,
      name: "TB-0026 Invite Smoke",
      note: "Safe QA proof for approved redirect handoff.",
      referralSource: "Ryan-approved TB-0026 smoke",
      trustConfirmed: true,
      redirectUrl: requestedRedirect,
    }),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.invited || !payload.invitationId) {
    throw new Error(`Invite smoke failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  let clerkInvitationStatus = null;
  let clerkRedirectUrl = null;
  const clerkRead = await fetch("https://api.clerk.com/v1/invitations?limit=20", {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      Accept: "application/json",
    },
  });

  if (clerkRead.ok) {
    const readPayload = await clerkRead.json();
    const invitations = Array.isArray(readPayload) ? readPayload : readPayload.data ?? [];
    const invitation = invitations.find((item) => item.id === payload.invitationId);
    clerkInvitationStatus = invitation?.status ?? null;
    clerkRedirectUrl = invitation?.redirect_url ?? invitation?.redirectUrl ?? null;
    if (clerkRedirectUrl && clerkRedirectUrl !== expectedRedirect) {
      throw new Error(`Clerk invitation redirect was ${clerkRedirectUrl}; expected ${expectedRedirect}.`);
    }
    if (!invitation) {
      throw new Error(`Clerk invitation ${payload.invitationId} was not visible in the recent invitation list.`);
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        trackingId: "TB-0026",
        email: targetEmail,
        invitationId: payload.invitationId,
        status: payload.status ?? null,
        requestedRedirect,
        expectedRedirect,
        clerkReadbackAvailable: clerkRead.ok,
        clerkInvitationStatus,
        clerkRedirectUrl,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
