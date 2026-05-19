import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createConsentRecord, defaultConsentPreferences, readConsentRecord, writeConsentRecord } from "@/lib/consent";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { BrandLogo } from "@/components/BrandLogo";

const sections = [
  {
    title: "Information We Collect",
    body:
      "We may collect information you provide directly to Trusted Bums, including your name, email address, company details, account information, submitted opportunities, communications, and other business information you choose to share through the platform.",
  },
  {
    title: "How We Use Information",
    body:
      "We use information to operate the platform, provide account access, manage introductions and opportunities, communicate with users, improve our services, maintain security, and comply with legal obligations.",
  },
  {
    title: "How Information Is Shared",
    body:
      "We may share information with service providers that help us run the platform, with authorized users inside your organization, and when required to protect rights, investigate misuse, or comply with law. We do not sell personal information.",
  },
  {
    title: "Data Retention",
    body:
      "We retain information for as long as reasonably necessary to provide the service, maintain business records, resolve disputes, enforce agreements, and meet legal or operational requirements.",
  },
  {
    title: "Security",
    body:
      "We use reasonable administrative, technical, and organizational safeguards designed to protect information. No system can be guaranteed perfectly secure, so users should also take care to protect their credentials and account access.",
  },
  {
    title: "Cookies, Local Storage, and Consent",
    body:
      "Strictly necessary storage is used for security, authentication, accessibility, and remembering your consent choice. Preferences, analytics, and marketing or engagement measurement are optional and are disabled unless you choose them. You can reject all optional categories as easily as accepting them, and you can change your choices at any time using the Privacy choices control.",
  },
  {
    title: "Your Choices and EU/UK Rights",
    body:
      "Depending on your location, you may have rights to access, correct, delete, restrict, object to, or port personal data, and to withdraw consent where processing is based on consent. Withdrawing consent does not affect processing that occurred before withdrawal.",
  },
  {
    title: "Changes to This Policy",
    body:
      "We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page and revise the effective date below.",
  },
  {
    title: "Contact Us",
    body:
      "If you have questions about this Privacy Policy, data rights, or consent choices, contact Trusted Bums at bums@trustedbums.com.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <BrandLogo to="/" imageClassName="h-12" />
          <div className="flex items-center gap-3">
            <AccessibilityMenu />
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border bg-card p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">Effective Date: May 19, 2026</p>
            <h1 className="mt-3 font-display text-4xl font-bold">Privacy Policy</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              This Privacy Policy describes how Trusted Bums collects, uses, shares, and protects information in connection with the Trusted Bums website, platform, and related services.
            </p>
          </div>

          <div className="mt-8 rounded-xl border bg-background p-4">
            <h2 className="font-display text-xl font-bold">Manage Consent</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the consent manager to accept, reject, or customize optional categories. Strictly necessary storage remains on because the service cannot operate securely without it.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => writeConsentRecord(createConsentRecord(defaultConsentPreferences, "settings"))}
              >
                Reject optional categories
              </Button>
              <Button
                onClick={() => {
                  const current = readConsentRecord()?.preferences ?? defaultConsentPreferences;
                  writeConsentRecord(createConsentRecord({ ...current, necessary: true }, "settings"));
                  window.dispatchEvent(new Event("trustedbums:open-consent-settings"));
                }}
              >
                Review privacy choices
              </Button>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-display text-2xl font-bold">{section.title}</h2>
                <p className="leading-7 text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
