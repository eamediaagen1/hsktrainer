import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { generalLimiter } from "./middleware/rate-limit.js";

const app: Express = express();

// ── Allowed origins ─────────────────────────────────────────────────────────
// APP_URL is the primary frontend origin. For local dev, also allow localhost.
// Add multiple origins as a comma-separated list: APP_URL=https://a.com,https://b.com
const rawOrigins = process.env.APP_URL ?? "";
const ALLOWED_ORIGINS: string[] = [
  ...rawOrigins.split(",").map((s) => s.trim()).filter(Boolean),
  "http://localhost:5173",
  "http://localhost:3000",
];

// ── Security headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    // CSP is managed by the frontend build; disable here to avoid conflicts
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

// ── Request logging ──────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          // Strip query params from logs to avoid leaking secrets/tokens
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Global rate limit ─────────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", router);

export default app;
