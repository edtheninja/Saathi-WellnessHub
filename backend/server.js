import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import pg from "pg";
import { Server } from "socket.io";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createRemoteJWKSet, jwtVerify } from "jose";

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me";
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = allowedOrigin.split(",").map((origin) => origin.trim());
const frontendOrigin = allowedOrigins[0];
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false });
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: allowedOrigins, credentials: true } });

app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin is not allowed"));
}, credentials: true }));
app.use(express.json({ limit: "256kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { error: "Too many authentication attempts" } });

const allowedTables = new Set([
  "profiles", "journals", "journal", "mood", "meditation", "goals", "settings",
  "devices", "health_metrics", "notifications", "activity_history", "chat_messages",
  "community_posts", "community_comments", "community_reactions", "mantra_sessions",
]);
const sharedTables = new Set(["chat_messages", "community_posts", "community_comments", "community_reactions"]);

async function initializeDatabase() {
  await pool.query(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saathi_users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL DEFAULT '',
      email_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS saathi_records (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
      table_name TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS saathi_records_user_table_idx ON saathi_records(user_id, table_name);
    CREATE INDEX IF NOT EXISTS saathi_records_created_idx ON saathi_records(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS saathi_records_data_idx ON saathi_records USING GIN(data);
  `);
}

function tokenFor(user) {
  return jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}
function userPayload(user) {
  return { id: user.id, email: user.email, email_confirmed_at: user.email_confirmed_at, user_metadata: { name: user.full_name, full_name: user.full_name } };
}
function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try { req.auth = jwt.verify(token, jwtSecret); next(); } catch { res.status(401).json({ error: "Invalid or expired session" }); }
}
function authOptional(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try { req.auth = jwt.verify(token, jwtSecret); } catch { /* Treat expired guest tokens as anonymous. */ }
  }
  next();
}
function publicError(res, error) {
  if (error?.code === "23505") return res.status(409).json({ error: "An account with this email already exists" });
  return res.status(400).json({ error: error?.message || "Request failed" });
}
function oauthConfigured(provider) {
  if (provider === "google") return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);
  return Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY && process.env.APPLE_REDIRECT_URI);
}
function oauthState(provider) {
  return jwt.sign({ provider, nonce: crypto.randomUUID() }, jwtSecret, { expiresIn: "10m" });
}
function oauthCallbackUrl(token) {
  return `${frontendOrigin}/auth/callback?oauth_token=${encodeURIComponent(token)}`;
}
async function findOrCreateOAuthUser({ provider, subject, email, fullName = "" }) {
  let result = await pool.query("SELECT id, email, full_name, email_confirmed_at FROM saathi_users WHERE oauth_provider = $1 AND oauth_subject = $2", [provider, subject]);
  if (result.rows[0]) return result.rows[0];
  result = await pool.query("SELECT id, email, full_name, email_confirmed_at FROM saathi_users WHERE email = $1", [email.toLowerCase()]);
  if (result.rows[0]) {
    await pool.query("UPDATE saathi_users SET oauth_provider = $1, oauth_subject = $2 WHERE id = $3", [provider, subject, result.rows[0].id]);
    return result.rows[0];
  }
  const user = { id: crypto.randomUUID(), email: email.toLowerCase(), full_name: fullName || email.split("@")[0], email_confirmed_at: new Date().toISOString() };
  await pool.query("INSERT INTO saathi_users (id, email, password_hash, full_name, oauth_provider, oauth_subject) VALUES ($1, $2, $3, $4, $5, $6)", [user.id, user.email, "oauth-account", user.full_name, provider, subject]);
  await pool.query("INSERT INTO profiles (user_id, full_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING", [user.id, user.full_name]);
  return user;
}
function signedIntegrationState(userId) {
  return jwt.sign({ sub: userId, integration: "fitbit" }, jwtSecret, { expiresIn: "10m" });
}
function fitbitConfigured() {
  return Boolean(process.env.FITBIT_CLIENT_ID && process.env.FITBIT_CLIENT_SECRET && process.env.FITBIT_REDIRECT_URI);
}
async function fitbitToken(token, userId) {
  if (new Date(token.token_expires_at).getTime() > Date.now() + 60_000) return token.access_token;
  const basic = Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: token.refresh_token }),
  });
  if (!response.ok) throw new Error("Fitbit token refresh failed");
  const refreshed = await response.json();
  await pool.query(`UPDATE wellness_devices SET access_token = $1, refresh_token = $2, token_expires_at = NOW() + ($3 || ' seconds')::interval WHERE user_id = $4 AND platform = 'fitbit'`, [refreshed.access_token, refreshed.refresh_token, String(refreshed.expires_in), userId]);
  return refreshed.access_token;
}
function safeTable(req, res) {
  if (!allowedTables.has(req.params.table)) { res.status(404).json({ error: "Resource not found" }); return null; }
  return req.params.table;
}
function recordValue(row) {
  return { ...row.data, id: row.data.id || row.id, user_id: row.user_id, created_at: row.created_at };
}
function matchesFilter(record, key, value) {
  if (key === "id") return record.id === value;
  return String(record[key] ?? "") === String(value);
}
function matchesRange(record, key, operator, value) {
  const actual = key === "created_at" ? new Date(record[key]).getTime() : Number(record[key]);
  const expected = key === "created_at" ? new Date(value).getTime() : Number(value);
  return operator === "gte" ? actual >= expected : actual <= expected;
}
async function getRecords(table, userId, query) {
  const result = sharedTables.has(table)
    ? await pool.query("SELECT id, user_id, data, created_at FROM saathi_records WHERE table_name = $1 ORDER BY created_at DESC", [table])
    : await pool.query("SELECT id, user_id, data, created_at FROM saathi_records WHERE user_id = $1 AND table_name = $2 ORDER BY created_at DESC", [userId, table]);
  let rows = result.rows.map(recordValue);
  for (const [key, value] of Object.entries(query)) {
    if (["select", "order", "limit"].includes(key)) continue;
    if (key.startsWith("gte_")) rows = rows.filter((row) => matchesRange(row, key.slice(4), "gte", value));
    else if (key.startsWith("lte_")) rows = rows.filter((row) => matchesRange(row, key.slice(4), "lte", value));
    else rows = rows.filter((row) => matchesFilter(row, key, value));
  }
  if (query.order) {
    const [field, direction = "asc"] = String(query.order).split(":");
    rows.sort((a, b) => String(a[field] ?? "").localeCompare(String(b[field] ?? "")) * (direction === "desc" ? -1 : 1));
  }
  if (query.limit) rows = rows.slice(0, Number(query.limit));
  return rows;
}
async function recordId(table, userId, id) {
  const result = sharedTables.has(table)
    ? await pool.query("SELECT id FROM saathi_records WHERE table_name = $1 AND (id::text = $2 OR data->>'id' = $2) LIMIT 1", [table, id])
    : await pool.query("SELECT id FROM saathi_records WHERE user_id = $1 AND table_name = $2 AND (id::text = $3 OR data->>'id' = $3) LIMIT 1", [userId, table, id]);
  return result.rows[0]?.id;
}
async function insertRecord(table, userId, item) {
  const id = item.id || crypto.randomUUID();
  const record = { ...item, id };
  const result = await pool.query("INSERT INTO saathi_records (id, user_id, table_name, data) VALUES ($1, $2, $3, $4) RETURNING created_at", [crypto.randomUUID(), userId, table, JSON.stringify(record)]);
  return { ...record, user_id: userId, created_at: result.rows[0].created_at };
}

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "saathi-postgresql" }));

app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const { email, password, fullName = "" } = req.body;
    if (!email || !password || password.length < 6) return res.status(400).json({ error: "Email and a password of at least 6 characters are required" });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ error: "A valid email is required" });
    const user = { id: crypto.randomUUID(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), fullName: String(fullName).trim().slice(0, 120) };
    await pool.query("INSERT INTO saathi_users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4)", [user.id, user.email, user.passwordHash, user.fullName]);
    await pool.query("INSERT INTO saathi_records (id, user_id, table_name, data) VALUES ($1, $2, 'profiles', $3)", [crypto.randomUUID(), user.id, JSON.stringify({ id: user.id, full_name: user.fullName, name: user.fullName })]);
    const payload = { id: user.id, email: user.email, full_name: user.fullName, email_confirmed_at: new Date().toISOString() };
    res.status(201).json({ user: userPayload(payload), session: { access_token: tokenFor(payload) } });
  } catch (error) { publicError(res, error); }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email, password_hash, full_name, email_confirmed_at FROM saathi_users WHERE email = $1", [String(req.body.email || "").toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password_hash))) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ user: userPayload(user), session: { access_token: tokenFor(user) } });
  } catch (error) { publicError(res, error); }
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const result = await pool.query("SELECT id, email, full_name, email_confirmed_at FROM saathi_users WHERE id = $1", [req.auth.sub]);
  if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
  res.json({ user: userPayload(result.rows[0]) });
});
app.patch("/api/auth/password", authRequired, async (req, res) => {
  if (!req.body.password || req.body.password.length < 6) return res.status(400).json({ error: "Password must contain at least 6 characters" });
  await pool.query("UPDATE saathi_users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(req.body.password, 12), req.auth.sub]);
  res.json({ ok: true });
});

const wellnessSystemPrompt = `You are Saathi, a warm mental-wellness companion. Be concise, empathetic, practical, and non-judgmental. You are not a doctor, therapist, or emergency service. Never diagnose, prescribe medication, or claim certainty. For signs of immediate danger, self-harm, or suicide, encourage the person to contact local emergency services or Tele-MANAS at 14416 and suggest reaching a trusted person now. Ask one gentle follow-up question when useful.`;
const fallbackChatResponses = [
  "Thank you for sharing that. Your feelings matter. What feels like the smallest supportive step you could take right now?",
  "I hear you. Try taking one slow breath and naming what you need most in this moment: rest, support, clarity, or connection.",
  "That sounds difficult. You do not have to solve everything at once. What part feels heaviest today?",
];

app.post("/api/ai/chat", authOptional, async (req, res) => {
  const incoming = Array.isArray(req.body.messages) ? req.body.messages : [];
  const messages = incoming
    .filter((message) => message && (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
    .slice(-12)
    .map((message) => ({ role: message.role, content: message.content.slice(0, 2000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "A user message is required" });

  const provider = process.env.AI_PROVIDER || (process.env.GROQ_API_KEY ? "groq" : "gemini");
  try {
    if (provider === "groq" && process.env.GROQ_API_KEY) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.1-8b-instant", temperature: 0.65, max_tokens: 350, messages: [{ role: "system", content: wellnessSystemPrompt }, ...messages] }),
      });
      if (!response.ok) throw new Error("Groq request failed");
      const payload = await response.json();
      return res.json({ provider: "groq", message: payload.choices?.[0]?.message?.content || fallbackChatResponses[0] });
    }

    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      const contents = messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: wellnessSystemPrompt }] }, contents, generationConfig: { temperature: 0.65, maxOutputTokens: 350 } }),
      });
      if (!response.ok) throw new Error("Gemini request failed");
      const payload = await response.json();
      return res.json({ provider: "gemini", message: payload.candidates?.[0]?.content?.parts?.[0]?.text || fallbackChatResponses[0] });
    }

    return res.json({ provider: "fallback", message: fallbackChatResponses[Math.floor(Math.random() * fallbackChatResponses.length)] });
  } catch (error) {
    console.error("AI chat provider error:", error.message);
    return res.json({ provider: "fallback", message: fallbackChatResponses[0] });
  }
});

app.get("/api/auth/oauth/google/start", (_req, res) => {
  if (!oauthConfigured("google")) return res.status(503).json({ error: "Google OAuth is not configured" });
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: process.env.GOOGLE_REDIRECT_URI, response_type: "code", scope: "openid email profile", access_type: "offline", state: oauthState("google") });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

app.get("/api/auth/oauth/google/callback", async (req, res) => {
  try {
    const state = jwt.verify(String(req.query.state || ""), jwtSecret);
    if (state.provider !== "google") throw new Error("Invalid OAuth state");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: String(req.query.code || ""), client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: process.env.GOOGLE_REDIRECT_URI, grant_type: "authorization_code" }) });
    if (!tokenResponse.ok) throw new Error("Google token exchange failed");
    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    if (!profileResponse.ok) throw new Error("Google profile request failed");
    const profile = await profileResponse.json();
    const user = await findOrCreateOAuthUser({ provider: "google", subject: profile.sub, email: profile.email, fullName: profile.name });
    res.redirect(oauthCallbackUrl(tokenFor(user)));
  } catch (error) { res.redirect(`${frontendOrigin}/auth?oauth_error=${encodeURIComponent(error.message || "Google login failed")}`); }
});

app.get("/api/auth/oauth/apple/start", (_req, res) => {
  if (!oauthConfigured("apple")) return res.status(503).json({ error: "Apple OAuth is not configured" });
  const params = new URLSearchParams({ client_id: process.env.APPLE_CLIENT_ID, redirect_uri: process.env.APPLE_REDIRECT_URI, response_type: "code", response_mode: "form_post", scope: "name email", state: oauthState("apple") });
  res.json({ url: `https://appleid.apple.com/auth/authorize?${params}` });
});

app.post("/api/auth/oauth/apple/callback", async (req, res) => {
  try {
    const state = jwt.verify(String(req.body.state || ""), jwtSecret);
    if (state.provider !== "apple") throw new Error("Invalid OAuth state");
    const clientSecret = jwt.sign({ iss: process.env.APPLE_TEAM_ID, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 300, aud: "https://appleid.apple.com", sub: process.env.APPLE_CLIENT_ID }, process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"), { algorithm: "ES256", keyid: process.env.APPLE_KEY_ID });
    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: process.env.APPLE_CLIENT_ID, client_secret: clientSecret, code: String(req.body.code || ""), grant_type: "authorization_code", redirect_uri: process.env.APPLE_REDIRECT_URI }) });
    if (!tokenResponse.ok) throw new Error("Apple token exchange failed");
    const tokenData = await tokenResponse.json();
    const verified = await jwtVerify(tokenData.id_token, createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys")), { issuer: "https://appleid.apple.com", audience: process.env.APPLE_CLIENT_ID });
    const user = await findOrCreateOAuthUser({ provider: "apple", subject: verified.payload.sub, email: verified.payload.email });
    res.redirect(oauthCallbackUrl(tokenFor(user)));
  } catch (error) { res.redirect(`${frontendOrigin}/auth?oauth_error=${encodeURIComponent(error.message || "Apple login failed")}`); }
});

app.get("/api/integrations/fitbit/start", authRequired, async (req, res) => {
  if (!fitbitConfigured()) return res.status(503).json({ error: "Fitbit integration is not configured" });
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.FITBIT_CLIENT_ID,
    redirect_uri: process.env.FITBIT_REDIRECT_URI,
    scope: "activity heartrate oxygen_saturation profile sleep",
    state: signedIntegrationState(req.auth.sub),
  });
  res.json({ url: `https://www.fitbit.com/oauth2/authorize?${params}` });
});

app.get("/api/integrations/fitbit/callback", async (req, res) => {
  try {
    if (!fitbitConfigured()) return res.status(503).send("Fitbit integration is not configured");
    const state = jwt.verify(String(req.query.state || ""), jwtSecret);
    if (state.integration !== "fitbit") throw new Error("Invalid integration state");
    const basic = Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://api.fitbit.com/oauth2/token", {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.FITBIT_CLIENT_ID, grant_type: "authorization_code", redirect_uri: process.env.FITBIT_REDIRECT_URI, code: String(req.query.code || "") }),
    });
    if (!response.ok) throw new Error("Fitbit authorization failed");
    const token = await response.json();
    await pool.query(`DELETE FROM wellness_devices WHERE user_id = $1 AND platform = 'fitbit'`, [state.sub]);
    await pool.query(`INSERT INTO wellness_devices (user_id, platform, device_name, access_token, refresh_token, token_expires_at) VALUES ($1, 'fitbit', 'Fitbit', $2, $3, NOW() + ($4 || ' seconds')::interval)`, [state.sub, token.access_token, token.refresh_token, String(token.expires_in)]);
    res.redirect(`${frontendOrigin}/connect-device?fitbit=connected`);
  } catch (error) { res.status(400).send(error.message || "Fitbit authorization failed"); }
});

app.get("/api/integrations/fitbit/metrics", authRequired, async (req, res) => {
  try {
    const device = await pool.query("SELECT access_token, refresh_token, token_expires_at FROM wellness_devices WHERE user_id = $1 AND platform = 'fitbit' LIMIT 1", [req.auth.sub]);
    if (!device.rows[0]) return res.status(404).json({ error: "Fitbit is not connected" });
    const accessToken = await fitbitToken(device.rows[0], req.auth.sub);
    const date = new Date().toISOString().slice(0, 10);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const [activityResponse, heartResponse, sleepResponse] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`, { headers }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`, { headers }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, { headers }),
    ]);
    if (![activityResponse, heartResponse, sleepResponse].every((item) => item.ok)) throw new Error("Fitbit metrics request failed");
    const [activity, heart, sleep] = await Promise.all([activityResponse.json(), heartResponse.json(), sleepResponse.json()]);
    const metrics = { steps: activity.summary?.steps, calories: activity.summary?.caloriesOut, distance: activity.summary?.distances?.find((item) => item.activity === "total")?.distance, exerciseMinutes: activity.summary?.fairlyActiveMinutes + activity.summary?.veryActiveMinutes, heartRate: heart["activities-heart"]?.[0]?.value?.restingHeartRate, sleepHours: sleep.summary?.totalMinutesAsleep ? sleep.summary.totalMinutesAsleep / 60 : undefined, timestamp: new Date().toISOString() };
    await pool.query("INSERT INTO health_metrics (user_id, metric_type, value, unit, raw_data) VALUES ($1, 'fitbit_snapshot', $2, 'snapshot', $3)", [req.auth.sub, 0, JSON.stringify(metrics)]);
    await pool.query("UPDATE wellness_devices SET last_sync_at = NOW() WHERE user_id = $1 AND platform = 'fitbit'", [req.auth.sub]);
    res.json({ data: metrics });
  } catch (error) { publicError(res, error); }
});

app.delete("/api/integrations/fitbit", authRequired, async (req, res) => {
  await pool.query("DELETE FROM wellness_devices WHERE user_id = $1 AND platform = 'fitbit'", [req.auth.sub]);
  res.json({ ok: true });
});

app.get("/api/community/rooms", authRequired, async (_req, res) => {
  const result = await pool.query(`
    SELECT r.*, COUNT(m.user_id)::int AS member_count
    FROM community_rooms r
    LEFT JOIN community_memberships m ON m.room_id = r.id
    GROUP BY r.id
    ORDER BY r.created_at
  `);
  res.json({ data: result.rows });
});

app.post("/api/community/rooms", authRequired, async (req, res) => {
  const { name, topic = "", description = "", roomType = "support" } = req.body;
  const cleanName = String(name || "").trim().slice(0, 80);
  const cleanTopic = String(topic || "").trim().slice(0, 140);
  const cleanDescription = String(description || "").trim().slice(0, 500);
  const validTypes = new Set(["discussion", "circle", "support", "event", "announcement"]);

  if (cleanName.length < 3) return res.status(400).json({ error: "Community name must be at least 3 characters" });
  if (!validTypes.has(roomType)) return res.status(400).json({ error: "Invalid community type" });

  const baseId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "community";
  const roomId = `${baseId}-${crypto.randomUUID().slice(0, 8)}`;

  try {
    const result = await pool.query(`
      INSERT INTO community_rooms (id, owner_id, name, room_type, topic, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, owner_id, name, room_type, topic, description, created_at
    `, [roomId, req.auth.sub, cleanName, roomType, cleanTopic, cleanDescription]);
    await pool.query(`
      INSERT INTO community_memberships (room_id, user_id, role)
      VALUES ($1, $2, 'admin')
    `, [roomId, req.auth.sub]);
    res.status(201).json({ data: { ...result.rows[0], member_count: 1 } });
  } catch (error) { publicError(res, error); }
});

app.post("/api/community/rooms/:roomId/join", authRequired, async (req, res) => {
  await pool.query(`
    INSERT INTO community_memberships (room_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (room_id, user_id) DO NOTHING
  `, [req.params.roomId, req.auth.sub]);
  res.json({ ok: true });
});

app.get("/api/community/rooms/:roomId/messages", authRequired, async (req, res) => {
  const result = await pool.query(`
    SELECT m.*, u.full_name AS sender_name,
      COALESCE(json_agg(json_build_object('emoji', r.emoji, 'user_id', r.user_id)) FILTER (WHERE r.emoji IS NOT NULL), '[]') AS reactions
    FROM community_messages m
    JOIN saathi_users u ON u.id = m.sender_id
    LEFT JOIN community_message_reactions r ON r.message_id = m.id
    WHERE m.room_id = $1 AND m.deleted_at IS NULL
    GROUP BY m.id, u.full_name
    ORDER BY m.created_at ASC
    LIMIT 200
  `, [req.params.roomId]);
  res.json({ data: result.rows });
});

app.post("/api/community/rooms/:roomId/messages", authRequired, async (req, res) => {
  const { content, messageType = "text", replyToId = null, support = null } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "Message content is required" });
  const result = await pool.query(`
    INSERT INTO community_messages (room_id, sender_id, message_type, content, reply_to_id, support)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [req.params.roomId, req.auth.sub, messageType, content.trim(), replyToId, support]);
  const user = await pool.query("SELECT full_name FROM saathi_users WHERE id = $1", [req.auth.sub]);
  const message = { ...result.rows[0], sender_name: user.rows[0]?.full_name || "Saathi member", reactions: [] };
  io.to(req.params.roomId).emit("message:new", message);
  res.status(201).json({ data: message });
});

app.post("/api/community/messages/:messageId/reactions", authRequired, async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: "Emoji is required" });
  const removed = await pool.query(`
    DELETE FROM community_message_reactions
    WHERE message_id = $1 AND user_id = $2 AND emoji = $3
    RETURNING message_id
  `, [req.params.messageId, req.auth.sub, emoji]);
  if (removed.rowCount === 0) {
    await pool.query(`
      INSERT INTO community_message_reactions (message_id, user_id, emoji)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `, [req.params.messageId, req.auth.sub, emoji]);
  }
  res.json({ ok: true, active: removed.rowCount === 0 });
});

app.get("/api/community/feed", authRequired, async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, u.full_name AS author_name
    FROM community_posts p
    JOIN saathi_users u ON u.id = p.author_id
    WHERE p.visibility = 'community'
    ORDER BY p.created_at DESC
    LIMIT 50
  `);
  res.json({ data: result.rows });
});

app.post("/api/community/feed", authRequired, async (req, res) => {
  const { title = "", body = "", mood = null, postType = "reflection", visibility = "community", stats = {} } = req.body;
  const result = await pool.query(`
    INSERT INTO community_posts (author_id, title, body, mood, post_type, visibility, stats)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [req.auth.sub, title, body, mood, postType, visibility, stats]);
  res.status(201).json({ data: result.rows[0] });
});

const blockedAnonymousContent = ["http://", "https://", "www.", "buy now", "free money", "click here"];
function validateAnonymousThought(thought) {
  const clean = String(thought || "").trim();
  if (clean.length < 20 || clean.length > 1000) return "Thoughts must be between 20 and 1000 characters";
  const normalized = clean.toLowerCase();
  if (blockedAnonymousContent.some((term) => normalized.includes(term))) return "This post looks promotional and cannot be published";
  if (/(.)\1{9,}/.test(normalized)) return "Please write a meaningful thought";
  return null;
}

app.get("/api/anonymous-posts", authRequired, async (req, res) => {
  const result = await pool.query(`
    SELECT p.id, p.thought, p.photo_data, p.likes_count, p.created_at,
      EXISTS(SELECT 1 FROM anonymous_post_likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked_by_me
    FROM anonymous_posts p
    WHERE p.moderation_status = 'approved'
    ORDER BY p.created_at DESC
    LIMIT 50
  `, [req.auth.sub]);
  res.json({ data: result.rows });
});

app.post("/api/anonymous-posts", authRequired, async (req, res) => {
  const { thought, photoData = null } = req.body;
  const validationError = validateAnonymousThought(thought);
  if (validationError) return res.status(400).json({ error: validationError });
  if (photoData && (!String(photoData).startsWith("data:image/") || String(photoData).length > 2_500_000)) {
    return res.status(400).json({ error: "Photo must be an image smaller than 2 MB" });
  }
  const recent = await pool.query(`
    SELECT COUNT(*)::int AS count FROM anonymous_posts
    WHERE author_id = $1 AND created_at > NOW() - INTERVAL '10 minutes'
  `, [req.auth.sub]);
  if (recent.rows[0].count >= 3) return res.status(429).json({ error: "Please wait before posting again" });
  const result = await pool.query(`
    INSERT INTO anonymous_posts (author_id, thought, photo_data)
    VALUES ($1, $2, $3)
    RETURNING id, thought, photo_data, likes_count, created_at
  `, [req.auth.sub, String(thought).trim(), photoData]);
  res.status(201).json({ data: { ...result.rows[0], liked_by_me: false } });
});

app.post("/api/anonymous-posts/:postId/like", authRequired, async (req, res) => {
  const removed = await pool.query(`
    DELETE FROM anonymous_post_likes
    WHERE post_id = $1 AND user_id = $2
    RETURNING post_id
  `, [req.params.postId, req.auth.sub]);
  let liked = false;
  if (removed.rowCount === 0) {
    await pool.query(`
      INSERT INTO anonymous_post_likes (post_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [req.params.postId, req.auth.sub]);
    liked = true;
  }
  const result = await pool.query("SELECT likes_count FROM anonymous_posts WHERE id = $1 AND moderation_status = 'approved'", [req.params.postId]);
  if (!result.rows[0]) return res.status(404).json({ error: "Post not found" });
  await pool.query(`UPDATE anonymous_posts SET likes_count = (SELECT COUNT(*) FROM anonymous_post_likes WHERE post_id = $1) WHERE id = $1`, [req.params.postId]);
  const updated = await pool.query("SELECT likes_count FROM anonymous_posts WHERE id = $1", [req.params.postId]);
  res.json({ liked, likesCount: Number(updated.rows[0].likes_count) });
});

app.get("/api/data/:table", authRequired, async (req, res) => {
  try { const table = safeTable(req, res); if (!table) return; const data = await getRecords(table, req.auth.sub, req.query); res.json({ data, count: data.length }); } catch (error) { publicError(res, error); }
});
app.post("/api/data/:table", authRequired, async (req, res) => {
  try {
    const table = safeTable(req, res); if (!table) return;
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const data = [];
    for (const item of items) {
      data.push(await insertRecord(table, req.auth.sub, item));
    }
    res.status(201).json({ data });
  } catch (error) { publicError(res, error); }
});
app.patch("/api/data/:table", authRequired, async (req, res) => {
  try {
    const table = safeTable(req, res); if (!table) return;
    const id = req.query.id || req.query.key;
    const current = id ? await getRecords(table, req.auth.sub, { id }) : await getRecords(table, req.auth.sub, req.query);
    const currentRecord = current[0];
    if (!currentRecord) return res.json({ data: [] });
    const updated = { ...currentRecord, ...req.body, id: currentRecord.id };
    const databaseId = await recordId(table, req.auth.sub, currentRecord.id);
    await pool.query("UPDATE saathi_records SET data = $1 WHERE id = $2 AND user_id = $3", [JSON.stringify(updated), databaseId, req.auth.sub]);
    res.json({ data: [updated] });
  } catch (error) { publicError(res, error); }
});
app.delete("/api/data/:table", authRequired, async (req, res) => {
  try {
    const table = safeTable(req, res); if (!table) return;
    const id = req.query.id;
    if (id) await pool.query("DELETE FROM saathi_records WHERE user_id = $1 AND table_name = $2 AND (id::text = $3 OR data->>'id' = $3)", [req.auth.sub, table, id]);
    else await pool.query("DELETE FROM saathi_records WHERE user_id = $1 AND table_name = $2", [req.auth.sub, table]);
    res.json({ data: [] });
  } catch (error) { publicError(res, error); }
});

app.delete("/api/account/delete", authRequired, async (req, res) => {
  await pool.query("DELETE FROM saathi_users WHERE id = $1", [req.auth.sub]);
  res.json({ ok: true });
});

app.use((error, _req, res, _next) => res.status(500).json({ error: error.message || "Internal server error" }));

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    socket.data.auth = jwt.verify(token, jwtSecret);
    next();
  } catch { next(new Error("Invalid or expired session")); }
});

io.on("connection", (socket) => {
  const userId = socket.data.auth.sub;

  function broadcastPresence(roomId) {
    const members = io.sockets.adapter.rooms.get(roomId);
    io.to(roomId).emit("room:presence", { roomId, count: members?.size ?? 0 });
  }

  socket.on("room:join", (roomId) => {
    if (typeof roomId !== "string" || roomId.length > 80) return;
    socket.join(roomId);
    socket.data.roomId = roomId;
    broadcastPresence(roomId);
  });

  socket.on("room:leave", (roomId) => {
    socket.leave(roomId);
    broadcastPresence(roomId);
  });

  socket.on("typing:start", (roomId) => socket.to(roomId).emit("typing:update", { roomId, userId, typing: true }));
  socket.on("typing:stop", (roomId) => socket.to(roomId).emit("typing:update", { roomId, userId, typing: false }));
  socket.on("message:read", ({ roomId, messageId }) => socket.to(roomId).emit("message:read", { messageId, userId }));

  socket.on("message:send", async (message, callback) => {
    try {
      if (!message?.roomId || !message?.content?.trim()) return;
      await pool.query(`
        INSERT INTO community_memberships (room_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [message.roomId, userId]);
      const result = await pool.query(`
        INSERT INTO community_messages (id, room_id, sender_id, message_type, content, support)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [message.id || crypto.randomUUID(), message.roomId, userId, message.type || "text", message.content.trim(), message.support || null]);
      const user = await pool.query("SELECT full_name FROM saathi_users WHERE id = $1", [userId]);
      const saved = { ...result.rows[0], sender_name: user.rows[0]?.full_name || message.senderName || "Saathi member", reactions: [] };
      const outgoing = { ...saved, isMine: false };
      io.to(message.roomId).emit("message:new", outgoing);
      callback?.({ ok: true, message: outgoing });
    } catch (error) { callback?.({ ok: false, error: error.message }); }
  });

  socket.on("message:react", async ({ roomId, messageId, reactions }) => {
    await pool.query("DELETE FROM community_message_reactions WHERE message_id = $1 AND user_id = $2", [messageId, userId]);
    const selected = (reactions || []).find((reaction) => reaction.users?.includes("me"));
    if (selected) {
      await pool.query("INSERT INTO community_message_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [messageId, userId, selected.emoji]);
    }
    io.to(roomId).emit("message:reaction", { messageId, reactions });
  });

  socket.on("disconnect", () => {
    if (socket.data.roomId) broadcastPresence(socket.data.roomId);
  });
});

initializeDatabase()
  .then(() =>
    httpServer.listen(port, "0.0.0.0", () =>
      console.log(`Saathi PostgreSQL backend listening on port ${port}`)
    )
  )
  .catch((error) => {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1);
  });