import { Capacitor } from "@capacitor/core";

/**
 * Open an external URL.
 * - Native app: system in-app browser (Chrome Custom Tab / SFSafariViewController)
 *   so the student stays inside the app flow and can swipe back.
 * - Web: new tab.
 */
export const openExternal = async (url: string) => {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({
        url,
        presentationStyle: "popover",
        toolbarColor: "#12B76A",
      });
      return;
    }
  } catch {
    /* fall through to a normal tab */
  }
  window.open(url, "_blank", "noopener,noreferrer");
};

/** Akboy Campus Hub — the education news / opportunities feed. */
export const EDUCATION_NEWS_URL = "https://akboy.space/campus-hub";
