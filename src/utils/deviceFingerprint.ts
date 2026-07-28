const KEY = "akboy_device_id";

/**
 * Stable per-device/browser identifier used to lock ebook access to one device.
 */
export function getDeviceFingerprint(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    const traits = [
      navigator.platform || "",
      navigator.language || "",
      String(screen.width),
      String(screen.height),
    ].join("|");
    return `${id}:${btoa(traits).slice(0, 16)}`;
  } catch {
    return "unknown-device";
  }
}
