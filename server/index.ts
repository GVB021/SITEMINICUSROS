import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { setupVideoSync } from "./video-sync";
import { setupRealtime, broadcastInvalidate } from "./realtime";
import { registerMeRestore } from "./me-restore";
import { registerVoiceJobs } from "./voice-jobs";
import { pool } from "./db";
import { configureSupabase } from "./lib/supabase";
import path from "path";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Serve uploaded audio files
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/media-jobs", express.static(path.join(process.cwd(), "public", "media-jobs")));
app.use("/voice-jobs", express.static(path.join(process.cwd(), "public", "voice-jobs")));

// Serve Alinhador App (Static Frontend)
app.use("/alinhador", express.static(path.join(process.cwd(), "alinhador-legacy", "frontend", "build")));

// Serve HUBDUB-STUDIO App
app.use("/hub-dub-legacy", express.static(path.join(process.cwd(), "HUBDUB-STUDIO", "client", "dist")));

// Fallback for Alinhador SPA Routing
app.get(/\/alinhador\/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "alinhador-legacy", "frontend", "build", "index.html"));
});

// Fallback for HUBDUB-STUDIO SPA Routing
app.get(/\/hub-dub-legacy\/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "HUBDUB-STUDIO", "client", "dist", "index.html"));
});



export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

function redactSensitive(value: unknown): unknown {
  const SENSITIVE_KEYS = new Set([
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "idToken",
    "secret",
    "session",
    "cookie",
    "authorization",
    "apiKey",
    "serviceRoleKey",
  ]);

  const seen = new WeakSet<object>();

  const walk = (v: unknown): unknown => {
    if (!v || typeof v !== "object") return v;
    if (seen.has(v as object)) return "[Circular]";
    seen.add(v as object);

    if (Array.isArray(v)) return v.map(walk);

    const out: Record<string, unknown> = {};
    for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k)) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = walk(raw);
      }
    }
    return out;
  };

  return walk(value);
}

function isSensitiveApiPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return (
    p.startsWith("/api/login") ||
    p.startsWith("/api/logout") ||
    p.startsWith("/api/register") ||
    p.startsWith("/api/auth") ||
    p.startsWith("/api/replit") ||
    p.startsWith("/api/oidc")
  );
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      const isProd = process.env.NODE_ENV === "production";
      const canLogBody = !isProd && capturedJsonResponse && !isSensitiveApiPath(path);
      if (canLogBody) {
        const redacted = redactSensitive(capturedJsonResponse);
        const serialized = JSON.stringify(redacted);
        logLine += ` :: ${serialized.length > 2000 ? `${serialized.slice(0, 2000)}…` : serialized}`;
      }

      log(logLine);
    }
  });

  next();
});

app.use((req, res, next) => {
  res.on("finish", () => {
    const isApi = req.path.startsWith("/api");
    const isMutation = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const ok = res.statusCode >= 200 && res.statusCode < 300;
    if (isApi && isMutation && ok) {
      broadcastInvalidate(req.method, req.path);
    }
  });
  next();
});

(async () => {
  await pool.query(`
    ALTER TABLE IF EXISTS recording_sessions
      ADD COLUMN IF NOT EXISTS storage_provider text DEFAULT 'supabase',
      ADD COLUMN IF NOT EXISTS takes_path text DEFAULT 'uploads';
  `);
  await pool.query(`
    UPDATE recording_sessions
    SET storage_provider = COALESCE(storage_provider, 'supabase'),
        takes_path = COALESCE(takes_path, 'uploads');
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS studio_profiles (
      studio_id varchar PRIMARY KEY REFERENCES studios(id) ON DELETE CASCADE,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS studio_profiles_studio_id_idx ON studio_profiles(studio_id);`);

  try {
    const { rows } = await pool.query(
      "SELECT key, value FROM platform_settings WHERE key IN ('SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY')"
    );
    const map: Record<string, string> = {};
    for (const r of rows as any[]) {
      map[String(r.key)] = String(r.value);
    }
    configureSupabase({ url: map.SUPABASE_URL, serviceRoleKey: map.SUPABASE_SERVICE_ROLE_KEY });
  } catch {}

  await setupAuth(app);
  registerAuthRoutes(app);
  registerVoiceJobs(app);
  registerMeRestore(app);
  await registerRoutes(httpServer, app);
  setupVideoSync(httpServer);
  setupRealtime(app);
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5002 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5002", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
