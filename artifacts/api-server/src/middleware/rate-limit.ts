import rateLimit from "express-rate-limit";

const message = (msg: string) => ({ error: msg });

/** General API limit – 200 req per 15 min per IP */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Too many requests. Please try again later."),
});

/** Auth endpoints (magic link) – 10 req per 15 min per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Too many authentication attempts. Please wait before trying again."),
});

/** Premium sync – 5 req per 5 min per IP */
export const syncLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Too many sync requests. Please wait."),
});

/** Gumroad webhook – 30 req per 1 min per IP */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: message("Rate limit exceeded."),
});
