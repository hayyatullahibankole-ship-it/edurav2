import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "./deviceFingerprint";

const STORAGE_KEY = "ebook-device-access";

export interface EbookRedemptionResult {
  success: boolean;
  ebook_id?: string;
  slug?: string;
  error?: string;
}

interface EbookDeviceAccessRecord {
  ebookId: string;
  fingerprint: string;
  redeemedAt: string;
  code?: string;
}

function readRecords(): Record<string, EbookDeviceAccessRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRecords(records: Record<string, EbookDeviceAccessRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getUnlockedEbookIds() {
  try {
    const records = readRecords();
    return Object.keys(records);
  } catch {
    return [];
  }
}

export function hasEbookAccess(ebookId: string, fingerprint: string = getDeviceFingerprint()) {
  const records = readRecords();
  const record = records[ebookId];
  return !!record && record.fingerprint === fingerprint;
}

export function saveEbookAccess(ebookId: string, code: string, fingerprint: string = getDeviceFingerprint()) {
  const records = readRecords();
  records[ebookId] = {
    ebookId,
    fingerprint,
    redeemedAt: new Date().toISOString(),
    code,
  };
  writeRecords(records);
  return true;
}

function isMissingFunctionError(error: any) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return Boolean(
    error && (
      error.code === "PGRST301" ||
      error.code === "42883" ||
      message.includes("could not find the function") ||
      message.includes("does not exist") ||
      message.includes("schema cache")
    )
  );
}

export async function redeemEbookCode(code: string, fingerprint: string = getDeviceFingerprint()): Promise<EbookRedemptionResult> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { success: false, error: "Please enter an access code." };
  }

  try {
    const primary = await supabase.rpc("redeem_ebook_code_for_device", {
      _code: normalizedCode,
      _fingerprint: fingerprint,
    });

    if (!primary.error && primary.data?.success !== false) {
      return (primary.data as EbookRedemptionResult) || { success: true };
    }

    if (!isMissingFunctionError(primary.error)) {
      return (primary.data as EbookRedemptionResult) || { success: false, error: primary.error?.message || "Invalid access code" };
    }
  } catch (error: any) {
    if (!isMissingFunctionError(error)) {
      return { success: false, error: error?.message || "Please try again." };
    }
  }

  try {
    const fallback = await supabase.rpc("redeem_ebook_code", { _code: normalizedCode });
    if (fallback.error) {
      return (fallback.data as EbookRedemptionResult) || { success: false, error: fallback.error.message || "Invalid access code" };
    }

    return (fallback.data as EbookRedemptionResult) || { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Please try again." };
  }
}
