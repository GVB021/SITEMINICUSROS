import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { authStorage } from "./storage";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    return false;
  }
}

export function getSession() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set. Did you forget to provide it in environment variables?");
  }
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL || process.env.REPLIT_DB_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "http_sessions",
  });
  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: "vhub.sid", // Custom session cookie name
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Standard for cross-origin if needed, but 'lax' is safer for general use
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await authStorage.getUserByEmail(email.toLowerCase().trim());
          if (!user) {
            return done(null, false, { message: "Email ou senha incorretos" });
          }
          const isPasswordValid = await verifyPassword(password, user.passwordHash || "");
          if (!user.passwordHash || !isPasswordValid) {
            return done(null, false, { message: "Email ou senha incorretos" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await authStorage.getUser(id);
      cb(null, user || false);
    } catch (err) {
      cb(err);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
