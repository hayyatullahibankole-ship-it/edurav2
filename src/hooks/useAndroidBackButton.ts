import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import { useLocation, useNavigate } from "react-router-dom";

export function useAndroidBackButton(rootPaths: string[] = ["/"]) {
  const navigate = useNavigate();
  const location = useLocation();
  const lastBackPress = useRef(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener: PluginListenerHandle | null = null;
    let cancelled = false;

    (async () => {
      listener = await CapApp.addListener("backButton", ({ canGoBack }) => {
        const isRoot = rootPaths.includes(location.pathname);

        // Navigate back inside app if possible
        if (canGoBack && !isRoot) {
          navigate(-1);
          return;
        }

        // On root: double-tap to exit (prevents instant close)
        const now = Date.now();
        if (now - lastBackPress.current < 1500) {
          CapApp.exitApp();
        } else {
          lastBackPress.current = now;
          console.log("Press back again to exit");
        }
      });

      // If the effect already cleaned up before listener resolved
      if (cancelled && listener) {
        await listener.remove();
        listener = null;
      }
    })();

    return () => {
      cancelled = true;
      if (listener) {
        // remove() returns Promise<void> in some versions, safe to ignore
        void listener.remove();
        listener = null;
      }
    };
  }, [navigate, location.pathname, rootPaths]);
}
