export function parseTimecodeMs(tc: string | number, fps?: 24 | 25 | 30): number {
  if (typeof tc === "number") {
    const safe = Number.isFinite(tc) ? tc : 0;
    return Math.max(0, Math.round(safe * 1000));
  }

  const raw = String(tc || "").trim();
  if (!raw) return 0;

  const numeric = Number(raw);
  if (Number.isFinite(numeric) && /^[+-]?\d+(\.\d+)?$/.test(raw)) {
    return Math.max(0, Math.round(numeric * 1000));
  }

  const normalized = raw
    .replace(/\s+/g, "")
    .replace(/;/g, ":")
    .replace(/-/g, ":");

  const match = normalized.match(
    /^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:([:.,])(\d{1,6}))?$/
  );
  if (!match) return 0;

  const hh = Number(match[1] ?? 0) || 0;
  const mm = Number(match[2] ?? 0) || 0;
  const ss = Number(match[3] ?? 0) || 0;
  const sep = match[4] || "";
  const tail = match[5] || "";

  let subMs = 0;

  if (tail) {
    if (sep === ":" && tail.length <= 2) {
      const ff = Number(tail) || 0;
      const resolvedFps =
        fps ??
        (ff <= 23 ? 24 : ff <= 24 ? 25 : 30);
      subMs = Math.round((ff / resolvedFps) * 1000);
    } else {
      const digits = tail.replace(/\D/g, "");
      const frac = Number(digits) || 0;
      const scale = Math.pow(10, Math.max(0, digits.length - 3));
      subMs = Math.round(frac / scale);
    }
  }

  const totalMs = (((hh * 60 + mm) * 60 + ss) * 1000) + subMs;
  return Math.max(0, totalMs);
}

export function parseTimecode(tc: string | number): number {
  return parseTimecodeMs(tc) / 1000;
}

export function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatTimecodeShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
