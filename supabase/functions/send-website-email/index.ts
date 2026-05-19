import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ContactSubmissionEmail {
  template?: "contact-submission";
  name?: string;
  email?: string;
  companyName?: string;
  interest?: "CLIENT" | "BUM" | "GENERAL";
  targetAccounts?: string;
  message?: string;
  website?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const microsoftTenantId = Deno.env.get("MICROSOFT_TENANT_ID");
const microsoftClientId = Deno.env.get("MICROSOFT_CLIENT_ID");
const microsoftClientSecret = Deno.env.get("MICROSOFT_CLIENT_SECRET");
const microsoftSenderEmail = Deno.env.get("MICROSOFT_ORGANIZER_EMAIL") ?? "bums@trustedbums.com";
const websiteContactNotifyTo = Deno.env.get("WEBSITE_CONTACT_NOTIFY_TO") ?? microsoftSenderEmail;

function json(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

function toCleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getMicrosoftAccessToken() {
  if (!microsoftTenantId || !microsoftClientId || !microsoftClientSecret) {
    throw new Error("Microsoft Graph credentials are not configured in Supabase Edge Function secrets.");
  }

  const response = await fetch(`https://login.microsoftonline.com/${microsoftTenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: microsoftClientId,
      client_secret: microsoftClientSecret,
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default",
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    const detail = [payload.error, payload.error_description].filter(Boolean).join(": ");
    throw new Error(detail || `Microsoft rejected the email credentials with HTTP ${response.status}.`);
  }

  return payload.access_token;
}

function buildContactEmail(input: ContactSubmissionEmail) {
  if (input.website?.trim()) {
    return null;
  }

  const name = toCleanString(input.name, 120);
  const email = toCleanString(input.email, 180).toLowerCase();
  const companyName = toCleanString(input.companyName, 180);
  const interest = input.interest === "BUM" || input.interest === "GENERAL" ? input.interest : "CLIENT";
  const targetAccounts = toCleanString(input.targetAccounts, 1000);
  const message = toCleanString(input.message, 4000);

  if (name.length < 2 || !isEmail(email) || message.length < 10) {
    throw new Error("The contact submission is missing required fields.");
  }

  const subject = `Trusted Bums contact: ${name}${companyName ? ` at ${companyName}` : ""}`;
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Company", companyName || "Not provided"],
    ["Interest", interest],
    ["Target accounts", targetAccounts || "Not provided"],
  ];

  const bodyRows = rows
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
    .join("\n");

  return {
    subject,
    replyTo: email,
    bodyHtml: `
      <div>
        <h2>New Trusted Bums contact submission</h2>
        ${bodyRows}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      </div>
    `,
  };
}

async function sendMicrosoftEmail(input: { accessToken: string; subject: string; bodyHtml: string; replyTo: string }) {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(microsoftSenderEmail)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: input.subject,
          body: {
            contentType: "HTML",
            content: input.bodyHtml,
          },
          toRecipients: [
            {
              emailAddress: {
                address: websiteContactNotifyTo,
              },
            },
          ],
          replyTo: [
            {
              emailAddress: {
                address: input.replyTo,
              },
            },
          ],
        },
        saveToSentItems: true,
      }),
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: { code?: string; message?: string };
    };
    const detail = [payload.error?.code, payload.error?.message].filter(Boolean).join(": ");
    throw new Error(detail || `Microsoft Graph sendMail failed with HTTP ${response.status}.`);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    const input = (await request.json().catch(() => ({}))) as ContactSubmissionEmail;

    if (input.template !== "contact-submission") {
      return json(400, { error: "Unsupported email template." });
    }

    const email = buildContactEmail(input);

    if (!email) {
      return json(200, { sent: false });
    }

    const accessToken = await getMicrosoftAccessToken();
    await sendMicrosoftEmail({ accessToken, ...email });

    return json(200, { sent: true });
  } catch (error) {
    console.error("Unable to send website email", error);
    return json(500, { error: error instanceof Error ? error.message : "Unable to send website email." });
  }
});
