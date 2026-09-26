import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { createServer } from "node:http";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createRemoteJWKSet, jwtVerify } from "jose";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const { Pool } = pg;
const app = express();
app.set("trust proxy", 1);

const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me";

const allowedOrigin =
  process.env.CLIENT_ORIGIN ||
  "https://saathi-wellness-hub.vercel.app,http://localhost:5173";

const allowedOrigins = allowedOrigin.split(",").map((origin) => origin.trim());

const frontendOrigin = allowedOrigins[0];

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/saathi_wellness",
  ssl:
    process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false,
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed"));
    },
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10000kb",
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    error: "Too many authentication attempts",
  },
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

const uploadDir = path.resolve("uploads/journals");

mkdirSync(uploadDir, {
  recursive: true,
});

const journalImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),

  filename: (_req, file, cb) =>
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage: journalImageStorage,

  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
});

app.use(
  "/uploads",
  (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");

    next();
  },

  express.static(path.resolve("uploads")),
);

const resourceConfig = {
  journals: {
    table: "journals",

    columns: [
      "title",
      "content",
      "mood",
      "energy_level",
      "media_type",
      "media_url",
      "media_metadata",
    ],

    jsonColumns: ["media_metadata"],
  },

  moods: {
    table: "moods",

    columns: ["mood", "energy_level", "note"],
  },

  meditation_sessions: {
    table: "meditation_sessions",

    columns: ["duration", "completed", "energy_level"],
  },

  goals: {
    table: "goals",

    columns: ["category", "custom_title", "duration", "progress", "completed"],
  },

  music: {
    table: "music",

    columns: [
      "song_name",
      "artist",
      "album",
      "playlist_name",
      "category",
      "genre",
      "audio_url",
      "cover_url",
      "duration_seconds",
      "energy_level",
      "listened_till",
      "repetition",
      "is_favorite",
      "is_available",
      "last_listened_at",
    ],
  },

  notifications: {
    table: "notifications",

    columns: ["notification_type", "title", "body", "read_at"],
  },

  activity_history: {
    table: "activity_history",

    columns: [
      "activity_type",
      "title",
      "subtitle",
      "energy_level",
      "process",
      "metadata",
    ],

    jsonColumns: ["metadata"],
  },

  health_metrics: {
    table: "health_metrics",

    columns: ["metric_type", "value", "unit", "raw_data"],

    jsonColumns: ["raw_data"],

    readOnly: true,
  },

  wellness_scores: {
    table: "wellness_scores",

    columns: ["final_energy_level", "breakdown", "computed_at"],

    jsonColumns: ["breakdown"],

    readOnly: true,
  },
};

async function initializeDatabase() {
  await pool.query(
    readFileSync(new URL("./schema.sql", import.meta.url), "utf8"),
  );
}

function tokenFor(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

function userPayload(user) {
  return {
    id: user.id,
    email: user.email,
    email_confirmed_at: user.email_confirmed_at,

    user_metadata: {
      name: user.full_name,
      full_name: user.full_name,
    },
  };
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";

  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  try {
    req.auth = jwt.verify(token, jwtSecret);

    next();
  } catch {
    res.status(401).json({
      error: "Invalid or expired session",
    });
  }
}

function authOptional(req, _res, next) {
  const header = req.headers.authorization || "";

  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.auth = jwt.verify(token, jwtSecret);
    } catch {}
  }

  next();
}

function mlServiceRequired(req, res, next) {
  if (!process.env.ML_SERVICE_SECRET) {
    return res.status(503).json({
      error: "ML service integration is not configured",
    });
  }

  const provided = req.headers["x-ml-service-secret"];

  if (!provided || provided !== process.env.ML_SERVICE_SECRET) {
    return res.status(401).json({
      error: "Invalid service credentials",
    });
  }

  next();
}

function publicError(res, error) {
  if (error?.code === "23505") {
    return res.status(409).json({
      error: "An account with this email already exists",
    });
  }

  return res.status(400).json({
    error: error?.message || "Request failed",
  });
}

function oauthConfigured(provider) {
  if (provider === "google") {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  return Boolean(
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY &&
    process.env.APPLE_REDIRECT_URI,
  );
}

function oauthState(provider) {
  return jwt.sign(
    {
      provider,
      nonce: crypto.randomUUID(),
    },
    jwtSecret,
    {
      expiresIn: "10m",
    },
  );
}

function oauthCallbackUrl(token) {
  return `${frontendOrigin}/auth/callback?oauth_token=${encodeURIComponent(
    token,
  )}`;
}

async function findOrCreateOAuthUser({
  provider,
  subject,
  email,
  fullName = "",
}) {
  let result = await pool.query(
    "SELECT id, email, full_name, email_confirmed_at FROM saathi_users WHERE oauth_provider = $1 AND oauth_subject = $2",
    [provider, subject],
  );

  if (result.rows[0]) {
    return result.rows[0];
  }

  result = await pool.query(
    "SELECT id, email, full_name, email_confirmed_at FROM saathi_users WHERE email = $1",
    [email.toLowerCase()],
  );

  if (result.rows[0]) {
    await pool.query(
      "UPDATE saathi_users SET oauth_provider = $1, oauth_subject = $2 WHERE id = $3",
      [provider, subject, result.rows[0].id],
    );

    return result.rows[0];
  }

  const user = {
    id: crypto.randomUUID(),

    email: email.toLowerCase(),

    full_name: fullName || email.split("@")[0],

    email_confirmed_at: new Date().toISOString(),
  };

  await pool.query(
    "INSERT INTO saathi_users (id, email, password_hash, full_name, oauth_provider, oauth_subject) VALUES ($1, $2, $3, $4, $5, $6)",
    [user.id, user.email, "oauth-account", user.full_name, provider, subject],
  );

  await pool.query(
    "INSERT INTO profiles (user_id, full_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
    [user.id, user.full_name],
  );

  await pool.query(
    `INSERT INTO wellness_scores
     (user_id, final_energy_level)
     VALUES ($1, 0)
     ON CONFLICT (user_id) DO NOTHING`,
    [user.id],
  );

  return user;
}

function signedIntegrationState(userId) {
  return jwt.sign(
    {
      sub: userId,
      integration: "fitbit",
    },
    jwtSecret,
    {
      expiresIn: "10m",
    },
  );
}

function fitbitConfigured() {
  return Boolean(
    process.env.FITBIT_CLIENT_ID &&
    process.env.FITBIT_CLIENT_SECRET &&
    process.env.FITBIT_REDIRECT_URI,
  );
}

async function fitbitToken(token, userId) {
  if (new Date(token.token_expires_at).getTime() > Date.now() + 60_000) {
    return token.access_token;
  }

  const basic = Buffer.from(
    `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",

    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({
      grant_type: "refresh_token",

      refresh_token: token.refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error("Fitbit token refresh failed");
  }

  const refreshed = await response.json();

  await pool.query(
    `UPDATE wellness_devices
     SET access_token = $1,
         refresh_token = $2,
         token_expires_at =
           NOW() +
           ($3 || ' seconds')::interval
     WHERE user_id = $4
       AND platform = 'fitbit'`,
    [
      refreshed.access_token,
      refreshed.refresh_token,
      String(refreshed.expires_in),
      userId,
    ],
  );

  return refreshed.access_token;
}

function resourceOr404(req, res) {
  const config = resourceConfig[req.params.resource];

  if (!config) {
    res.status(404).json({
      error: "Resource not found",
    });

    return null;
  }

  return config;
}

function serializeValue(config, column, value) {
  if (config.jsonColumns?.includes(column)) {
    return JSON.stringify(value ?? {});
  }

  return value;
}

async function listResource(config, userId, query) {
  const conditions = ["user_id = $1"];

  const values = [userId];

  for (const [key, value] of Object.entries(query)) {
    if (["order", "limit"].includes(key)) {
      continue;
    }

    let column = key;
    let operator = "=";

    if (key.startsWith("gte_")) {
      column = key.slice(4);
      operator = ">=";
    } else if (key.startsWith("lte_")) {
      column = key.slice(4);
      operator = "<=";
    }

    if (
      column !== "id" &&
      column !== "created_at" &&
      !config.columns.includes(column)
    ) {
      continue;
    }

    values.push(value);

    conditions.push(`${column} ${operator} $${values.length}`);
  }

  let orderBy = "created_at DESC";

  if (query.order) {
    const [field, direction = "asc"] = String(query.order).split(":");

    if (
      field === "id" ||
      field === "created_at" ||
      config.columns.includes(field)
    ) {
      orderBy = `${field} ${direction === "desc" ? "DESC" : "ASC"}`;
    }
  }

  let limitClause = "";

  if (query.limit) {
    values.push(Number(query.limit));

    limitClause = `LIMIT $${values.length}`;
  }

  const sql = `
    SELECT *
    FROM ${config.table}
    WHERE ${conditions.join(" AND ")}
    ORDER BY ${orderBy}
    ${limitClause}
  `;

  const result = await pool.query(sql, values);

  return result.rows;
}

async function insertResource(config, userId, item) {
  const columns = ["user_id"];

  const placeholders = ["$1"];

  const values = [userId];

  for (const column of config.columns) {
    if (item[column] === undefined) {
      continue;
    }

    values.push(serializeValue(config, column, item[column]));

    columns.push(column);

    placeholders.push(`$${values.length}`);
  }

  const sql = `
    INSERT INTO ${config.table}
      (${columns.join(", ")})
    VALUES
      (${placeholders.join(", ")})
    RETURNING *
  `;

  const result = await pool.query(sql, values);

  return result.rows[0];
}

async function updateResource(config, userId, id, item) {
  const assignments = [];

  const values = [userId, id];

  for (const column of config.columns) {
    if (item[column] === undefined) {
      continue;
    }

    values.push(serializeValue(config, column, item[column]));

    assignments.push(`${column} = $${values.length}`);
  }

  if (!assignments.length) {
    const existing = await pool.query(
      `SELECT *
       FROM ${config.table}
       WHERE user_id = $1
         AND id = $2`,
      [userId, id],
    );

    return existing.rows[0] || null;
  }

  const sql = `
    UPDATE ${config.table}
    SET ${assignments.join(", ")}
    WHERE user_id = $1
      AND id = $2
    RETURNING *
  `;

  const result = await pool.query(sql, values);

  return result.rows[0] || null;
}

async function deleteResource(config, userId, id) {
  if (id) {
    return pool.query(
      `DELETE FROM ${config.table}
       WHERE user_id = $1
         AND id = $2`,
      [userId, id],
    );
  }

  return pool.query(
    `DELETE FROM ${config.table}
     WHERE user_id = $1`,
    [userId],
  );
}

const ACTIVITY_TYPES = ["mood", "music", "meditation", "journal", "community"];

const MUSIC_ENERGY_BY_TITLE = {
  "channa mereya": 2,
  "kun faya kun": 6,
  "sun saiyaan": 10,
  hamdard: 14,
  "jiyein kyun": 18,
  "tere bina": 22,
  "kun faya kun (added)": 26,
  iktara: 30,
  "tu kisi rail si": 34,
  "kho gaye hum kahan": 38,
  shaam: 42,
  "aao milo chalen": 46,
  banjara: 50,
  safarnama: 54,
  "phir se ud chala": 58,
  "chaand ke parinday": 62,
  "tum se hi": 66,
  ilahi: 70,
  "love you zindagi": 74,
  "matargashti (added)": 78,
  "sooraj ki baahon mein": 82,
  "tumhi ho bandhu": 86,
  "patakha guddi": 90,
  "gallan goodiyaan": 94,
  "badtemeez dil": 98,
};

function getMusicEnergyLevel(songName) {
  const key = String(songName || "")
    .trim()
    .toLowerCase();

  return MUSIC_ENERGY_BY_TITLE[key] ?? null;
}

function getMusicEnergyRangeStart(finalEnergyLevel) {
  const energy = Math.max(
    1,
    Math.min(100, Math.round(Number(finalEnergyLevel) || 50)),
  );

  return Math.max(1, Math.min(96, Math.floor(energy / 4) * 4));
}

async function recordActivity(
  client,
  {
    userId,
    activityType,
    title,
    subtitle = null,
    energyLevel = null,
    metadata = {},
  },
) {
  if (!userId) {
    throw new Error("recordActivity requires an authenticated userId");
  }

  if (!ACTIVITY_TYPES.includes(activityType)) {
    throw new Error(
      `Invalid activity_type "${activityType}". Must be one of: ${ACTIVITY_TYPES.join(
        ", ",
      )}`,
    );
  }

  if (!title || !String(title).trim()) {
    throw new Error("recordActivity requires a title");
  }

  let normalizedEnergy = null;

  if (energyLevel !== null && energyLevel !== undefined && energyLevel !== "") {
    normalizedEnergy = Number(energyLevel);

    if (
      !Number.isFinite(normalizedEnergy) ||
      normalizedEnergy < 1 ||
      normalizedEnergy > 100
    ) {
      throw new Error("energy_level must be a number between 1 and 100");
    }
  }

  const runner = client || pool;

  console.log("[ACTIVITY] INSERT START", {
    userId,
    activityType,
    title,
    subtitle,
    energyLevel: normalizedEnergy,
    metadata,
  });

  const result = await runner.query(
    `INSERT INTO activity_history
       (
         user_id,
         activity_type,
         title,
         subtitle,
         energy_level,
         metadata
       )
       VALUES
       ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
    [
      userId,
      activityType,
      String(title).trim(),
      subtitle ? String(subtitle).trim() : null,
      normalizedEnergy,
      JSON.stringify(metadata ?? {}),
    ],
  );

  console.log("[ACTIVITY] INSERT SUCCESS", result.rows[0]);

  return result.rows[0];
}

app.get("/api/debug/activity-history-db", authRequired, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'activity_history'
      ORDER BY ordinal_position
    `);

    res.json({
      table: "activity_history",
      columns: result.rows,
    });
  } catch (error) {
    console.error("Activity history DB debug error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    service: "saathi-wellness-postgresql",
  }),
);

app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const { email, password, fullName = "" } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({
        error: "Email and a password of at least 6 characters are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        error: "A valid email is required",
      });
    }

    const user = {
      id: crypto.randomUUID(),

      email: normalizedEmail,

      passwordHash: await bcrypt.hash(password, 12),

      fullName: String(fullName).trim().slice(0, 120),
    };

    await pool.query(
      "INSERT INTO saathi_users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4)",
      [user.id, user.email, user.passwordHash, user.fullName],
    );

    await pool.query(
      "INSERT INTO profiles (user_id, full_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
      [user.id, user.fullName],
    );

    await pool.query(
      `INSERT INTO wellness_scores
         (user_id, final_energy_level)
         VALUES ($1, 0)
         ON CONFLICT (user_id)
         DO NOTHING`,
      [user.id],
    );

    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      email_confirmed_at: new Date().toISOString(),
    };

    res.status(201).json({
      user: userPayload(payload),

      session: {
        access_token: tokenFor(payload),
      },
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, password_hash, full_name, email_confirmed_at FROM saathi_users WHERE email = $1",
      [String(req.body.email || "").toLowerCase()],
    );

    const user = result.rows[0];

    if (
      !user ||
      !(await bcrypt.compare(req.body.password || "", user.password_hash))
    ) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    res.json({
      user: userPayload(user),

      session: {
        access_token: tokenFor(user),
      },
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const result = await pool.query(
    "SELECT id, email, full_name, email_confirmed_at FROM saathi_users WHERE id = $1",
    [req.auth.sub],
  );

  if (!result.rows[0]) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.json({
    user: userPayload(result.rows[0]),
  });
});

app.patch("/api/auth/password", authRequired, async (req, res) => {
  if (!req.body.password || req.body.password.length < 6) {
    return res.status(400).json({
      error: "Password must contain at least 6 characters",
    });
  }

  await pool.query("UPDATE saathi_users SET password_hash = $1 WHERE id = $2", [
    await bcrypt.hash(req.body.password, 12),
    req.auth.sub,
  ]);

  res.json({
    ok: true,
  });
});

const profileColumns = [
  "full_name",
  "bio",
  "avatar_url",
  "timezone",
  "preferred_mood",
  "wellness_goal",
  "energy_level",
  "reminder_enabled",
  "reminder_time",
  "preferred_meditation_duration",
  "onboarding_completed",
  "is_subscribed",
  "subscribed_at",
];

app.get("/api/profile", authRequired, async (req, res) => {
  const result = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [
    req.auth.sub,
  ]);

  res.json({
    data: result.rows[0] || null,
  });
});

app.patch("/api/profile", authRequired, async (req, res) => {
  const assignments = ["updated_at = NOW()"];

  const values = [req.auth.sub];

  for (const column of profileColumns) {
    if (req.body[column] === undefined) {
      continue;
    }

    values.push(req.body[column]);

    assignments.push(`${column} = $${values.length}`);
  }

  const result = await pool.query(
    `UPDATE profiles
       SET ${assignments.join(", ")}
       WHERE user_id = $1
       RETURNING *`,
    values,
  );

  res.json({
    data: result.rows[0] || null,
  });
});

app.get("/api/settings", authRequired, async (req, res) => {
  const result = await pool.query(
    "SELECT setting_key, value, updated_at FROM wellness_settings WHERE user_id = $1",
    [req.auth.sub],
  );

  res.json({
    data: result.rows,
  });
});

app.put("/api/settings/:key", authRequired, async (req, res) => {
  const result = await pool.query(
    `INSERT INTO wellness_settings
       (
         user_id,
         setting_key,
         value,
         updated_at
       )
       VALUES
       ($1, $2, $3, NOW())
       ON CONFLICT
       (user_id, setting_key)
       DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW()
       RETURNING
         setting_key,
         value,
         updated_at`,
    [req.auth.sub, req.params.key, JSON.stringify(req.body.value ?? {})],
  );

  res.json({
    data: result.rows[0],
  });
});

app.post("/api/wellness-score", mlServiceRequired, async (req, res) => {
  try {
    const { user_id, final_energy_level, breakdown } = req.body || {};

    if (!user_id) {
      return res.status(400).json({
        error: "user_id is required",
      });
    }

    const numericEnergy = Number(final_energy_level);
    const hasValidEnergy =
      Number.isFinite(numericEnergy) &&
      numericEnergy >= 0 &&
      numericEnergy <= 100;
    const roundedEnergy = hasValidEnergy
      ? Math.round(numericEnergy)
      : null;

    // Fetch existing row to preserve breakdown if ML didn't pass one, or preserve energy if not passed
    const existing = await pool.query(
      `SELECT * FROM wellness_scores WHERE user_id = $1 LIMIT 1`,
      [user_id],
    );
    const existingRow = existing.rows[0];

    const finalEnergyToSet =
      roundedEnergy !== null
        ? roundedEnergy
        : (existingRow?.final_energy_level ?? 0);

    let existingBreakdown = existingRow?.breakdown;
    if (typeof existingBreakdown === "string") {
      try {
        existingBreakdown = JSON.parse(existingBreakdown);
      } catch {
        existingBreakdown = {};
      }
    }

    const breakdownToSet =
      breakdown &&
      typeof breakdown === "object" &&
      Object.keys(breakdown).length > 0
        ? breakdown
        : (existingBreakdown ?? {});

    const updated = await pool.query(
      `UPDATE wellness_scores
           SET final_energy_level = $2,
               breakdown = $3,
               computed_at = NOW()
           WHERE user_id = $1
           RETURNING *`,
      [user_id, finalEnergyToSet, JSON.stringify(breakdownToSet)],
    );

    if (updated.rows[0]) {
      console.log(
        `[ML] wellness_scores updated for user ${user_id}: energy=${updated.rows[0].final_energy_level}`,
      );

      return res.status(200).json({
        data: updated.rows[0],
      });
    }

    const inserted = await pool.query(
      `INSERT INTO wellness_scores
           (
             user_id,
             final_energy_level,
             breakdown,
             computed_at
           )
           VALUES
           ($1, $2, $3, NOW())
           RETURNING *`,
      [user_id, finalEnergyToSet, JSON.stringify(breakdownToSet)],
    );

    console.log(
      `[ML] wellness_scores inserted for user ${user_id}: energy=${inserted.rows[0].final_energy_level}`,
    );

    res.status(201).json({
      data: inserted.rows[0],
    });
  } catch (error) {
    console.error("Wellness score store error:", error.message);

    publicError(res, error);
  }
});

async function calculateUserBreakdown(userId) {
  const result = await pool.query(
    `
      SELECT
        COALESCE(
          AVG(energy_level) FILTER (
            WHERE activity_type = 'music'
          ),
          0
        ) AS music,

        COALESCE(
          AVG(energy_level) FILTER (
            WHERE activity_type = 'mood'
          ),
          0
        ) AS mood,

        COALESCE(
          AVG(energy_level) FILTER (
            WHERE activity_type = 'meditation'
          ),
          0
        ) AS meditation,

        COALESCE(
          AVG(energy_level) FILTER (
            WHERE activity_type = 'journal'
          ),
          0
        ) AS journal,

        COALESCE(
          AVG(energy_level) FILTER (
            WHERE activity_type = 'community'
          ),
          0
        ) AS community

      FROM activity_history
      WHERE user_id = $1
    `,
    [userId],
  );

  const row = result.rows[0] || {};

  return {
    music: Math.round(Number(row.music || 0)),
    mood: Math.round(Number(row.mood || 0)),
    meditation: Math.round(Number(row.meditation || 0)),
    journal: Math.round(Number(row.journal || 0)),
    community: Math.round(Number(row.community || 0)),
  };
}

app.post("/api/wellness-score/breakdown", authRequired, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const incomingBreakdown = req.body?.breakdown;

    let breakdown;
    if (incomingBreakdown && typeof incomingBreakdown === "object") {
      breakdown = {
        music: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.music ?? 0)))),
        mood: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.mood ?? 0)))),
        meditation: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.meditation ?? 0)))),
        journal: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.journal ?? 0)))),
        community: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.community ?? 0)))),
      };
    } else {
      breakdown = await calculateUserBreakdown(userId);
    }

    // final_energy_level is strictly READ-ONLY (only set by ML service).
    // Here we only update or insert the breakdown.
    const updated = await pool.query(
      `UPDATE wellness_scores
           SET breakdown = $2,
               computed_at = NOW()
           WHERE user_id = $1
           RETURNING *`,
      [userId, JSON.stringify(breakdown)],
    );

    if (updated.rows[0]) {
      return res.status(200).json({
        data: updated.rows[0],
        message: "Breakdown updated. final_energy_level is read-only.",
      });
    }

    const inserted = await pool.query(
      `INSERT INTO wellness_scores
           (
             user_id,
             final_energy_level,
             breakdown,
             computed_at
           )
           VALUES
           ($1, 0, $2, NOW())
           RETURNING *`,
      [userId, JSON.stringify(breakdown)],
    );

    res.status(201).json({
      data: inserted.rows[0],
      message: "Breakdown saved. final_energy_level is read-only.",
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.post("/api/wellness-score/recompute", authRequired, async (req, res) => {
  try {
    const userId = req.auth.sub;
    const incomingBreakdown = req.body?.breakdown;
    const breakdown =
      incomingBreakdown && typeof incomingBreakdown === "object"
        ? {
            music: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.music ?? 0)))),
            mood: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.mood ?? 0)))),
            meditation: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.meditation ?? 0)))),
            journal: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.journal ?? 0)))),
            community: Math.max(0, Math.min(100, Math.round(Number(incomingBreakdown.community ?? 0)))),
          }
        : await calculateUserBreakdown(userId);

    const updated = await pool.query(
      `UPDATE wellness_scores
           SET breakdown = $2,
               computed_at = NOW()
           WHERE user_id = $1
           RETURNING *`,
      [userId, JSON.stringify(breakdown)],
    );

    let row = updated.rows[0];

    if (!row) {
      const inserted = await pool.query(
        `INSERT INTO wellness_scores
             (
               user_id,
               final_energy_level,
               breakdown,
               computed_at
             )
             VALUES
             ($1, 0, $2, NOW())
             RETURNING *`,
        [userId, JSON.stringify(breakdown)],
      );
      row = inserted.rows[0];
    }

    res.status(200).json({
      data: row,
      note: "final_energy_level is read-only and computed by the separate ML backend. Breakdown has been updated.",
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.get("/api/wellness-score/latest", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
           FROM wellness_scores
           WHERE user_id = $1
           ORDER BY
             computed_at DESC NULLS LAST,
             created_at DESC
           LIMIT 1`,
      [req.auth.sub],
    );

    let row = result.rows[0] || null;

    if (!row) {
      const breakdown = await calculateUserBreakdown(req.auth.sub);
      const inserted = await pool.query(
        `INSERT INTO wellness_scores
             (
               user_id,
               final_energy_level,
               breakdown,
               computed_at
             )
             VALUES
             ($1, 0, $2, NOW())
             RETURNING *`,
        [req.auth.sub, JSON.stringify(breakdown)],
      );
      row = inserted.rows[0];
    } else {
      let currentBreakdown = row.breakdown;
      if (typeof currentBreakdown === "string") {
        try {
          currentBreakdown = JSON.parse(currentBreakdown);
        } catch {
          currentBreakdown = null;
        }
      }
      const isBreakdownEmpty =
        !currentBreakdown ||
        (Number(currentBreakdown.music || 0) === 0 &&
          Number(currentBreakdown.mood || 0) === 0 &&
          Number(currentBreakdown.meditation || 0) === 0 &&
          Number(currentBreakdown.journal || 0) === 0 &&
          Number(currentBreakdown.community || 0) === 0);

      if (isBreakdownEmpty) {
        const breakdown = await calculateUserBreakdown(req.auth.sub);
        const hasAnyActivity =
          breakdown.music > 0 ||
          breakdown.mood > 0 ||
          breakdown.meditation > 0 ||
          breakdown.journal > 0 ||
          breakdown.community > 0;

        if (hasAnyActivity) {
          const updated = await pool.query(
            `UPDATE wellness_scores
                 SET breakdown = $2,
                     computed_at = NOW()
                 WHERE user_id = $1
                 RETURNING *`,
            [req.auth.sub, JSON.stringify(breakdown)],
          );
          if (updated.rows[0]) {
            row = updated.rows[0];
          }
        }
      }
    }

    res.json({
      data: row,
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.get("/api/music/recommendations", authRequired, async (req, res) => {
  try {
    const latest = await pool.query(
      `SELECT final_energy_level
           FROM wellness_scores
           WHERE user_id = $1
           ORDER BY
             computed_at DESC NULLS LAST,
             created_at DESC
           LIMIT 1`,
      [req.auth.sub],
    );

    let targetEnergy = Number(latest.rows[0]?.final_energy_level);

    if (!Number.isFinite(targetEnergy) || targetEnergy <= 0) {
      const moodLatest = await pool.query(
        `SELECT energy_level FROM moods WHERE user_id = $1 AND energy_level IS NOT NULL AND energy_level > 0 ORDER BY created_at DESC LIMIT 1`,
        [req.auth.sub],
      );
      targetEnergy = Number(moodLatest.rows[0]?.energy_level);
    }

    if (!Number.isFinite(targetEnergy) || targetEnergy <= 0) {
      const actLatest = await pool.query(
        `SELECT energy_level FROM activity_history WHERE user_id = $1 AND energy_level IS NOT NULL AND energy_level > 0 ORDER BY created_at DESC LIMIT 1`,
        [req.auth.sub],
      );
      targetEnergy = Number(actLatest.rows[0]?.energy_level);
    }

    const safeTarget =
      Number.isFinite(targetEnergy) && targetEnergy > 0
        ? Math.min(100, Math.max(1, Math.round(targetEnergy)))
        : 50;

    const firstRangeStart = getMusicEnergyRangeStart(safeTarget);

    const recommendations = [];

    for (let index = 0; index < 4; index += 1) {
      const rangeStart = firstRangeStart + index * 4;

      const rangeEnd = Math.min(100, rangeStart + 4);

      if (rangeStart > 96) {
        break;
      }

      const result = await pool.query(
        `SELECT *
             FROM music
             WHERE user_id = $1
               AND is_available = TRUE
               AND energy_level >= $2
               AND energy_level <= $3
             ORDER BY created_at DESC
             LIMIT 1`,
        [req.auth.sub, rangeStart, rangeEnd],
      );

      if (result.rows[0]) {
        recommendations.push({
          ...result.rows[0],

          recommendation_order: index + 1,

          energy_range_min: rangeStart,

          energy_range_max: rangeEnd,
        });
      }
    }

    res.json({
      data: recommendations,

      targetEnergy: safeTarget,

      ranges: recommendations.map((song) => ({
        order: song.recommendation_order,

        min: song.energy_range_min,

        max: song.energy_range_max,
      })),
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.post("/api/ai/chat", authOptional, async (req, res) => {
  try {
    const { messages = [] } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages are required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "AI chat is not configured",
      });
    }

    const recentMessages = messages.slice(-20);

    const conversation = recentMessages
      .map((message) => {
        const role = message.role === "assistant" ? "SAATHI" : "User";

        return `${role}: ${String(message.content || "").trim()}`;
      })
      .filter(Boolean)
      .join("\n");

    const prompt = `
You are Wellora, a supportive AI wellness companion Of Saathi Application.

Your role:
- Listen empathetically.
- Respond naturally and calmly.
- Help users reflect on their emotions.
- Suggest practical and safe wellness strategies.
- Encourage healthy habits and professional support when appropriate.
- Never claim to be a doctor, therapist, or emergency service.
- Never diagnose mental health conditions.
- Never prescribe medication.
- Do not make medical claims with certainty.
- Keep responses helpful and reasonably concise.
- Ask one gentle follow-up question when appropriate.

Safety:
- If the user expresses immediate self-harm or suicide risk,
  encourage them to seek immediate human help.
- Encourage contacting a trusted person nearby.
- Encourage local emergency services when there is immediate danger.
- In India, mention Tele-MANAS at 14416 when appropriate.
- Do not provide instructions for self-harm.

Conversation:

${conversation}

Respond as SAATHI.
`;

    let response = null;

    let lastError = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`Trying Gemini model: ${model}`);

        response = await gemini.models.generateContent({
          model,
          contents: prompt,
        });

        console.log(`Gemini model succeeded: ${model}`);

        break;
      } catch (error) {
        lastError = error;

        console.error(`Gemini model ${model} failed:`, {
          status: error?.status,

          message: error?.message,
        });

        if (error?.status === 401 || error?.status === 403) {
          throw error;
        }
      }
    }

    if (!response) {
      console.error("All Gemini models failed:", lastError);

      return res.status(503).json({
        error:
          "SAATHI AI is temporarily unavailable. Please try again in a moment.",
      });
    }

    const message =
      typeof response.text === "string" ? response.text.trim() : "";

    if (!message) {
      return res.status(502).json({
        error: "SAATHI returned an empty response",
      });
    }

    return res.json({
      message,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return res.status(500).json({
      error: "Unable to generate AI response",
    });
  }
});

app.get("/api/auth/oauth/google/start", (_req, res) => {
  if (!oauthConfigured("google")) {
    return res.status(503).json({
      error: "Google OAuth is not configured",
    });
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,

    redirect_uri: process.env.GOOGLE_REDIRECT_URI,

    response_type: "code",

    scope: "openid email profile",

    access_type: "offline",

    state: oauthState("google"),
  });

  res.json({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  });
});

app.get("/api/auth/oauth/google/callback", async (req, res) => {
  try {
    const state = jwt.verify(String(req.query.state || ""), jwtSecret);

    if (state.provider !== "google") {
      throw new Error("Invalid OAuth state");
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        code: String(req.query.code || ""),

        client_id: process.env.GOOGLE_CLIENT_ID,

        client_secret: process.env.GOOGLE_CLIENT_SECRET,

        redirect_uri: process.env.GOOGLE_REDIRECT_URI,

        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Google token exchange failed");
    }

    const tokenData = await tokenResponse.json();

    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!profileResponse.ok) {
      throw new Error("Google profile request failed");
    }

    const profile = await profileResponse.json();

    const user = await findOrCreateOAuthUser({
      provider: "google",

      subject: profile.sub,

      email: profile.email,

      fullName: profile.name,
    });

    res.redirect(oauthCallbackUrl(tokenFor(user)));
  } catch (error) {
    res.redirect(
      `${frontendOrigin}/auth?oauth_error=${encodeURIComponent(
        error.message || "Google login failed",
      )}`,
    );
  }
});

app.get("/api/auth/oauth/apple/start", (_req, res) => {
  if (!oauthConfigured("apple")) {
    return res.status(503).json({
      error: "Apple OAuth is not configured",
    });
  }

  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID,

    redirect_uri: process.env.APPLE_REDIRECT_URI,

    response_type: "code",

    response_mode: "form_post",

    scope: "name email",

    state: oauthState("apple"),
  });

  res.json({
    url: `https://appleid.apple.com/auth/authorize?${params}`,
  });
});

app.post("/api/auth/oauth/apple/callback", async (req, res) => {
  try {
    const state = jwt.verify(String(req.body.state || ""), jwtSecret);

    if (state.provider !== "apple") {
      throw new Error("Invalid OAuth state");
    }

    const clientSecret = jwt.sign(
      {
        iss: process.env.APPLE_TEAM_ID,

        iat: Math.floor(Date.now() / 1000),

        exp: Math.floor(Date.now() / 1000) + 300,

        aud: "https://appleid.apple.com",

        sub: process.env.APPLE_CLIENT_ID,
      },

      process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),

      {
        algorithm: "ES256",

        keyid: process.env.APPLE_KEY_ID,
      },
    );

    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        client_id: process.env.APPLE_CLIENT_ID,

        client_secret: clientSecret,

        code: String(req.body.code || ""),

        grant_type: "authorization_code",

        redirect_uri: process.env.APPLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Apple token exchange failed");
    }

    const tokenData = await tokenResponse.json();

    const verified = await jwtVerify(
      tokenData.id_token,
      createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys")),
      {
        issuer: "https://appleid.apple.com",
        audience: process.env.APPLE_CLIENT_ID,
      },
    );

    const user = await findOrCreateOAuthUser({
      provider: "apple",

      subject: verified.payload.sub,

      email: verified.payload.email,
    });

    res.redirect(oauthCallbackUrl(tokenFor(user)));
  } catch (error) {
    res.redirect(
      `${frontendOrigin}/auth?oauth_error=${encodeURIComponent(
        error.message || "Apple login failed",
      )}`,
    );
  }
});

app.get("/api/integrations/fitbit/start", authRequired, async (req, res) => {
  if (!fitbitConfigured()) {
    return res.status(503).json({
      error: "Fitbit integration is not configured",
    });
  }

  const params = new URLSearchParams({
    response_type: "code",

    client_id: process.env.FITBIT_CLIENT_ID,

    redirect_uri: process.env.FITBIT_REDIRECT_URI,

    scope: "activity heartrate oxygen_saturation profile sleep",

    state: signedIntegrationState(req.auth.sub),
  });

  res.json({
    url: `https://www.fitbit.com/oauth2/authorize?${params}`,
  });
});

app.get("/api/integrations/fitbit/callback", async (req, res) => {
  try {
    if (!fitbitConfigured()) {
      return res.status(503).send("Fitbit integration is not configured");
    }

    const state = jwt.verify(String(req.query.state || ""), jwtSecret);

    if (state.integration !== "fitbit") {
      throw new Error("Invalid integration state");
    }

    const basic = Buffer.from(
      `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`,
    ).toString("base64");

    const response = await fetch("https://api.fitbit.com/oauth2/token", {
      method: "POST",

      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        client_id: process.env.FITBIT_CLIENT_ID,

        grant_type: "authorization_code",

        redirect_uri: process.env.FITBIT_REDIRECT_URI,

        code: String(req.query.code || ""),
      }),
    });

    if (!response.ok) {
      throw new Error("Fitbit authorization failed");
    }

    const token = await response.json();

    await pool.query(
      `DELETE FROM wellness_devices
         WHERE user_id = $1
           AND platform = 'fitbit'`,
      [state.sub],
    );

    await pool.query(
      `INSERT INTO wellness_devices
         (
           user_id,
           platform,
           device_name,
           access_token,
           refresh_token,
           token_expires_at
         )
         VALUES
         (
           $1,
           'fitbit',
           'Fitbit',
           $2,
           $3,
           NOW() +
           ($4 || ' seconds')::interval
         )`,
      [
        state.sub,
        token.access_token,
        token.refresh_token,
        String(token.expires_in),
      ],
    );

    res.redirect(`${frontendOrigin}/connect-device?fitbit=connected`);
  } catch (error) {
    res.status(400).send(error.message || "Fitbit authorization failed");
  }
});

app.get("/api/integrations/fitbit/metrics", authRequired, async (req, res) => {
  try {
    const device = await pool.query(
      "SELECT access_token, refresh_token, token_expires_at FROM wellness_devices WHERE user_id = $1 AND platform = 'fitbit' LIMIT 1",
      [req.auth.sub],
    );

    if (!device.rows[0]) {
      return res.status(404).json({
        error: "Fitbit is not connected",
      });
    }

    const accessToken = await fitbitToken(device.rows[0], req.auth.sub);

    const date = new Date().toISOString().slice(0, 10);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const [activityResponse, heartResponse, sleepResponse] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`, {
        headers,
      }),

      fetch(
        `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`,
        {
          headers,
        },
      ),

      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, {
        headers,
      }),
    ]);

    if (
      ![activityResponse, heartResponse, sleepResponse].every((item) => item.ok)
    ) {
      throw new Error("Fitbit metrics request failed");
    }

    const [activity, heart, sleep] = await Promise.all([
      activityResponse.json(),
      heartResponse.json(),
      sleepResponse.json(),
    ]);

    const metrics = {
      steps: activity.summary?.steps,

      calories: activity.summary?.caloriesOut,

      distance: activity.summary?.distances?.find(
        (item) => item.activity === "total",
      )?.distance,

      exerciseMinutes:
        (activity.summary?.fairlyActiveMinutes || 0) +
        (activity.summary?.veryActiveMinutes || 0),

      heartRate: heart["activities-heart"]?.[0]?.value?.restingHeartRate,

      sleepHours: sleep.summary?.totalMinutesAsleep
        ? sleep.summary.totalMinutesAsleep / 60
        : undefined,

      timestamp: new Date().toISOString(),
    };

    const metricEntries = [
      {
        metric_type: "steps",

        value: metrics.steps ?? 0,

        unit: "count",
      },

      {
        metric_type: "calories",

        value: metrics.calories ?? 0,

        unit: "kcal",
      },

      {
        metric_type: "distance",

        value: metrics.distance ?? 0,

        unit: "km",
      },

      {
        metric_type: "exercise_minutes",

        value: metrics.exerciseMinutes ?? 0,

        unit: "minutes",
      },

      {
        metric_type: "resting_heart_rate",

        value: metrics.heartRate ?? 0,

        unit: "bpm",
      },

      {
        metric_type: "sleep_hours",

        value: metrics.sleepHours ?? 0,

        unit: "hours",
      },
    ];

    for (const entry of metricEntries) {
      await pool.query(
        "INSERT INTO health_metrics (user_id, metric_type, value, unit, raw_data) VALUES ($1, $2, $3, $4, $5)",
        [
          req.auth.sub,
          entry.metric_type,
          entry.value,
          entry.unit,
          JSON.stringify(metrics),
        ],
      );
    }

    await pool.query(
      "UPDATE wellness_devices SET last_sync_at = NOW() WHERE user_id = $1 AND platform = 'fitbit'",
      [req.auth.sub],
    );

    res.json({
      data: metrics,
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.delete("/api/integrations/fitbit", authRequired, async (req, res) => {
  await pool.query(
    "DELETE FROM wellness_devices WHERE user_id = $1 AND platform = 'fitbit'",
    [req.auth.sub],
  );

  res.json({
    ok: true,
  });
});

/* =========================================================
   COMMUNITY
   ========================================================= */

app.get("/api/community/rooms", authRequired, async (_req, res) => {
  const result = await pool.query(`
    SELECT
      r.*,
      COUNT(m.user_id)::int AS member_count
    FROM community_rooms r
    LEFT JOIN community_memberships m
      ON m.room_id = r.id
    GROUP BY r.id
    ORDER BY r.created_at
  `);

  res.json({
    data: result.rows,
  });
});

app.post("/api/community/rooms", authRequired, async (req, res) => {
  const {
    name,
    topic = "",
    description = "",
    roomType = "support",
    energyLevel = 50,
  } = req.body;

  const cleanName = String(name || "")
    .trim()
    .slice(0, 80);

  const cleanTopic = String(topic || "")
    .trim()
    .slice(0, 140);

  const cleanDescription = String(description || "")
    .trim()
    .slice(0, 500);

  const parsedEnergyLevel = Number(energyLevel);

  const validTypes = new Set([
    "discussion",
    "circle",
    "support",
    "event",
    "announcement",
  ]);

  if (cleanName.length < 3) {
    return res.status(400).json({
      error: "Community name must be at least 3 characters",
    });
  }

  if (!validTypes.has(roomType)) {
    return res.status(400).json({
      error: "Invalid community type",
    });
  }

  if (
    !Number.isInteger(parsedEnergyLevel) ||
    parsedEnergyLevel < 0 ||
    parsedEnergyLevel > 100
  ) {
    return res.status(400).json({
      error: "Energy level must be an integer between 0 and 100",
    });
  }

  const baseId =
    cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 42) || "community";

  const roomId = `${baseId}-${crypto.randomUUID().slice(0, 8)}`;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        INSERT INTO community_rooms
        (
          id,
          owner_id,
          name,
          room_type,
          topic,
          description,
          energy_level
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING
          id,
          owner_id,
          name,
          room_type,
          topic,
          description,
          energy_level,
          created_at
      `,
      [
        roomId,
        req.auth.sub,
        cleanName,
        roomType,
        cleanTopic,
        cleanDescription,
        parsedEnergyLevel,
      ],
    );

    await client.query(
      `
        INSERT INTO community_memberships
        (
          room_id,
          user_id,
          role
        )
        VALUES
        (
          $1,
          $2,
          'admin'
        )
      `,
      [roomId, req.auth.sub],
    );

    /* FIX:
       Store the CREATED ROOM energy in activity_history.energy_level
    */
    const activity = await recordActivity(client, {
      userId: req.auth.sub,
      activityType: "community",
      title: "Created Community",
      subtitle: cleanName,
      energyLevel: parsedEnergyLevel,
      metadata: {
        community_id: roomId,
        action: "created",
        room_energy_level: parsedEnergyLevel,
      },
    });

    console.log(
      `[ACTIVITY] community activity recorded: ${activity.id} (created ${roomId})`,
    );

    await client.query("COMMIT");

    res.status(201).json({
      data: {
        ...result.rows[0],
        member_count: 1,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    publicError(res, error);
  } finally {
    client.release();
  }
});

app.post(
  "/api/community/rooms/:roomId/join",
  authRequired,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /* FIX:
         Read the room's energy level before creating the activity.
      */
      const roomResult = await client.query(
        `
          SELECT
            id,
            name,
            energy_level
          FROM community_rooms
          WHERE id = $1
          FOR UPDATE
        `,
        [req.params.roomId],
      );

      const room = roomResult.rows[0];

      if (!room) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "Community room not found",
        });
      }

      const insertResult = await client.query(
        `
          INSERT INTO community_memberships
          (
            room_id,
            user_id
          )
          VALUES
          (
            $1,
            $2
          )
          ON CONFLICT
          (room_id, user_id)
          DO NOTHING
          RETURNING room_id
        `,
        [req.params.roomId, req.auth.sub],
      );

      /* Only create JOIN activity if membership was actually created. */
      if (insertResult.rowCount > 0) {
        const activity = await recordActivity(client, {
          userId: req.auth.sub,
          activityType: "community",
          title: "Joined Community",
          subtitle: room.name || null,

          /* FIX: use the room's energy */
          energyLevel: room.energy_level,

          metadata: {
            community_id: req.params.roomId,
            action: "joined",
            room_energy_level: room.energy_level,
          },
        });

        console.log(
          `[ACTIVITY] community activity recorded: ${activity.id} (joined ${req.params.roomId}, energy ${room.energy_level})`,
        );
      }

      await client.query("COMMIT");

      res.json({
        ok: true,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      publicError(res, error);
    } finally {
      client.release();
    }
  },
);

app.delete(
  "/api/community/rooms/:roomId/leave",
  authRequired,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /* FIX:
         Get room energy before deleting membership.
      */
      const roomResult = await client.query(
        `
          SELECT
            id,
            name,
            energy_level
          FROM community_rooms
          WHERE id = $1
          FOR UPDATE
        `,
        [req.params.roomId],
      );

      const room = roomResult.rows[0];

      if (!room) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "Community room not found",
        });
      }

      const deleteResult = await client.query(
        `
          DELETE FROM community_memberships
          WHERE room_id = $1
            AND user_id = $2
          RETURNING room_id
        `,
        [req.params.roomId, req.auth.sub],
      );

      /* Only create LEAVE activity if membership actually existed. */
      if (deleteResult.rowCount > 0) {
        const activity = await recordActivity(client, {
          userId: req.auth.sub,
          activityType: "community",
          title: "Left Community",
          subtitle: room.name || null,

          /* FIX: use the room's energy */
          energyLevel: room.energy_level,

          metadata: {
            community_id: req.params.roomId,
            action: "left",
            room_energy_level: room.energy_level,
          },
        });

        console.log(
          `[ACTIVITY] community activity recorded: ${activity.id} (left ${req.params.roomId}, energy ${room.energy_level})`,
        );
      }

      await client.query("COMMIT");

      res.json({
        ok: true,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      publicError(res, error);
    } finally {
      client.release();
    }
  },
);

app.get(
  "/api/community/rooms/:roomId/membership",
  authRequired,
  async (req, res) => {
    const result = await pool.query(
      `
        SELECT
          role
        FROM community_memberships
        WHERE room_id = $1
          AND user_id = $2
      `,
      [req.params.roomId, req.auth.sub],
    );

    res.json({
      isMember: result.rows.length > 0,

      role: result.rows[0]?.role || null,
    });
  },
);

app.get(
  "/api/community/rooms/:roomId/messages",
  authRequired,
  async (req, res) => {
    const result = await pool.query(
      `
        SELECT
          m.*,
          u.full_name AS sender_name,
          COALESCE(
            json_agg(
              json_build_object(
                'emoji',
                r.emoji,
                'user_id',
                r.user_id
              )
            )
            FILTER (
              WHERE r.emoji IS NOT NULL
            ),
            '[]'
          ) AS reactions
        FROM community_messages m
        JOIN saathi_users u
          ON u.id = m.sender_id
        LEFT JOIN community_message_reactions r
          ON r.message_id = m.id
        WHERE
          m.room_id = $1
          AND m.deleted_at IS NULL
        GROUP BY
          m.id,
          u.full_name
        ORDER BY
          m.created_at ASC
        LIMIT 200
      `,
      [req.params.roomId],
    );

    res.json({
      data: result.rows,
    });
  },
);

app.post(
  "/api/community/rooms/:roomId/messages",
  authRequired,
  async (req, res) => {
    const {
      content,
      messageType = "text",
      replyToId = null,
      support = null,
    } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        error: "Message content is required",
      });
    }

    const user = await pool.query(
      "SELECT full_name FROM saathi_users WHERE id = $1",
      [req.auth.sub],
    );

    const senderName = user.rows[0]?.full_name || "Saathi member";

    const result = await pool.query(
      `
        INSERT INTO community_messages
        (
          room_id,
          sender_id,
          sender_name,
          message_type,
          content,
          reply_to_id,
          support
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING *
      `,
      [
        req.params.roomId,
        req.auth.sub,
        senderName,
        messageType,
        content.trim(),
        replyToId,
        support,
      ],
    );

    const message = {
      ...result.rows[0],
      reactions: [],
    };

    io.to(req.params.roomId).emit("message:new", message);

    res.status(201).json({
      data: message,
    });
  },
);

app.post(
  "/api/community/messages/:messageId/reactions",
  authRequired,
  async (req, res) => {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        error: "Emoji is required",
      });
    }

    const removed = await pool.query(
      `
        DELETE FROM community_message_reactions
        WHERE
          message_id = $1
          AND user_id = $2
          AND emoji = $3
        RETURNING message_id
      `,
      [req.params.messageId, req.auth.sub, emoji],
    );

    if (removed.rowCount === 0) {
      const user = await pool.query(
        "SELECT full_name FROM saathi_users WHERE id = $1",
        [req.auth.sub],
      );

      await pool.query(
        `
          INSERT INTO community_message_reactions
          (
            message_id,
            user_id,
            user_name,
            emoji
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4
          )
          ON CONFLICT
          DO NOTHING
        `,
        [
          req.params.messageId,
          req.auth.sub,
          user.rows[0]?.full_name || "",
          emoji,
        ],
      );
    }

    res.json({
      ok: true,

      active: removed.rowCount === 0,
    });
  },
);

app.get("/api/community/feed", authRequired, async (req, res) => {
  const result = await pool.query(`
    SELECT
      p.*,
      u.full_name AS author_name
    FROM community_posts p
    JOIN saathi_users u
      ON u.id = p.author_id
    WHERE
      p.visibility = 'community'
    ORDER BY
      p.created_at DESC
    LIMIT 50
  `);

  res.json({
    data: result.rows,
  });
});

app.post("/api/community/feed", authRequired, async (req, res) => {
  const {
    title = "",
    body = "",
    mood = null,
    postType = "reflection",
    visibility = "community",
    stats = {},
  } = req.body;

  const result = await pool.query(
    `
      INSERT INTO community_posts
      (
        author_id,
        title,
        body,
        mood,
        post_type,
        visibility,
        stats
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      RETURNING *
    `,
    [
      req.auth.sub,
      title,
      body,
      mood,
      postType,
      visibility,
      JSON.stringify(stats),
    ],
  );

  res.status(201).json({
    data: result.rows[0],
  });
});

app.get(
  "/api/community/feed/:postId/comments",
  authRequired,
  async (req, res) => {
    const result = await pool.query(
      `
        SELECT
          c.*,
          u.full_name AS author_name
        FROM community_comments c
        JOIN saathi_users u
          ON u.id = c.author_id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
      `,
      [req.params.postId],
    );

    res.json({
      data: result.rows,
    });
  },
);

app.post(
  "/api/community/feed/:postId/comments",
  authRequired,
  async (req, res) => {
    const { body } = req.body;

    if (!body?.trim()) {
      return res.status(400).json({
        error: "Comment body is required",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO community_comments
        (
          post_id,
          author_id,
          body
        )
        VALUES
        (
          $1,
          $2,
          $3
        )
        RETURNING *
      `,
      [req.params.postId, req.auth.sub, body.trim()],
    );

    res.status(201).json({
      data: result.rows[0],
    });
  },
);

const blockedAnonymousContent = [
  "http://",
  "https://",
  "www.",
  "buy now",
  "free money",
  "click here",
];

function validateAnonymousThought(thought) {
  const clean = String(thought || "").trim();

  if (clean.length < 20 || clean.length > 1000) {
    return "Thoughts must be between 20 and 1000 characters";
  }

  const normalized = clean.toLowerCase();

  if (blockedAnonymousContent.some((term) => normalized.includes(term))) {
    return "This post looks promotional and cannot be published";
  }

  if (/(. )\1{9,}/.test(normalized)) {
    return "Please write a meaningful thought";
  }

  return null;
}

app.get("/api/anonymous-posts", authRequired, async (req, res) => {
  const result = await pool.query(
    `
      SELECT
        p.id,
        p.thought,
        p.photo_data,
        p.likes_count,
        p.created_at,
        EXISTS(
          SELECT 1
          FROM anonymous_post_likes l
          WHERE
            l.post_id = p.id
            AND l.user_id = $1
        ) AS liked_by_me
      FROM anonymous_posts p
      WHERE
        p.moderation_status = 'approved'
      ORDER BY
        p.created_at DESC
      LIMIT 50
    `,
    [req.auth.sub],
  );

  res.json({
    data: result.rows,
  });
});

app.post("/api/anonymous-posts", authRequired, async (req, res) => {
  const { thought, photoData = null } = req.body;

  const validationError = validateAnonymousThought(thought);

  if (validationError) {
    return res.status(400).json({
      error: validationError,
    });
  }

  if (
    photoData &&
    (!String(photoData).startsWith("data:image/") ||
      String(photoData).length > 14000000)
  ) {
    return res.status(400).json({
      error: "Photo must be an image smaller than 10 MB",
    });
  }

  const recent = await pool.query(
    `
      SELECT
        COUNT(*)::int AS count
      FROM anonymous_posts
      WHERE
        author_id = $1
        AND created_at >
          NOW() -
          INTERVAL '10 minutes'
    `,
    [req.auth.sub],
  );

  if (recent.rows[0].count >= 3) {
    return res.status(429).json({
      error: "Please wait before posting again",
    });
  }

  const result = await pool.query(
    `
      INSERT INTO anonymous_posts
      (
        author_id,
        thought,
        photo_data
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING
        id,
        thought,
        photo_data,
        likes_count,
        created_at
    `,
    [req.auth.sub, String(thought).trim(), photoData],
  );

  res.status(201).json({
    data: {
      ...result.rows[0],
      liked_by_me: false,
    },
  });
});

app.post(
  "/api/anonymous-posts/:postId/like",
  authRequired,
  async (req, res) => {
    const removed = await pool.query(
      `
        DELETE FROM anonymous_post_likes
        WHERE
          post_id = $1
          AND user_id = $2
        RETURNING post_id
      `,
      [req.params.postId, req.auth.sub],
    );

    if (removed.rowCount === 0) {
      await pool.query(
        `
          INSERT INTO anonymous_post_likes
          (
            post_id,
            user_id
          )
          VALUES
          (
            $1,
            $2
          )
          ON CONFLICT
          DO NOTHING
        `,
        [req.params.postId, req.auth.sub],
      );
    }

    const post = await pool.query(
      `
        SELECT id
        FROM anonymous_posts
        WHERE
          id = $1
          AND moderation_status = 'approved'
      `,
      [req.params.postId],
    );

    if (!post.rows[0]) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const updated = await pool.query(
      `
        UPDATE anonymous_posts
        SET likes_count =
          (
            SELECT COUNT(*)
            FROM anonymous_post_likes
            WHERE post_id = $1
          )
        WHERE id = $1
        RETURNING likes_count
      `,
      [req.params.postId],
    );

    res.json({
      liked: removed.rowCount === 0,

      likesCount: Number(updated.rows[0].likes_count),
    });
  },
);

app.post("/api/data/moods", authRequired, async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];

  if (!items.length) {
    return res.status(400).json({ error: "Body cannot be empty" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertedItems = [];

    for (const item of items) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const { mood, note } = item;
      let energyLevel = item.energy_level;

      if (!mood || !String(mood).trim()) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "mood is required" });
      }

      energyLevel =
        energyLevel !== null && energyLevel !== undefined && energyLevel !== ""
          ? Number(energyLevel)
          : null;

      if (
        energyLevel !== null &&
        (!Number.isFinite(energyLevel) || energyLevel < 1 || energyLevel > 100)
      ) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "energy_level must be a number between 1 and 100",
        });
      }

      const insertResult = await client.query(
        `INSERT INTO moods (user_id, mood, energy_level, note)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          req.auth.sub,
          String(mood).trim(),
          energyLevel,
          note !== undefined && note !== null ? String(note) : null,
        ],
      );

      const inserted = insertResult.rows[0];
      insertedItems.push(inserted);

      const activity = await recordActivity(client, {
        userId: req.auth.sub,
        activityType: "mood",
        title: inserted.mood ? String(inserted.mood) : "Mood Logged",
        subtitle: null,
        energyLevel: inserted.energy_level,
        metadata: {
          mood_id: inserted.id,
          mood: inserted.mood,
          energy_level: inserted.energy_level,
        },
      });

      console.log(`[ACTIVITY] mood created and activity recorded: ${activity.id}`);
    }

    await client.query("COMMIT");

    res.status(201).json({
      data: insertedItems,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    publicError(res, error);
  } finally {
    client.release();
  }
});

app.patch("/api/data/moods", authRequired, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      error: "An id query parameter is required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT *
         FROM moods
         WHERE
           user_id = $1
           AND id = $2
         FOR UPDATE`,
      [req.auth.sub, id],
    );

    const existing = existingResult.rows[0];

    if (!existing) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Record not found",
      });
    }

    const assignments = [];

    const values = [req.auth.sub, id];

    for (const column of resourceConfig.moods.columns) {
      if (req.body[column] === undefined) {
        continue;
      }

      let value = req.body[column];

      if (column === "energy_level") {
        value = value !== null && value !== "" ? Number(value) : null;

        if (
          value !== null &&
          (!Number.isFinite(value) || value < 1 || value > 100)
        ) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            error: "energy_level must be a number between 1 and 100",
          });
        }
      }

      values.push(value);

      assignments.push(`${column} = $${values.length}`);
    }

    let updated = existing;

    if (assignments.length > 0) {
      const updateResult = await client.query(
        `UPDATE moods
             SET ${assignments.join(", ")}
             WHERE
               user_id = $1
               AND id = $2
             RETURNING *`,
        values,
      );

      updated = updateResult.rows[0];
    }

    const activity = await recordActivity(client, {
      userId: req.auth.sub,

      activityType: "mood",

      title: updated.mood ? String(updated.mood) : "Mood Updated",

      subtitle: null,

      energyLevel: updated.energy_level,

      metadata: {
        mood_id: updated.id,

        mood: updated.mood,

        energy_level: updated.energy_level,
      },
    });

    console.log(`[ACTIVITY] mood saved and activity recorded: ${activity.id}`);

    await client.query("COMMIT");

    res.json({
      data: [updated],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    publicError(res, error);
  } finally {
    client.release();
  }
});

app.patch("/api/data/music", authRequired, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      error: "An id query parameter is required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT *
           FROM music
           WHERE
             user_id = $1
             AND id = $2
           FOR UPDATE`,
      [req.auth.sub, id],
    );

    const existing = existingResult.rows[0];

    if (!existing) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Record not found",
      });
    }

    const assignments = [];

    const values = [req.auth.sub, id];

    for (const column of resourceConfig.music.columns) {
      if (req.body[column] === undefined) {
        continue;
      }

      let value = req.body[column];

      if (
        [
          "duration_seconds",
          "listened_till",
          "repetition",
          "energy_level",
        ].includes(column) &&
        value !== null &&
        value !== ""
      ) {
        value = Number(value);
      }

      if (column === "energy_level" && value !== null && value !== "") {
        if (!Number.isFinite(value) || value < 1 || value > 100) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            error: "music energy_level must be between 1 and 100",
          });
        }
      }

      if (column === "repetition" && value !== null && value !== "") {
        if (!Number.isInteger(value) || value < 0) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            error: "repetition must be a non-negative integer",
          });
        }
      }

      if (column === "listened_till" && value !== null && value !== "") {
        if (!Number.isFinite(value) || value < 0) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            error: "listened_till must be a non-negative number",
          });
        }
      }

      if (column === "duration_seconds" && value !== null && value !== "") {
        if (!Number.isFinite(value) || value < 0) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            error: "duration_seconds must be a non-negative number",
          });
        }
      }

      values.push(value);

      assignments.push(`${column} = $${values.length}`);
    }

    let updated = existing;

    if (assignments.length > 0) {
      const updateResult = await client.query(
        `UPDATE music
             SET ${assignments.join(", ")}
             WHERE
               user_id = $1
               AND id = $2
             RETURNING *`,
        values,
      );

      updated = updateResult.rows[0];
    }

    if (
      (updated.energy_level === null || updated.energy_level === undefined) &&
      getMusicEnergyLevel(updated.song_name) !== null
    ) {
      const mappedEnergy = getMusicEnergyLevel(updated.song_name);

      const energyResult = await client.query(
        `UPDATE music
             SET energy_level = $1
             WHERE
               user_id = $2
               AND id = $3
             RETURNING *`,
        [mappedEnergy, req.auth.sub, id],
      );

      updated = energyResult.rows[0];
    }

    const oldRepetition = Number(existing.repetition || 0);

    const newRepetition = Number(updated.repetition || 0);

    const repetitionIncreased = newRepetition > oldRepetition;

    if (repetitionIncreased) {
      const duration = Number(updated.duration_seconds || 0);

      const listenedTill = Number(updated.listened_till || 0);

      const listenedPercentage =
        duration > 0
          ? Math.min(100, Math.round((listenedTill / duration) * 100))
          : null;

      const musicEnergy =
        updated.energy_level ?? getMusicEnergyLevel(updated.song_name);

      const rangeStart = musicEnergy
        ? getMusicEnergyRangeStart(musicEnergy)
        : null;

      const rangeEnd =
        rangeStart !== null ? Math.min(100, rangeStart + 4) : null;

      const activity = await recordActivity(client, {
        userId: req.auth.sub,

        activityType: "music",

        title: updated.song_name || "Music",

        subtitle: updated.artist || null,

        energyLevel: musicEnergy,

        metadata: {
          music_id: updated.id,

          song_name: updated.song_name,

          artist: updated.artist,

          music_energy_level: musicEnergy,

          energy_range_min: rangeStart,

          energy_range_max: rangeEnd,

          listened_till: listenedTill,

          duration_seconds: duration,

          listened_percentage: listenedPercentage,

          repetition: newRepetition,

          listening_session: newRepetition,

          action: "listen",

          last_listened_at: updated.last_listened_at,
        },
      });

      console.log(
        `[ACTIVITY] music listening session ${newRepetition} recorded: ${activity.id}`,
      );
    }

    await client.query("COMMIT");

    res.json({
      data: [updated],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    publicError(res, error);
  } finally {
    client.release();
  }
});

app.post("/api/data/meditation_sessions", authRequired, async (req, res) => {
  const { duration, completed, energy_level } = req.body;

  const isCompleted = completed === undefined ? true : Boolean(completed);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertResult = await client.query(
      `INSERT INTO meditation_sessions
           (
             user_id,
             duration,
             completed,
             energy_level
           )
           VALUES
           (
             $1,
             $2,
             $3,
             $4
           )
           RETURNING *`,
      [
        req.auth.sub,
        duration ?? null,
        isCompleted,
        energy_level !== undefined &&
        energy_level !== null &&
        energy_level !== ""
          ? Number(energy_level)
          : null,
      ],
    );

    const session = insertResult.rows[0];

    const activity = await recordActivity(client, {
      userId: req.auth.sub,

      activityType: "meditation",

      title: "Meditation Session",

      subtitle: null,

      energyLevel: session.energy_level,

      metadata: {
        session_id: session.id,

        duration_seconds: session.duration,

        completed: session.completed,
      },
    });

    console.log(`[ACTIVITY] meditation saved: ${activity.id}`);

    await client.query("COMMIT");

    res.status(201).json({
      data: [session],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    publicError(res, error);
  } finally {
    client.release();
  }
});

app.patch("/api/data/meditation_sessions", authRequired, async (req, res) => {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      error: "An id query parameter is required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT *
           FROM meditation_sessions
           WHERE
             user_id = $1
             AND id = $2
           FOR UPDATE`,
      [req.auth.sub, id],
    );

    const existing = existingResult.rows[0];

    if (!existing) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Record not found",
      });
    }

    const assignments = [];

    const values = [req.auth.sub, id];

    for (const column of resourceConfig.meditation_sessions.columns) {
      if (req.body[column] === undefined) {
        continue;
      }

      let value = req.body[column];

      if (column === "duration") {
        value = value !== null && value !== "" ? Number(value) : null;
      }

      if (column === "energy_level") {
        value = value !== null && value !== "" ? Number(value) : null;
      }

      if (column === "completed") {
        value = Boolean(value);
      }

      values.push(value);

      assignments.push(`${column} = $${values.length}`);
    }

    let updated = existing;

    if (assignments.length > 0) {
      const updateResult = await client.query(
        `UPDATE meditation_sessions
             SET ${assignments.join(", ")}
             WHERE
               user_id = $1
               AND id = $2
             RETURNING *`,
        values,
      );

      updated = updateResult.rows[0];
    }

    const activity = await recordActivity(client, {
      userId: req.auth.sub,

      activityType: "meditation",

      title: "Meditation Session",

      subtitle: null,

      energyLevel: updated.energy_level,

      metadata: {
        session_id: updated.id,

        duration_seconds: updated.duration,

        completed: updated.completed,
      },
    });

    console.log(`[ACTIVITY] meditation saved: ${activity.id}`);

    await client.query("COMMIT");

    res.json({
      data: [updated],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    publicError(res, error);
  } finally {
    client.release();
  }
});

app.post("/api/data/activity_history", authRequired, (_req, res) => {
  res.status(403).json({
    error:
      "activity_history records are created automatically by the wellness features (mood, music, meditation, journal, community) and cannot be created directly.",
  });
});

app.patch("/api/data/activity_history", authRequired, async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        error: "An id query parameter is required",
      });
    }

    const { process: _ignoredProcess, ...allowedUpdates } = req.body || {};

    if (
      allowedUpdates.activity_type !== undefined &&
      !ACTIVITY_TYPES.includes(allowedUpdates.activity_type)
    ) {
      return res.status(400).json({
        error: `activity_type must be one of: ${ACTIVITY_TYPES.join(", ")}`,
      });
    }

    if (
      allowedUpdates.energy_level !== undefined &&
      allowedUpdates.energy_level !== null
    ) {
      const numericEnergy = Number(allowedUpdates.energy_level);

      if (
        !Number.isFinite(numericEnergy) ||
        numericEnergy < 1 ||
        numericEnergy > 100
      ) {
        return res.status(400).json({
          error: "energy_level must be a number between 1 and 100",
        });
      }
    }

    const updated = await updateResource(
      resourceConfig.activity_history,
      req.auth.sub,
      id,
      allowedUpdates,
    );

    if (!updated) {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    res.json({
      data: [updated],
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.get(
  "/api/activity-history/unprocessed",
  mlServiceRequired,
  async (req, res) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 1000);

      const conditions = ["process IS NULL"];

      const values = [];

      if (req.query.user_id) {
        values.push(req.query.user_id);

        conditions.push(`user_id = $${values.length}`);
      }

      if (req.query.activity_type) {
        values.push(req.query.activity_type);

        conditions.push(`activity_type = $${values.length}`);
      }

      values.push(limit);

      const result = await pool.query(
        `SELECT
             id,
             user_id,
             activity_type,
             title,
             subtitle,
             energy_level,
             metadata,
             created_at
           FROM activity_history
           WHERE ${conditions.join(" AND ")}
           ORDER BY created_at ASC
           LIMIT $${values.length}`,
        values,
      );

      res.json({
        data: result.rows,
      });
    } catch (error) {
      console.error("Unprocessed activity fetch error:", error.message);

      res.status(500).json({
        error: "Failed to fetch unprocessed activities",
      });
    }
  },
);

app.patch(
  "/api/activity-history/:id/process",
  mlServiceRequired,
  async (req, res) => {
    try {
      const processValue =
        typeof req.body?.process === "string" && req.body.process.trim()
          ? req.body.process.trim()
          : "processed";

      const result = await pool.query(
        "UPDATE activity_history SET process = $1 WHERE id = $2 RETURNING id, process",
        [processValue, req.params.id],
      );

      if (!result.rows[0]) {
        return res.status(404).json({
          error: "Activity not found",
        });
      }

      res.json({
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Activity process update error:", error.message);

      res.status(500).json({
        error: "Failed to update activity",
      });
    }
  },
);
async function analyzeJournalEnergy(journalText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API is not configured");
  }

  const text = String(journalText || "").trim();

  if (!text) {
    throw new Error("Journal content is required");
  }

  const prompt = `
You are Saathi's wellness analysis system.

Analyze the user's journal entry and estimate their CURRENT ENERGY LEVEL.

Use this scale:

1-20:
Extremely low energy.
Very drained, exhausted, depleted, or almost no motivation.

21-40:
Low energy.
Tired, mentally drained, withdrawn, or struggling to engage.

41-60:
Moderate energy.
Stable, neutral, average, balanced, or mixed energy.

61-80:
Good energy.
Motivated, engaged, active, hopeful, and reasonably energetic.

81-100:
Very high energy.
Highly motivated, excited, enthusiastic, energized, and strongly engaged.

Important:
- Predict current ENERGY, not simple positive/negative sentiment.
- Do not assume happiness means high energy.
- Do not assume sadness means low energy.
- Consider fatigue, motivation, focus, activity, engagement, and mental drive.
- Base the score only on evidence in the journal.
- Do not diagnose medical or psychiatric conditions.
- Return only JSON.

Journal:
${text}
`;

  const models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log(`[JOURNAL AI] Trying model: ${model}`);

      const response = await gemini.models.generateContent({
        model,
        contents: prompt,

        config: {
          responseMimeType: "application/json",

          responseSchema: {
            type: "object",

            properties: {
              energy_level: {
                type: "integer",
                description: "Current energy level from 1 to 100",
              },

              confidence: {
                type: "number",
                description: "Confidence from 0 to 1",
              },

              reason: {
                type: "string",
                description: "Short reason for the energy prediction",
              },
            },

            required: [
              "energy_level",
              "confidence",
              "reason",
            ],
          },
        },
      });

      const raw = response.text?.trim();

      if (!raw) {
        throw new Error(
          `Gemini model ${model} returned an empty response`,
        );
      }

      let result;

      try {
        result = JSON.parse(raw);
      } catch {
        throw new Error(
          `Gemini model ${model} returned invalid JSON`,
        );
      }

      const energy = Number(result.energy_level);
      const confidence = Number(result.confidence);

      if (
        !Number.isInteger(energy) ||
        energy < 1 ||
        energy > 100
      ) {
        throw new Error(
          `Gemini model ${model} returned invalid energy_level`,
        );
      }

      console.log(
        `[JOURNAL AI] ${model} succeeded: energy=${energy}`,
      );

      return {
        energy_level: energy,

        confidence: Number.isFinite(confidence)
          ? Math.max(0, Math.min(1, confidence))
          : 0,

        reason: String(result.reason || "").trim(),
      };
    } catch (error) {
      lastError = error;

      const status = error?.status;
      const message = error?.message || "Unknown Gemini error";

      console.error(
        `[JOURNAL AI] ${model} failed`,
        {
          status,
          message,
        },
      );

      /*
       * Try the next model when Gemini says:
       * - model unavailable / high demand
       * - temporary server error
       * - rate limit
       *
       * Don't silently continue on authentication errors.
       */
      if (status === 401 || status === 403) {
        throw error;
      }

      if (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.toLowerCase().includes("unavailable") ||
        message.toLowerCase().includes("high demand")
      ) {
        continue;
      }

      /*
       * For other errors, fail immediately because
       * they are probably configuration/code problems.
       */
      throw error;
    }
  }

  throw new Error(
    `Gemini journal analysis is temporarily unavailable. Last error: ${
      lastError?.message || "Unknown error"
    }`,
  );
}
app.post(
  "/api/data/journals",
  authRequired,
  upload.array("images", 10),

  async (req, res) => {
    const client = await pool.connect();

    try {
      const { title = "", content = "", mood } = req.body;

      // ------------------------------------------
      // 1. Validate journal text
      // ------------------------------------------

      const cleanContent = String(content || "").trim();

      if (!cleanContent) {
        return res.status(400).json({
          error: "Journal content is required",
        });
      }

      // ------------------------------------------
      // 2. Make sure Gemini is configured
      // ------------------------------------------

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "Journal energy analysis is not configured",
        });
      }

      // ------------------------------------------
      // 3. Get uploaded images
      // ------------------------------------------

      const files = req.files || [];

      const mediaUrls = files.map(
        (file) => `/uploads/journals/${file.filename}`,
      );

      const mediaMetadata = {
        urls: mediaUrls,

        files: files.map((file) => ({
          original_name: file.originalname,

          filename: file.filename,

          mimetype: file.mimetype,

          size: file.size,
        })),
      };

      // ------------------------------------------
      // 4. Gemini analyzes journal energy
      // ------------------------------------------

      const aiAnalysis = await analyzeJournalEnergy(cleanContent);

      const parsedEnergyLevel = aiAnalysis.energy_level;

      console.log("[JOURNAL AI] Energy analysis:", {
        energy_level: parsedEnergyLevel,

        confidence: aiAnalysis.confidence,

        reason: aiAnalysis.reason,
      });

      // ------------------------------------------
      // 5. Start database transaction
      // ------------------------------------------

      await client.query("BEGIN");

      // ------------------------------------------
      // 6. Save journal
      // ------------------------------------------

      const result = await client.query(
        `INSERT INTO journals
         (
           user_id,
           title,
           content,
           mood,
           energy_level,
           media_type,
           media_url,
           media_metadata
         )
         VALUES
         (
           $1,
           $2,
           $3,
           $4,
           $5,
           $6,
           $7,
           $8
         )
         RETURNING *`,

        [
          req.auth.sub,

          String(title).trim(),

          cleanContent,

          mood || null,

          // Gemini-generated energy
          parsedEnergyLevel,

          files.length ? "image" : null,

          mediaUrls[0] || null,

          JSON.stringify(mediaMetadata),
        ],
      );

      const journal = result.rows[0];

      // ------------------------------------------
      // 7. Save activity history
      // ------------------------------------------

      const activity = await recordActivity(client, {
        userId: req.auth.sub,

        activityType: "journal",

        title: "Journal Entry",

        subtitle: null,

        energyLevel: journal.energy_level,

        metadata: {
          journal_id: journal.id,

          journal_energy_level: journal.energy_level,

          ai_confidence: aiAnalysis.confidence,

          ai_reason: aiAnalysis.reason,
        },
      });

      console.log(
        `[ACTIVITY] journal created: ${activity.id} with Gemini energy ${journal.energy_level}`,
      );

      // ------------------------------------------
      // 8. Commit
      // ------------------------------------------

      await client.query("COMMIT");

      // ------------------------------------------
      // 9. Response
      // ------------------------------------------

      return res.status(201).json({
        data: journal,

        analysis: {
          energy_level: journal.energy_level,

          confidence: aiAnalysis.confidence,

          reason: aiAnalysis.reason,
        },
      });
    } catch (error) {
      // ------------------------------------------
      // Rollback safely
      // ------------------------------------------

      try {
        await client.query("ROLLBACK");
      } catch {}

      console.error("Create journal error:", error);

      return res.status(400).json({
        error: error?.message || "Failed to create journal",
      });
    } finally {
      client.release();
    }
  },
);
app.get("/api/data/:resource", authRequired, async (req, res) => {
  try {
    const config = resourceOr404(req, res);

    if (!config) return;

    const data = await listResource(config, req.auth.sub, req.query);

    res.json({
      data,
      count: data.length,
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.post("/api/data/:resource", authRequired, async (req, res) => {
  try {
    const config = resourceOr404(req, res);

    if (!config) return;

    if (config.readOnly) {
      return res.status(403).json({
        error:
          "This resource is written internally and cannot be created directly",
      });
    }

    const items = Array.isArray(req.body) ? req.body : [req.body];

    const data = [];

    for (const item of items) {
      let insertItem = item;

      if (config.table === "music") {
        const mappedEnergy = getMusicEnergyLevel(item.song_name);

        insertItem = {
          ...item,

          energy_level:
            item.energy_level !== undefined &&
            item.energy_level !== null &&
            item.energy_level !== ""
              ? Number(item.energy_level)
              : mappedEnergy,
        };

        if (
          insertItem.energy_level !== null &&
          insertItem.energy_level !== undefined
        ) {
          if (
            !Number.isFinite(Number(insertItem.energy_level)) ||
            Number(insertItem.energy_level) < 1 ||
            Number(insertItem.energy_level) > 100
          ) {
            return res.status(400).json({
              error: "music energy_level must be between 1 and 100",
            });
          }
        }
      }

      data.push(await insertResource(config, req.auth.sub, insertItem));
    }

    res.status(201).json({
      data,
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.patch("/api/data/:resource", authRequired, async (req, res) => {
  try {
    const config = resourceOr404(req, res);

    if (!config) return;

    if (config.readOnly) {
      return res.status(403).json({
        error:
          "This resource is written internally and cannot be updated directly",
      });
    }

    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        error: "An id query parameter is required",
      });
    }

    const updated = await updateResource(config, req.auth.sub, id, req.body);

    if (!updated) {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    res.json({
      data: [updated],
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.delete("/api/data/:resource", authRequired, async (req, res) => {
  try {
    const config = resourceOr404(req, res);

    if (!config) return;

    if (config.readOnly) {
      return res.status(403).json({
        error:
          "This resource is written internally and cannot be deleted directly",
      });
    }

    await deleteResource(config, req.auth.sub, req.query.id);

    res.json({
      data: [],
    });
  } catch (error) {
    publicError(res, error);
  }
});

app.delete("/api/account/delete", authRequired, async (req, res) => {
  await pool.query("DELETE FROM saathi_users WHERE id = $1", [req.auth.sub]);

  res.json({
    ok: true,
  });
});

app.use((error, _req, res, _next) =>
  res.status(500).json({
    error: error.message || "Internal server error",
  }),
);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    socket.data.auth = jwt.verify(token, jwtSecret);

    next();
  } catch {
    next(new Error("Invalid or expired session"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.auth.sub;

  function broadcastPresence(roomId) {
    const members = io.sockets.adapter.rooms.get(roomId);

    io.to(roomId).emit("room:presence", {
      roomId,
      count: members?.size ?? 0,
    });
  }

  socket.on("room:join", (roomId) => {
    if (typeof roomId !== "string" || roomId.length > 80) {
      return;
    }

    socket.join(roomId);

    socket.data.roomId = roomId;

    broadcastPresence(roomId);
  });

  socket.on("room:leave", (roomId) => {
    socket.leave(roomId);

    broadcastPresence(roomId);
  });

  socket.on("typing:start", (roomId) =>
    socket.to(roomId).emit("typing:update", {
      roomId,
      userId,
      typing: true,
    }),
  );

  socket.on("typing:stop", (roomId) =>
    socket.to(roomId).emit("typing:update", {
      roomId,
      userId,
      typing: false,
    }),
  );

  socket.on("message:read", ({ roomId, messageId }) =>
    socket.to(roomId).emit("message:read", {
      messageId,
      userId,
    }),
  );

  socket.on("message:send", async (message, callback) => {
    try {
      if (!message?.roomId || !message?.content?.trim()) {
        return;
      }

      await pool.query(
        `
          INSERT INTO community_memberships
          (
            room_id,
            user_id
          )
          VALUES
          (
            $1,
            $2
          )
          ON CONFLICT
          DO NOTHING
        `,
        [message.roomId, userId],
      );

      const user = await pool.query(
        "SELECT full_name FROM saathi_users WHERE id = $1",
        [userId],
      );

      const senderName =
        user.rows[0]?.full_name || message.senderName || "Saathi member";

      const result = await pool.query(
        `
          INSERT INTO community_messages
          (
            id,
            room_id,
            sender_id,
            sender_name,
            message_type,
            content,
            support
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
          RETURNING *
        `,
        [
          message.id || crypto.randomUUID(),

          message.roomId,

          userId,

          senderName,

          message.type || "text",

          message.content.trim(),

          message.support || null,
        ],
      );

      const outgoing = {
        ...result.rows[0],
        reactions: [],
        isMine: false,
      };

      io.to(message.roomId).emit("message:new", outgoing);

      callback?.({
        ok: true,
        message: outgoing,
      });
    } catch (error) {
      callback?.({
        ok: false,
        error: error.message,
      });
    }
  });

  socket.on("message:react", async ({ roomId, messageId, reactions }) => {
    await pool.query(
      "DELETE FROM community_message_reactions WHERE message_id = $1 AND user_id = $2",
      [messageId, userId],
    );

    const selected = (reactions || []).find((reaction) =>
      reaction.users?.includes("me"),
    );

    if (selected) {
      const user = await pool.query(
        "SELECT full_name FROM saathi_users WHERE id = $1",
        [userId],
      );

      await pool.query(
        `
          INSERT INTO community_message_reactions
          (
            message_id,
            user_id,
            user_name,
            emoji
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4
          )
          ON CONFLICT
          DO NOTHING
        `,
        [messageId, userId, user.rows[0]?.full_name || "", selected.emoji],
      );
    }

    io.to(roomId).emit("message:reaction", {
      messageId,
      reactions,
    });
  });

  socket.on("disconnect", () => {
    if (socket.data.roomId) {
      broadcastPresence(socket.data.roomId);
    }
  });
});

// ============================================================
// TEMPORARY WELLNESS PREDICTION + NOTIFICATION SYSTEM
// ============================================================

function getWellnessRecommendation(predictedEnergyLevel) {
  const score = Number(predictedEnergyLevel);

  if (!Number.isFinite(score)) {
    return {
      title: "Take a gentle reset",
      activity: "10-minute reset",
      body: "Take a few minutes to drink water, breathe slowly, and give yourself a short break.",
    };
  }

  if (score <= 30) {
    return {
      title: "Take a gentle reset",
      activity: "10-minute reset",
      body: "Your current wellness pattern looks lower than usual. Try a 10-minute reset with water, slow breathing, and a short rest.",
    };
  }

  if (score <= 55) {
    return {
      title: "Give yourself a small boost",
      activity: "5-minute movement break",
      body: "Take a short movement break, stretch, walk around, and give yourself a few minutes away from your current task.",
    };
  }

  if (score <= 75) {
    return {
      title: "Keep your routine balanced",
      activity: "5-minute mindful break",
      body: "Your wellness level looks fairly balanced. A short mindful break can help you maintain your routine.",
    };
  }

  return {
    title: "Keep the positive routine going",
    activity: "Positive routine",
    body: "Your wellness level looks positive. Continue the activities and routines that are working well for you.",
  };
}

async function createWellnessPredictionAndNotification(
  userId,
  predictedEnergyLevel,
) {
  const score = Math.max(
    0,
    Math.min(100, Math.round(Number(predictedEnergyLevel))),
  );

  const recommendation = getWellnessRecommendation(score);

  // Store prediction
  const predictionResult = await pool.query(
    `
      INSERT INTO weekly_energy_predictions
      (
        user_id,
        predicted_energy_level,
        recommendation_title,
        recommendation_activity,
        recommendation_body
      )
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      userId,
      score,
      recommendation.title,
      recommendation.activity,
      recommendation.body,
    ],
  );

  // Create notification
  const notificationResult = await pool.query(
    `
      INSERT INTO notifications
      (
        user_id,
        notification_type,
        title,
        body
      )
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      userId,
      "wellness_prediction",
      recommendation.title,
      recommendation.body,
    ],
  );

  return {
    prediction: predictionResult.rows[0],
    notification: notificationResult.rows[0],
    recommendation,
  };
}


// ------------------------------------------------------------
// TEST ENDPOINT
// ------------------------------------------------------------
// This is intentionally hardcoded.
// It does NOT perform ML prediction.
// ------------------------------------------------------------

app.post(
  "/api/wellness-prediction/test",
  authRequired,
  async (req, res) => {
    try {
      const predictedEnergyLevel = Number(
        req.body.predicted_energy_level,
      );

      if (
        !Number.isFinite(predictedEnergyLevel) ||
        predictedEnergyLevel < 0 ||
        predictedEnergyLevel > 100
      ) {
        return res.status(400).json({
          error: "predicted_energy_level must be between 0 and 100",
        });
      }

      const result =
        await createWellnessPredictionAndNotification(
          req.auth.sub,
          predictedEnergyLevel,
        );

      res.json({
        mode: "hardcoded-test",
        message:
          "Temporary wellness prediction generated successfully.",
        note:
          "This is a rule-based demonstration and is NOT a clinical diagnosis or validated ML prediction.",
        ...result,
      });
    } catch (error) {
      console.error(
        "Wellness prediction test error:",
        error,
      );

      res.status(500).json({
        error: error.message,
      });
    }
  },
);


// ------------------------------------------------------------
// GENERATE FROM CURRENT WELLNESS DATA
// ------------------------------------------------------------
// Temporary rule-based version.
// Later this endpoint can call the actual ML service.
// ------------------------------------------------------------

app.post(
  "/api/wellness-prediction/generate",
  authRequired,
  async (req, res) => {
    try {
      let predictedEnergyLevel = null;

      // First try current weekly data
      const weeklyResult = await pool.query(
        `
          SELECT AVG(avg_wellness) AS average_wellness
          FROM weekly_data
          WHERE user_id = $1
            AND week_start = DATE_TRUNC(
              'week',
              CURRENT_DATE
            )::date
            AND avg_wellness IS NOT NULL
        `,
        [req.auth.sub],
      );

      if (weeklyResult.rows[0]?.average_wellness !== null) {
        predictedEnergyLevel = Math.round(
          Number(
            weeklyResult.rows[0].average_wellness,
          ),
        );
      }

      // Fallback to latest wellness score
      if (predictedEnergyLevel === null) {
        const wellnessResult = await pool.query(
          `
            SELECT final_energy_level
            FROM wellness_scores
            WHERE user_id = $1
            LIMIT 1
          `,
          [req.auth.sub],
        );

        if (wellnessResult.rows[0]) {
          predictedEnergyLevel = Math.round(
            Number(
              wellnessResult.rows[0].final_energy_level,
            ),
          );
        }
      }

      if (predictedEnergyLevel === null) {
        return res.status(404).json({
          error:
            "Not enough wellness data available to generate a prediction.",
        });
      }

      const result =
        await createWellnessPredictionAndNotification(
          req.auth.sub,
          predictedEnergyLevel,
        );

      res.json({
        mode: "temporary-rule-based",
        message:
          "Wellness recommendation generated from available wellness data.",
        note:
          "This is not a validated predictive ML model or clinical diagnosis.",
        ...result,
      });
    } catch (error) {
      console.error(
        "Wellness prediction generation error:",
        error,
      );

      res.status(500).json({
        error: error.message,
      });
    }
  },
);


// ------------------------------------------------------------
// GET LATEST PREDICTION
// ------------------------------------------------------------

app.get(
  "/api/wellness-prediction/latest",
  authRequired,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
          SELECT *
          FROM weekly_energy_predictions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [req.auth.sub],
      );

      res.json({
        data: result.rows[0] || null,
      });
    } catch (error) {
      console.error(
        "Latest wellness prediction error:",
        error,
      );

      res.status(500).json({
        error: error.message,
      });
    }
  },
);


// ------------------------------------------------------------
// GET LATEST NOTIFICATIONS
// ------------------------------------------------------------

app.get(
  "/api/notifications/latest",
  authRequired,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
          SELECT *
          FROM notifications
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 20
        `,
        [req.auth.sub],
      );

      res.json({
        data: result.rows,
      });
    } catch (error) {
      console.error(
        "Latest notifications error:",
        error,
      );

      res.status(500).json({
        error: error.message,
      });
    }
  },
);

initializeDatabase()
  .then(() =>
    httpServer.listen(port, () =>
      console.log(
        `Saathi PostgreSQL backend listening on http://localhost:${port}`,
      ),
    ),
  )
  .catch((error) => {
    console.error("PostgreSQL connection failed:", error.message);

    process.exit(1);
  });
