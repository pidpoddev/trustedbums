import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  consentCategories,
  createConsentRecord,
  defaultConsentPreferences,
  clearConsentRecord,
  readConsentRecord,
  writeConsentRecord,
  type ConsentCategory,
  type ConsentPreferences,
  type ConsentRecord,
} from "@/lib/consent";

function clonePreferences(preferences: ConsentPreferences): ConsentPreferences {
  return { ...preferences, necessary: true };
}

export function ConsentManager() {
  const [record, setRecord] = useState<ConsentRecord | null>(() => readConsentRecord());
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState<ConsentPreferences>(() => clonePreferences(record?.preferences ?? defaultConsentPreferences));

  useEffect(() => {
    const handler = (event: Event) => {
      const nextRecord = (event as CustomEvent<ConsentRecord | null>).detail ?? readConsentRecord();
      setRecord(nextRecord);
      setDraft(clonePreferences(nextRecord?.preferences ?? defaultConsentPreferences));
    };

    const openHandler = () => {
      const nextRecord = readConsentRecord();
      setRecord(nextRecord);
      setDraft(clonePreferences(nextRecord?.preferences ?? defaultConsentPreferences));
      setShowSettings(true);
      setIsOpen(true);
    };

    window.addEventListener("trustedbums:consent-change", handler);
    window.addEventListener("trustedbums:open-consent-settings", openHandler);
    return () => {
      window.removeEventListener("trustedbums:consent-change", handler);
      window.removeEventListener("trustedbums:open-consent-settings", openHandler);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("consent") === "reset") {
      clearConsentRecord();
      setRecord(null);
      setDraft(clonePreferences(defaultConsentPreferences));
      setShowSettings(false);
      setIsOpen(true);
      return;
    }

    if (params.get("consent") === "open") {
      setShowSettings(true);
      setIsOpen(true);
      return;
    }

    if (!record) {
      setIsOpen(true);
    }
  }, [record]);

  const savePreferences = (preferences: ConsentPreferences, source: ConsentRecord["source"] = "settings") => {
    const nextRecord = createConsentRecord(preferences, source);
    writeConsentRecord(nextRecord);
    setRecord(nextRecord);
    setDraft(clonePreferences(nextRecord.preferences));
    setIsOpen(false);
    setShowSettings(false);
  };

  const updateDraft = (category: ConsentCategory, enabled: boolean) => {
    if (category === "necessary") {
      return;
    }

    setDraft((current) => ({ ...current, [category]: enabled, necessary: true }));
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[100] px-3 pb-3 sm:px-6 sm:pb-6">
          <div className="mx-auto grid max-h-[78vh] w-full max-w-4xl gap-4 overflow-auto rounded-lg border bg-background p-4 text-foreground shadow-2xl animate-in slide-in-from-bottom-4 duration-300 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:p-5">
            <div className="max-w-4xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Privacy choices</h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
We use necessary storage to run the site. Optional preferences, analytics, and outreach measurement stay off unless you choose them.
              </p>
              <p className="text-xs text-muted-foreground">
                See the <Link to="/privacy-policy" className="font-medium text-primary underline-offset-4 hover:underline">Privacy Policy</Link> for more detail.
              </p>

              {showSettings ? (
                <div className="grid gap-3 pt-2 md:grid-cols-2">
                  {consentCategories.map((category) => (
                    <div key={category.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{category.title}</h3>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">{category.description}</p>
                        </div>
                        <Switch
                          checked={draft[category.id]}
                          disabled={category.required}
                          onCheckedChange={(checked) => updateDraft(category.id, checked)}
                          aria-label={`${category.title} consent`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 md:min-w-44">
              <Button variant="outline" onClick={() => savePreferences(defaultConsentPreferences, "banner")}>Reject all</Button>
              <Button onClick={() => savePreferences({ necessary: true, preferences: true, analytics: true, marketing: true }, "banner")}>Accept all</Button>
              <Button variant="ghost" onClick={() => setShowSettings((current) => !current)}>
                {showSettings ? "Hide settings" : "Customize"}
              </Button>
              {showSettings ? <Button variant="outline" onClick={() => savePreferences(draft, "settings")}>Save choices</Button> : null}
            </div>
          </div>
        </div>
      ) : null}

      {!isOpen ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="fixed bottom-4 left-4 z-40 bg-background shadow-lg"
          onClick={() => {
            setDraft(clonePreferences(record?.preferences ?? defaultConsentPreferences));
            setShowSettings(true);
            setIsOpen(true);
          }}
        >
          Privacy choices
        </Button>
      ) : null}
    </>
  );
}
