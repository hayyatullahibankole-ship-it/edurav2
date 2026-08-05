import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerAppServiceWorker } from "./lib/registerAppServiceWorker";

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if ("serviceWorker" in navigator && (isInIframe || isPreviewHost)) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      return Promise.all(registrations.map((registration) => registration.unregister().catch(() => undefined)));
    })
    .catch(() => undefined);
}

void registerAppServiceWorker();

const root = document.getElementById("root");
if (!root) throw new Error("App root element not found");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
