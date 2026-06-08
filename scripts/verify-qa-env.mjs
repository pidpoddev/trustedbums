const roleEmailEnv = {
  ADMIN: "QA_ADMIN_EMAIL",
  CLIENT_ADMIN: "QA_CLIENT_ADMIN_EMAIL",
  CLIENT_FINANCE: "QA_CLIENT_FINANCE_EMAIL",
  CLIENT_MEMBER: "QA_CLIENT_MEMBER_EMAIL",
  BUM: "QA_BUM_EMAIL",
};

const visualRoleEmailEnv = {
  ADMIN: roleEmailEnv.ADMIN,
  CLIENT_ADMIN: roleEmailEnv.CLIENT_ADMIN,
  CLIENT_FINANCE: roleEmailEnv.CLIENT_FINANCE,
  BUM: roleEmailEnv.BUM,
};

const baseRequired = [
  "QA_BASE_URL",
  "VITE_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
];

const conditionalRequired = [];
const extensionApiExpectation = (process.env.QA_EXTENSION_API_EXPECTATION?.trim().toLowerCase() || "optional");

if (!["required", "optional", "skip"].includes(extensionApiExpectation)) {
  console.error("Invalid QA_EXTENSION_API_EXPECTATION value. Allowed values: required, optional, skip.");
  process.exit(1);
}

if (extensionApiExpectation === "required") {
  conditionalRequired.push("QA_EXTENSION_API_BASE_URL");
}

if (extensionApiExpectation !== "skip" && (extensionApiExpectation === "required" || process.env.QA_EXTENSION_API_BASE_URL?.trim())) {
  conditionalRequired.push("QA_EXTENSION_API_TOKEN");
}

function getSelectedRoles() {
  const rawRoles = process.env.QA_VISUAL_ROLES?.trim();

  if (!rawRoles) {
    return Object.keys(roleEmailEnv);
  }

  const selectedRoles = rawRoles
    .split(",")
    .map((role) => role.trim().toUpperCase())
    .filter(Boolean);
  const invalidRoles = selectedRoles.filter((role) => !visualRoleEmailEnv[role]);

  if (invalidRoles.length) {
    console.error(
      "Invalid QA_VISUAL_ROLES value(s): " +
        invalidRoles.join(", ") +
        ". Allowed values: " +
        Object.keys(visualRoleEmailEnv).join(", ") +
        ".",
    );
    process.exit(1);
  }

  return selectedRoles;
}

const required = [
  ...baseRequired,
  ...conditionalRequired,
  ...getSelectedRoles().map((role) => roleEmailEnv[role]),
];
const missing = [...new Set(required)].filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing QA environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
