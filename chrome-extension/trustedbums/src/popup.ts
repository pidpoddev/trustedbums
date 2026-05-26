import { createClerkClient } from "@clerk/chrome-extension/client";

const DEFAULT_API_BASE_URL =
  process.env.TRUSTED_BUMS_EXTENSION_API_BASE_URL ||
  "https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/extension-api-v1";
const DEFAULT_SYNC_HOST = process.env.TRUSTED_BUMS_EXTENSION_SYNC_HOST || process.env.CLERK_FRONTEND_API || "https://clerk.trustedbums.com";
const CAPTURE_MESSAGE_TYPE = "TRUSTED_BUMS_CAPTURE_LINKEDIN_PAGE";
const EXTENSION_URL = chrome.runtime.getURL(".");
const POPUP_URL = `${EXTENSION_URL}popup.html`;

type DestinationType = "OPPORTUNITY_REGISTRATION" | "CUSTOMER_TARGET";

interface LinkedInCapture {
  captureType: "LINKEDIN_PROFILE" | "LINKEDIN_COMPANY";
  sourceUrl: string;
  pageTitle: string;
  profileName: string;
  headline: string;
  selectedText: string;
  description: string;
}

interface ExtensionDestination {
  id: string;
  destinationType: DestinationType;
  targetAccountName?: string;
  companyName?: string | null;
  clientCompanyName?: string | null;
}

interface ExtensionContext {
  destinations: {
    opportunities?: ExtensionDestination[];
    customerTargets?: ExtensionDestination[];
  };
}

const state: {
  capture: LinkedInCapture | null;
  context: ExtensionContext | null;
} = {
  capture: null,
  context: null,
};

const testWindow = window as typeof window & { __trustedBumsMockClerk?: ReturnType<typeof createClerkClient> };
const clerk = testWindow.__trustedBumsMockClerk ?? createClerkClient({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY, syncHost: DEFAULT_SYNC_HOST });

const els = {
  status: document.querySelector("#status") as HTMLElement,
  authPanel: document.querySelector("#authPanel") as HTMLElement,
  signedInIdentity: document.querySelector("#signedInIdentity") as HTMLElement,
  signIn: document.querySelector("#signIn") as HTMLButtonElement,
  signOut: document.querySelector("#signOut") as HTMLButtonElement,
  capturePanel: document.querySelector("#capturePanel") as HTMLElement,
  profileName: document.querySelector("#profileName") as HTMLElement,
  headline: document.querySelector("#headline") as HTMLElement,
  selectedText: document.querySelector("#selectedText") as HTMLElement,
  destination: document.querySelector("#destination") as HTMLSelectElement,
  note: document.querySelector("#note") as HTMLTextAreaElement,
  refreshContext: document.querySelector("#refreshContext") as HTMLButtonElement,
  sendCapture: document.querySelector("#sendCapture") as HTMLButtonElement,
};

function setStatus(message: string, tone = "") {
  els.status.textContent = message;
  els.status.className = ["status", tone].filter(Boolean).join(" ");
}

function setBusy(isBusy: boolean) {
  els.refreshContext.disabled = isBusy;
  els.sendCapture.disabled = isBusy;
  els.signIn.disabled = isBusy;
  els.signOut.disabled = isBusy;
}

function truncate(value: string | undefined, maxLength: number) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function getActiveLinkedInTab() {
  return new Promise<chrome.tabs.Tab>((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs?.[0];
      if (!tab?.id || !tab.url) {
        reject(new Error("Open a LinkedIn profile or company page first."));
        return;
      }

      if (!/^https:\/\/www\.linkedin\.com\/(in|company)\//.test(tab.url)) {
        reject(new Error("This extension works on LinkedIn profile and company pages."));
        return;
      }

      resolve(tab);
    });
  });
}

function requestPageCapture(tabId: number) {
  return new Promise<LinkedInCapture>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: CAPTURE_MESSAGE_TYPE }, (response) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) {
        reject(new Error("Reload the LinkedIn page, then try again."));
        return;
      }

      if (!response?.ok || !response.capture) {
        reject(new Error("Unable to read this LinkedIn page."));
        return;
      }

      resolve(response.capture);
    });
  });
}

async function getSessionToken() {
  if (!clerk.session) {
    return null;
  }
  return clerk.session.getToken();
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const token = await getSessionToken();
  if (!token) {
    throw new Error("Sign in to Trusted Bums first.");
  }

  const response = await fetch(`${DEFAULT_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `Trusted Bums API returned ${response.status}.`);
  }

  return payload;
}

function destinationLabel(destination: ExtensionDestination) {
  const prefix = destination.destinationType === "CUSTOMER_TARGET" ? "Target" : "Opportunity";
  const account = destination.targetAccountName || "Untitled account";
  const company = destination.companyName || destination.clientCompanyName;
  return company ? `${prefix}: ${account} (${company})` : `${prefix}: ${account}`;
}

function renderDestinations() {
  const opportunities = state.context?.destinations?.opportunities || [];
  const customerTargets = state.context?.destinations?.customerTargets || [];
  const destinations = [...opportunities, ...customerTargets];

  els.destination.replaceChildren();

  if (destinations.length === 0) {
    const option = new Option("No available destinations", "");
    els.destination.append(option);
    els.destination.disabled = true;
    els.sendCapture.disabled = true;
    return;
  }

  for (const destination of destinations) {
    const option = new Option(
      destinationLabel(destination),
      JSON.stringify({
        destinationType: destination.destinationType,
        id: destination.id,
      }),
    );
    els.destination.append(option);
  }

  els.destination.disabled = false;
  els.sendCapture.disabled = false;
}

function renderCapture() {
  els.profileName.textContent = state.capture?.profileName || "Unknown LinkedIn page";
  els.headline.textContent = state.capture?.headline || state.capture?.description || "No headline found";
  els.selectedText.textContent = state.capture?.selectedText || "None";
  els.capturePanel.classList.remove("hidden");
}

function renderAuth() {
  const email = clerk.user?.primaryEmailAddress?.emailAddress;
  els.signedInIdentity.textContent = email ? `Signed in as ${email}` : "Sign in to load destinations.";
  els.signIn.classList.toggle("hidden", Boolean(clerk.user));
  els.signOut.classList.toggle("hidden", !clerk.user);
}

async function refreshContext() {
  state.context = await fetchApi("/context");
  renderDestinations();
}

function createClientRequestId(capture: LinkedInCapture) {
  const randomPart = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
  return `tb-linkedin-${Date.now()}-${randomPart}-${capture.sourceUrl.slice(0, 48)}`.slice(0, 128);
}

async function sendCapture() {
  if (!state.capture) {
    throw new Error("No LinkedIn page capture is ready.");
  }

  const selectedDestination = JSON.parse(els.destination.value || "{}") as {
    destinationType?: DestinationType;
    id?: string;
  };
  if (!selectedDestination.destinationType || !selectedDestination.id) {
    throw new Error("Choose a destination first.");
  }

  const body: {
    destinationType: DestinationType;
    clientRequestId: string;
    captureType: LinkedInCapture["captureType"];
    sourceUrl: string;
    pageTitle: string;
    selectedText: string;
    note: string;
    metadata: Record<string, string>;
    opportunityId?: string;
    customerTargetId?: string;
  } = {
    destinationType: selectedDestination.destinationType,
    clientRequestId: createClientRequestId(state.capture),
    captureType: state.capture.captureType,
    sourceUrl: state.capture.sourceUrl,
    pageTitle: truncate(state.capture.pageTitle, 300),
    selectedText: truncate(state.capture.selectedText || state.capture.description, 4000),
    note: truncate(els.note.value, 2000),
    metadata: {
      extensionVersion: chrome.runtime.getManifest().version,
      profileName: state.capture.profileName,
      headline: state.capture.headline,
    },
  };

  if (selectedDestination.destinationType === "OPPORTUNITY_REGISTRATION") {
    body.opportunityId = selectedDestination.id;
  } else {
    body.customerTargetId = selectedDestination.id;
  }

  await fetchApi("/page-captures", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function initialize() {
  try {
    if (!process.env.CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY.includes("YOUR_")) {
      throw new Error("Build the extension with CLERK_PUBLISHABLE_KEY set.");
    }

    els.authPanel.classList.remove("hidden");

    await clerk.load({
      afterSignOutUrl: POPUP_URL,
      signInForceRedirectUrl: POPUP_URL,
      signUpForceRedirectUrl: POPUP_URL,
      allowedRedirectProtocols: ["chrome-extension:"],
    });
    clerk.addListener(renderAuth);
    renderAuth();

    const tab = await getActiveLinkedInTab();
    state.capture = await requestPageCapture(tab.id!);
    renderCapture();

    if (clerk.session) {
      await refreshContext();
      setStatus("Ready to send this page to Trusted Bums.", "success");
    } else {
      setStatus("Sign in to Trusted Bums to load destinations.", "error");
    }
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to start extension.", "error");
  }
}

els.signIn.addEventListener("click", () => {
  clerk.openSignIn({});
});

els.signOut.addEventListener("click", () => {
  void clerk.signOut({ redirectUrl: POPUP_URL });
});

els.refreshContext.addEventListener("click", async () => {
  try {
    setBusy(true);
    await refreshContext();
    setStatus("Destinations refreshed.", "success");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to refresh destinations.", "error");
  } finally {
    setBusy(false);
  }
});

els.sendCapture.addEventListener("click", async () => {
  try {
    setBusy(true);
    await sendCapture();
    setStatus("Sent to Trusted Bums as a draft capture.", "success");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unable to send capture.", "error");
  } finally {
    setBusy(false);
  }
});

void initialize();
