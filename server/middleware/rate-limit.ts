import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limite de 10 requisições por IP
  message: { message: "Muitas tentativas de login ou registro. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const masterRegistrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Limite de 5 tentativas por IP
  message: { message: "Limite de tentativas de criação de conta master excedido. Tente novamente em 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});
