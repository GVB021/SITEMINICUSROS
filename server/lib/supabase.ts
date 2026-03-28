let runtimeSupabaseUrl = process.env.SUPABASE_URL || "";
let runtimeSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function configureSupabase(config: { url?: string; serviceRoleKey?: string }) {
  if (config.url) runtimeSupabaseUrl = config.url;
  if (config.serviceRoleKey) runtimeSupabaseServiceRoleKey = config.serviceRoleKey;
}

export function isSupabaseConfigured() {
  return Boolean(runtimeSupabaseUrl && runtimeSupabaseServiceRoleKey);
}

type SupabaseStatus = { ok: boolean; reason?: string; checkedAt: number };
let cachedStatus: SupabaseStatus | null = null;

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
}

function joinPath(...parts: string[]) {
  const cleaned = parts
    .filter(Boolean)
    .map((p) => String(p).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  return cleaned.join("/");
}

export async function checkSupabaseConnection(force = false): Promise<SupabaseStatus> {
  const now = Date.now();
  if (!force && cachedStatus && now - cachedStatus.checkedAt < 30_000) {
    return cachedStatus;
  }

  if (!isSupabaseConfigured()) {
    cachedStatus = { ok: false, reason: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing", checkedAt: now };
    return cachedStatus;
  }

  try {
    const res = await fetch(`${runtimeSupabaseUrl.replace(/\/+$/g, "")}/storage/v1/bucket`, {
      headers: {
        authorization: `Bearer ${runtimeSupabaseServiceRoleKey}`,
        apikey: runtimeSupabaseServiceRoleKey,
      },
    });
    if (!res.ok) {
      cachedStatus = { ok: false, reason: `HTTP ${res.status}`, checkedAt: now };
      return cachedStatus;
    }
    cachedStatus = { ok: true, checkedAt: now };
    return cachedStatus;
  } catch (e: any) {
    cachedStatus = { ok: false, reason: e?.message || "Network error", checkedAt: now };
    return cachedStatus;
  }
}

export async function uploadToSupabaseStorage(params: {
  bucket: string;
  path: string;
  buffer: Buffer;
  contentType: string;
}) {
  requireSupabase();

  const bucket = String(params.bucket || "").trim();
  if (!bucket) throw new Error("Supabase bucket is required");

  const objectPath = joinPath(params.path);
  if (!objectPath) throw new Error("Supabase object path is required");

  const url = `${runtimeSupabaseUrl.replace(/\/+$/g, "")}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${runtimeSupabaseServiceRoleKey}`,
      apikey: runtimeSupabaseServiceRoleKey,
      "content-type": params.contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(params.buffer),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase upload failed: HTTP ${res.status} ${body}`.trim());
  }

  const publicUrl = `${runtimeSupabaseUrl.replace(/\/+$/g, "")}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  return publicUrl;
}
