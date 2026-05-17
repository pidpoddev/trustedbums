const required = [
  "QA_BASE_URL",
  "VITE_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "QA_ADMIN_EMAIL",
  "QA_CLIENT_ADMIN_EMAIL",
  "QA_CLIENT_FINANCE_EMAIL",
  "QA_CLIENT_MEMBER_EMAIL",
  "QA_BUM_EMAIL",
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing QA environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
