import type { Express } from "express";
import passport from "passport";
import { z } from "zod";
import { isAuthenticated, hashPassword } from "./replitAuth";
import { authStorage } from "./storage";
import { storage } from "../../storage";
import { logger } from "../../lib/logger";

import { authRateLimiter, masterRegistrationLimiter } from "../../middleware/rate-limit";
import crypto from "crypto";

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

const masterRegisterSchema = z.object({
  email: z.string().email("Email corporativo invalido"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiuscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minuscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um numero")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string(),
  fullName: z.string().min(3, "Nome completo obrigatorio"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas nao coincidem",
  path: ["confirmPassword"],
});

const registerSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  fullName: z.string().min(2, "Nome completo obrigatorio"),
  artistName: z.string().optional().default(""),
  phone: z.string().min(1, "Telefone obrigatorio"),
  altPhone: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  city: z.string().min(1, "Cidade obrigatoria"),
  state: z.string().min(1, "Estado obrigatorio"),
  country: z.string().min(1, "Pais obrigatorio"),
  mainLanguage: z.string().min(1, "Idioma principal obrigatorio"),
  additionalLanguages: z.string().optional().default(""),
  experience: z.string().min(1, "Experiencia obrigatoria"),
  specialty: z.string().min(1, "Especialidade obrigatoria"),
  bio: z.string().min(1, "Bio obrigatoria"),
  portfolioUrl: z.string().optional().default(""),
  studioId: z.string().min(1, "Selecione um estudio"),
});

async function seedMasterAccount() {
  try {
    const allUsers = await storage.getAllUsers();
    const hasMaster = allUsers.some(u => u.role === "MASTER");
    
    if (!hasMaster) {
      await authStorage.createUser({
        email: "master@vhub.com.br",
        passwordHash: await hashPassword("MasterPassword123!"),
        fullName: "Administrador Master",
        displayName: "Master",
        role: "MASTER",
        status: "approved",
        emailVerified: true,
      });
      logger.info("Conta MASTER inicial criada: master@vhub.com.br");
    }
  } catch (err: any) {
    if (err.message.includes("Tenant or user not found")) {
      throw new Error("Tenant or user not found");
    }
    throw err;
  }
}

export function registerAuthRoutes(app: Express): void {
  // Tenta criar a conta master inicial
  seedMasterAccount().catch(err => {
    if (err.message.includes("Tenant or user not found")) {
      logger.error("Erro de conexao com Supabase. Verifique seu DATABASE_URL no .env");
    } else {
      logger.error("Falha ao inicializar conta MASTER", { error: String(err) });
    }
  });

  app.post("/api/auth/master/register", masterRegistrationLimiter, async (req, res) => {
    try {
      const data = masterRegisterSchema.parse(req.body);

      // Garantir que apenas um MASTER possa existir
      const allUsers = await storage.getAllUsers();
      const hasMaster = allUsers.some(u => u.role === "MASTER");
      if (hasMaster) {
        return res.status(403).json({ message: "A conta master ja foi criada no sistema." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      
      const user = await authStorage.createUser({
        email: data.email.toLowerCase().trim(),
        passwordHash: await hashPassword(data.password),
        fullName: data.fullName,
        displayName: data.fullName,
        role: "MASTER",
        status: "pending", // Fica pendente até verificar o email
        emailVerified: false,
        verificationToken: token,
      });

      logger.info("MASTER account creation attempt", { 
        email: data.email, 
        ip: req.ip, 
        timestamp: new Date().toISOString() 
      });

      // Em um sistema real, aqui enviaríamos o email. 
      // Para o desafio, retornaremos o token (simulando o link de verificação)
      return res.status(201).json({ 
        message: "Conta master criada. Verifique seu email para ativar.",
        verificationUrl: `/api/auth/master/verify?token=${token}` // Apenas para fins de demonstração do fluxo
      });
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Dados invalidos" });
      }
      logger.error("Master register error", { error: String(err) });
      return res.status(500).json({ message: "Erro interno ao criar conta master" });
    }
  });

  app.get("/api/auth/master/verify", async (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token invalido" });
    }

    try {
      // Buscar usuário pelo token (precisamos adicionar esse método no storage)
      const allUsers = await storage.getAllUsers();
      const user = allUsers.find(u => (u as any).verificationToken === token);

      if (!user) {
        return res.status(404).json({ message: "Token expirado ou invalido" });
      }

      await authStorage.updateUser(user.id, { 
        status: "approved", 
        emailVerified: true, 
        verificationToken: null 
      });

      logger.info("MASTER account verified and activated", { email: user.email, userId: user.id });
      return res.status(200).json({ message: "Conta master ativada com sucesso. Voce ja pode fazer login." });
    } catch (err) {
      logger.error("Master verification error", { error: String(err) });
      return res.status(500).json({ message: "Erro ao verificar conta master" });
    }
  });

  app.post("/api/auth/login", authRateLimiter, (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (err: any) {
      return res.status(400).json({ message: err.errors?.[0]?.message || "Dados invalidos" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      logger.info("Passport authenticate result", { 
        hasError: !!err, 
        hasUser: !!user, 
        info: info?.message 
      });

      if (err) {
        logger.error("Login authentication error", { 
          message: err.message, 
          code: err.code, 
          stack: err.stack 
        });
        if (err.message?.includes("Tenant or user not found") || err.code === "XX000") {
          return res.status(503).json({ 
            message: "Servico temporariamente indisponivel. Erro de conexao com o banco de dados." 
          });
        }
        return res.status(500).json({ message: "Erro interno no servidor de autenticação" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Email ou senha incorretos" });
      }

      if (user.status === "pending" && user.role !== "MASTER") {
        return res.status(403).json({ message: "pending", status: "pending" });
      }
      if (user.status === "rejected") {
        return res.status(403).json({ message: "Sua conta foi rejeitada pelo administrador." });
      }

      req.login(user, async (loginErr) => {
        if (loginErr) {
          logger.error("Login session error", { error: String(loginErr) });
          return next(loginErr);
        }
        try {
          await authStorage.updateUser(user.id, { lastLoginAt: new Date() });
        } catch (err) {
          logger.error("Failed to update last login", { userId: user.id, error: String(err) });
        }
        const { passwordHash, ...safeUser } = user;
        logger.info("Login successful", { userId: user.id, email: user.email });
        return res.json({ user: safeUser });
      });
    })(req, res, next);
  });

  app.get("/api/auth/studios-public", async (_req, res) => {
    try {
      const activeStudios = await storage.getActiveStudiosPublic();
      return res.json(activeStudios);
    } catch (err) {
      logger.error("Error fetching public studios", { error: String(err) });
      return res.status(500).json({ message: "Erro ao buscar estudios" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await authStorage.getUserByEmail(data.email);
      if (existing) {
        return res.status(409).json({ message: "Este email ja esta em uso" });
      }

      const studio = await storage.getStudio(data.studioId);
      if (!studio) {
        return res.status(400).json({ message: "Estudio selecionado nao encontrado" });
      }

      const user = await authStorage.createUser({
        email: data.email.toLowerCase().trim(),
        passwordHash: await hashPassword(data.password),
        fullName: data.fullName,
        artistName: data.artistName || null,
        displayName: data.fullName,
        phone: data.phone,
        altPhone: data.altPhone || null,
        birthDate: data.birthDate || null,
        city: data.city,
        state: data.state,
        country: data.country,
        mainLanguage: data.mainLanguage,
        additionalLanguages: data.additionalLanguages || null,
        experience: data.experience,
        specialty: data.specialty,
        bio: data.bio,
        portfolioUrl: data.portfolioUrl || null,
        status: "pending",
        role: "user",
      });

      await storage.createMembership({
        userId: user.id,
        studioId: data.studioId,
        role: "pending",
        status: "pending",
      });

      try {
        const studioAdmins = await storage.getStudioAdmins(data.studioId);
        for (const admin of studioAdmins) {
          await storage.createNotification({
            userId: admin.id,
            type: "member_request",
            title: "Novo cadastro pendente",
            message: `${data.fullName} (${data.email}) solicitou acesso ao estudio ${studio.name}.`,
            relatedId: user.id,
          });
        }
      } catch (notifErr) {
        logger.error("Error sending notifications to studio admins", { error: String(notifErr) });
      }

      logger.info("New user registered (pending)", { email: data.email, id: user.id, studioId: data.studioId });
      const { passwordHash, ...safeUser } = user;
      return res.status(201).json({ user: safeUser });
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ message: err.errors[0]?.message || "Dados invalidos" });
      }
      logger.error("Register error", { error: String(err) });
      return res.status(500).json({ message: "Erro interno ao criar conta" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/login");
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (!user?.id) return res.status(401).json({ message: "Unauthorized" });
      const freshUser = await authStorage.getUser(user.id);
      if (!freshUser) return res.status(404).json({ message: "User not found" });
      const { passwordHash, ...safeUser } = freshUser;
      res.json(safeUser);
    } catch (error) {
      logger.error("Error fetching user", { error: String(error) });
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
