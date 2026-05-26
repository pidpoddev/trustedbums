const MESSAGE_TYPE = "TRUSTED_BUMS_CAPTURE_LINKEDIN_PAGE";

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstText(selectors: string[]) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = cleanText(element?.textContent);
    if (text) {
      return text;
    }
  }
  return "";
}

function getMetaContent(nameOrProperty: string) {
  const escaped = nameOrProperty.replace(/"/g, '\\"');
  const element =
    document.querySelector(`meta[property="${escaped}"]`) ||
    document.querySelector(`meta[name="${escaped}"]`);
  return cleanText(element?.getAttribute("content"));
}

function getLinkedInCapture() {
  const pathname = window.location.pathname;
  const captureType = pathname.startsWith("/company/") ? "LINKEDIN_COMPANY" : "LINKEDIN_PROFILE";
  const headline = firstText([
    ".text-body-medium.break-words",
    ".org-top-card-summary__tagline",
    ".pv-text-details__left-panel .text-body-medium",
    "[data-generated-suggestion-target] .text-body-medium",
  ]);
  const title =
    firstText([
      "h1",
      ".org-top-card-summary__title",
      ".pv-text-details__left-panel h1",
    ]) ||
    getMetaContent("og:title") ||
    document.title;
  const selectedText = cleanText(window.getSelection?.().toString());
  const description =
    getMetaContent("og:description") ||
    firstText([
      ".org-top-card-summary-info-list",
      ".pv-text-details__left-panel",
      "main",
    ]);

  return {
    captureType,
    sourceUrl: window.location.href,
    pageTitle: cleanText(document.title || title),
    profileName: title,
    headline,
    selectedText,
    description: description.slice(0, 1200),
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== MESSAGE_TYPE) {
    return false;
  }

  sendResponse({ ok: true, capture: getLinkedInCapture() });
  return true;
});

