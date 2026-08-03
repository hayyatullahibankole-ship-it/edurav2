import { useCallback, useEffect, useState } from "react";

export type AppSide = "cbt" | "services";

const STORAGE_KEY = "edura_app_side";
const EVENT = "edura-app-side-change";

export const readAppSide = (): AppSide | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "cbt" || value === "services" ? value : null;
  } catch {
    return null;
  }
};

export const writeAppSide = (side: AppSide) => {
  try {
    localStorage.setItem(STORAGE_KEY, side);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const clearAppSide = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
};

/**
 * Which side of Edura the student is currently in:
 * - "cbt"      → CBT practice, exams, study, forum
 * - "services" → educational services, wallet, requests, admissions
 */
export const useAppSide = () => {
  const [side, setSide] = useState<AppSide | null>(() => readAppSide());

  useEffect(() => {
    const sync = () => setSide(readAppSide());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const chooseSide = useCallback((next: AppSide) => writeAppSide(next), []);
  const resetSide = useCallback(() => clearAppSide(), []);

  return { side, chooseSide, resetSide, hasChosen: side !== null };
};
