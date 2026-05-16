import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const root = createRoot(document.getElementById("root")!);

if (!clerkPublishableKey || clerkPublishableKey.includes("YOUR_")) {
  root.render(
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Trusted Bums configuration needed</h1>
      <p>Set a production Clerk publishable key in VITE_CLERK_PUBLISHABLE_KEY.</p>
    </div>,
  );
} else {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl={import.meta.env.BASE_URL}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
}
