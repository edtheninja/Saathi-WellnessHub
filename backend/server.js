import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { createServer } from "node:http";
import pg from "pg";
import { Server } from "socket.io";

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "development-secret-change-me";
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/saathi_wellness", ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : false });
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: allowedOrigin, credentials: true } });

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const allowedTables = new Set([
  "profiles", "journals", "journal", "mood", "meditation", "goals", "settings",
  "devices", "health_metrics", "notifications", "activity_history", "chat_messages",
  "community_posts", "community_comments", "community_reactions", "mantra_sessions",
]);
const sharedTables = new Set(["chat_messages", "community_posts", "community_comments", "community_reactions"]);

async function initializeDatabase() {
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
function publicError(res, error) {
  if (error?.code === "23505") return res.status(409).json({ error: "An account with this email already exists" });
  return res.status(400).json({ error: error?.message || "Request failed" });
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

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "saathi-wellness-postgresql" }));

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, fullName = "" } = req.body;
    if (!email || !password || password.length < 6) return res.status(400).json({ error: "Email and a password of at least 6 characters are required" });
    const user = { id: crypto.randomUUID(), email: String(email).toLowerCase(), passwordHash: await bcrypt.hash(password, 12), fullName };
    await pool.query("INSERT INTO saathi_users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4)", [user.id, user.email, user.passwordHash, user.fullName]);
    await pool.query("INSERT INTO saathi_records (id, user_id, table_name, data) VALUES ($1, $2, 'profiles', $3)", [crypto.randomUUID(), user.id, JSON.stringify({ id: user.id, full_name: user.fullName, name: user.fullName })]);
    const payload = { id: user.id, email: user.email, full_name: user.fullName, email_confirmed_at: new Date().toISOString() };
    res.status(201).json({ user: userPayload(payload), session: { access_token: tokenFor(payload) } });
  } catch (error) { publicError(res, error); }
});

app.post("/api/auth/login", async (req, res) => {
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
      const saved = await insertRecord("chat_messages", userId, {
        id: message.id,
        room_id: message.roomId,
        sender_id: userId,
        sender_name: message.senderName || "Saathi member",
        type: message.type || "text",
        content: message.content.trim(),
        reply_to: message.replyTo,
        support: message.support,
        reactions: message.reactions || [],
      });
      const outgoing = { ...saved, isMine: false };
      io.to(message.roomId).emit("message:new", outgoing);
      callback?.({ ok: true, message: outgoing });
    } catch (error) { callback?.({ ok: false, error: error.message }); }
  });

  socket.on("message:react", async ({ roomId, messageId, reactions }) => {
    const databaseId = await recordId("chat_messages", userId, messageId);
    if (!databaseId) return;
    await pool.query("UPDATE saathi_records SET data = jsonb_set(data, '{reactions}', $1::jsonb) WHERE id = $2 AND table_name = 'chat_messages'", [JSON.stringify(reactions || []), databaseId]);
    io.to(roomId).emit("message:reaction", { messageId, reactions });
  });

  socket.on("disconnect", () => {
    if (socket.data.roomId) broadcastPresence(socket.data.roomId);
  });
});

initializeDatabase().then(() => httpServer.listen(port, () => console.log(`Saathi PostgreSQL backend listening on http://localhost:${port}`))).catch((error) => { console.error("PostgreSQL connection failed:", error.message); process.exit(1); });
