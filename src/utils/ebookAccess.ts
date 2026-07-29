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
  name?: string;
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
    return Object.keys(readRecords());
  } catch {
    return [];
  }
}

export function hasEbookAccess(ebookId: string, fingerprint: string = getDeviceFingerprint()) {
  const record = readRecords()[ebookId];
  return !!record && record.fingerprint === fingerprint;
}

export function saveEbookAccess(
  ebookId: string,
  code: string,
  name?: string,
  fingerprint: string = getDeviceFingerprint()
) {
  const records = readRecords();
  records[ebookId] = {
    ebookId,
    fingerprint,
    redeemedAt: new Date().toISOString(),
    code,
    name,
  };
  writeRecords(records);
  return true;
}

export async function redeemEbookCode(
  code: string,
  name: string,
  fingerprint: string = getDeviceFingerprint()
): Promise<EbookRedemptionResult> {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedName = name.trim();
  if (!normalizedCode) return { success: false, error: "Please enter an access code." };
  if (!normalizedName) return { success: false, error: "Please enter your full name." };

  try {
    const { data, error } = await supabase.rpc("redeem_ebook_code" as any, {
      _code: normalizedCode,
      _name: normalizedName,
      _device: fingerprint,
    });

    if (error) {
      return { success: false, error: error.message || "Invalid access code" };
    }

    return (data as unknown as EbookRedemptionResult) || { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Please try again." };
  }
}
