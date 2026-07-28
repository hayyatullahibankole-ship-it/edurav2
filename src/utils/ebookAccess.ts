import { getDeviceFingerprint } from "./deviceFingerprint";

const STORAGE_KEY = "ebook-device-access";

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
