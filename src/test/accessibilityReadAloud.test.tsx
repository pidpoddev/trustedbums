import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessibilityProvider, useAccessibility } from "@/contexts/AccessibilityContext";

class TestSpeechSynthesisUtterance {
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

function ReadAloudHarness() {
  const { isReadSelectionEnabled, setReadSelectionEnabled } = useAccessibility();

  return (
    <div>
      <button type="button" onClick={() => setReadSelectionEnabled(!isReadSelectionEnabled)}>
        {isReadSelectionEnabled ? "Read aloud on" : "Read aloud off"}
      </button>
      <p data-testid="source-text">Read this selected sentence to me.</p>
    </div>
  );
}

function selectElementText(element: HTMLElement) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

describe("accessibility read-aloud preference", () => {
  const speak = vi.fn();
  const cancel = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("SpeechSynthesisUtterance", TestSpeechSynthesisUtterance);
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speak,
        cancel,
      },
    });
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.getSelection()?.removeAllRanges();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("reads selected page text when the preference is enabled", async () => {
    render(
      <AccessibilityProvider>
        <ReadAloudHarness />
      </AccessibilityProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Read aloud off" }));
    await screen.findByRole("button", { name: "Read aloud on" });

    selectElementText(screen.getByTestId("source-text"));
    fireEvent.mouseUp(document);

    await waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
    expect(speak.mock.calls[0][0]).toMatchObject({ text: "Read this selected sentence to me." });
  });

  it("cancels speech and ignores selections when the preference is disabled", async () => {
    render(
      <AccessibilityProvider>
        <ReadAloudHarness />
      </AccessibilityProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Read aloud off" }));
    await screen.findByRole("button", { name: "Read aloud on" });

    fireEvent.click(screen.getByRole("button", { name: "Read aloud on" }));
    await screen.findByRole("button", { name: "Read aloud off" });

    selectElementText(screen.getByTestId("source-text"));
    fireEvent.mouseUp(document);

    expect(cancel).toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });
});
