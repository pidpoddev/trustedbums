const required = [
  "QA_BASE_URL",
  "QA_ADMIN_EMAIL",
  "QA_ADMIN_PASSWORD",
  "QA_CLIENT_ADMIN_EMAIL",
  "QA_CLIENT_ADMIN_PASSWORD",
  "QA_CLIENT_FINANCE_EMAIL",
  "QA_CLIENT_FINANCE_PASSWORD",
  "QA_CLIENT_MEMBER_EMAIL",
  "QA_CLIENT_MEMBER_PASSWORD",
  "QA_BUM_EMAIL",
  "QA_BUM_PASSWORD",
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing QA environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
