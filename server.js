const crypto = require("crypto");
const path = require("path");
const fs = require("fs/promises");
const express = require("express");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const MarkdownIt = require("markdown-it");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 8787);
const linkedInMetricsDbPath = path.join(__dirname, "data", "linkedin-metrics.db");

const defaultLinkedInMetricsRows = [
  {
    date: "2026-02-24",
    profileViews: 124,
    connections: 381,
    posts: 18,
    messagesSent: 22,
  },
  {
    date: "2026-03-03",
    profileViews: 167,
    connections: 394,
    posts: 20,
    messagesSent: 29,
  },
  {
    date: "2026-03-10",
    profileViews: 213,
    connections: 409,
    posts: 23,
    messagesSent: 34,
  },
];

const config = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  scopes: process.env.LINKEDIN_SCOPES || "openid profile",
  publicUrl: process.env.LINKEDIN_PUBLIC_URL,
};

if (!config.clientId || !config.clientSecret || !config.redirectUri) {
  console.error("Missing LinkedIn OAuth env vars. Check your .env file.");
}

const sessions = new Map();
let currentLinkedInAuth = null;
let linkedInMetricsDb = null;

function isAllowedImageHost(urlString) {
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();
    return host.endsWith("licdn.com") || host.endsWith("linkedin.com");
  } catch (_error) {
    return false;
  }
}

function requiredHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function safeError(error) {
  if (error.response) {
    let responseData = error.response.data;
    if (typeof responseData === "string" && responseData.length > 1200) {
      responseData = `${responseData.slice(0, 1200)}\n...[truncated]`;
    }

    return {
      status: error.response.status,
      statusText: error.response.statusText,
      data: responseData,
    };
  }

  return { message: error.message };
}

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this);
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

async function initializeLinkedInMetricsDb() {
  if (linkedInMetricsDb) {
    return;
  }

  await fs.mkdir(path.dirname(linkedInMetricsDbPath), { recursive: true });

  linkedInMetricsDb = await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(linkedInMetricsDbPath, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(db);
    });
  });

  await dbRun(
    linkedInMetricsDb,
    `CREATE TABLE IF NOT EXISTS linkedin_metrics (
      date TEXT PRIMARY KEY,
      profile_views INTEGER NOT NULL,
      connections INTEGER NOT NULL,
      posts INTEGER NOT NULL,
      messages_sent INTEGER NOT NULL
    )`
  );

  const countRow = await dbGet(linkedInMetricsDb, "SELECT COUNT(*) AS count FROM linkedin_metrics");

  if (Number(countRow?.count || 0) === 0) {
    for (const row of defaultLinkedInMetricsRows) {
      await dbRun(
        linkedInMetricsDb,
        `INSERT INTO linkedin_metrics (date, profile_views, connections, posts, messages_sent)
         VALUES (?, ?, ?, ?, ?)`,
        [row.date, row.profileViews, row.connections, row.posts, row.messagesSent]
      );
    }
  }
}

async function readLinkedInMetricsRows() {
  await initializeLinkedInMetricsDb();
  const rows = await dbAll(
    linkedInMetricsDb,
    `SELECT date, profile_views, connections, posts, messages_sent
     FROM linkedin_metrics
     ORDER BY date ASC`
  );

  return rows.map((row) => ({
    date: row.date,
    profileViews: row.profile_views,
    connections: row.connections,
    posts: row.posts,
    messagesSent: row.messages_sent,
  }));
}

function parseMetricsPayload(payload) {
  const date = typeof payload?.date === "string" ? payload.date.trim() : "";
  const profileViews = Number(payload?.profileViews);
  const connections = Number(payload?.connections);
  const posts = Number(payload?.posts);
  const messagesSent = Number(payload?.messagesSent);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    return { ok: false, error: "`date` must be in YYYY-MM-DD format." };
  }

  const values = { profileViews, connections, posts, messagesSent };
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isInteger(value) || value < 0) {
      return { ok: false, error: `\`${key}\` must be a non-negative integer.` };
    }
  }

  return {
    ok: true,
    value: {
      date,
      profileViews,
      connections,
      posts,
      messagesSent,
    },
  };
}

function flattenDepartments(departments, collector = []) {
  for (const department of departments || []) {
    if (Array.isArray(department.jobs)) {
      collector.push(...department.jobs);
    }

    if (Array.isArray(department.children) && department.children.length > 0) {
      flattenDepartments(department.children, collector);
    }
  }

  return collector;
}

function getJobPostingLocations(job) {
  const metadata = Array.isArray(job?.metadata) ? job.metadata : [];
  const locationMeta = metadata.find(
    (entry) => typeof entry?.name === "string" && entry.name.toLowerCase() === "job posting location"
  );

  if (Array.isArray(locationMeta?.value)) {
    return locationMeta.value;
  }

  if (typeof job?.location?.name === "string" && job.location.name.trim()) {
    return [job.location.name.trim()];
  }

  return [];
}

function decodeJwtClaims(jwt) {
  if (!jwt || typeof jwt !== "string") {
    return null;
  }

  const parts = jwt.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
}

function buildDiagnostics(apiResults, scopeString) {
  const scopes = new Set((scopeString || "").split(/\s+/).filter(Boolean));
  const hints = [];

  if (!scopes.has("email")) {
    hints.push("Add `email` to LINKEDIN_SCOPES to request email claims in OIDC userinfo.");
  }

  const meError = apiResults.me && !apiResults.me.ok ? apiResults.me.error?.data?.message : "";
  if (typeof meError === "string" && meError.includes("me.GET.NO_VERSION")) {
    hints.push("`/v2/me` is blocked for this app. Keep using OIDC `/v2/userinfo` unless LinkedIn approves additional products/permissions.");
  }

  const emailError =
    apiResults.emailAddress && !apiResults.emailAddress.ok
      ? apiResults.emailAddress.error?.data?.message
      : "";
  if (typeof emailError === "string" && emailError.includes("emailAddress.FINDER-members.NO_VERSION")) {
    hints.push("`/v2/emailAddress` is blocked for this app. Prefer OIDC userinfo email with `email` scope.");
  }

  return {
    accessibleEndpoints: Object.entries(apiResults)
      .filter(([, result]) => result.ok)
      .map(([key]) => key),
    blockedEndpoints: Object.entries(apiResults)
      .filter(([, result]) => !result.ok)
      .map(([key]) => key),
    hints,
  };
}

async function fetchLinkedInData(accessToken) {
  const endpoints = [
    {
      key: "userinfo",
      url: "https://api.linkedin.com/v2/userinfo",
      description: "OpenID profile data",
    },
    {
      key: "me",
      url: "https://api.linkedin.com/v2/me",
      description: "Legacy profile endpoint (may require different scopes)",
    },
    {
      key: "emailAddress",
      url: "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      description: "Primary email if permitted",
    },
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url, {
        headers: requiredHeaders(accessToken),
      });
      results[endpoint.key] = {
        ok: true,
        description: endpoint.description,
        data: response.data,
      };
    } catch (error) {
      results[endpoint.key] = {
        ok: false,
        description: endpoint.description,
        error: safeError(error),
      };
    }
  }

  return results;
}

async function fetchPublicProfile(publicUrl) {
  if (!publicUrl) {
    return {
      ok: false,
      error: { message: "LINKEDIN_PUBLIC_URL is not configured." },
    };
  }

  try {
    const response = await axios.get(publicUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = response.data;
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

    return {
      ok: true,
      url: publicUrl,
      data: {
        title: titleMatch ? titleMatch[1] : null,
        description: descMatch ? descMatch[1] : null,
        image: imageMatch ? imageMatch[1] : null,
      },
    };
  } catch (error) {
    const cleaned = safeError(error);
    const authwallRedirect =
      cleaned.status === 999
        ? "LinkedIn returned authwall protection (HTTP 999). Public scraping is blocked."
        : null;

    return {
      ok: false,
      url: publicUrl,
      error: cleaned,
      note: authwallRedirect,
    };
  }
}

async function resolveMarkdownIncludes(content, baseDir, seen = new Set()) {
  const includeRegex = /\{%\s*include\s+(.+?)\s*%\}/g;
  const matches = [...content.matchAll(includeRegex)];

  let resolved = content;

  for (const match of matches) {
    const includeTarget = String(match[1] || "").trim().replace(/^['"]|['"]$/g, "");
    const includePath = path.resolve(baseDir, includeTarget);
    const normalizedPath = path.normalize(includePath);

    if (seen.has(normalizedPath)) {
      throw new Error(`Circular include detected: ${includeTarget}`);
    }

    const includeRaw = await fs.readFile(normalizedPath, "utf8");
    const includeResolved = await resolveMarkdownIncludes(
      includeRaw,
      path.dirname(normalizedPath),
      new Set([...seen, normalizedPath])
    );

    resolved = resolved.replace(match[0], includeResolved);
  }

  return resolved;
}

async function getCompiledCvMarkdown() {
  const cvPath = path.join(__dirname, "data", "linkedin_data", "cv.md");
  const cvDir = path.dirname(cvPath);
  const rawContent = await fs.readFile(cvPath, "utf8");
  return resolveMarkdownIncludes(rawContent, cvDir);
}

function sanitizePdfText(value) {
  // Built-in PDF fonts cannot render emoji reliably, so strip them to avoid mojibake.
  return String(value || "")
    .replace(/👋/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .trimEnd();
}

function extractInlineSegments(token) {
  const children = Array.isArray(token?.children) ? token.children : [];
  const segments = [];
  let activeLink = null;

  for (const child of children) {
    if (child.type === "link_open") {
      activeLink = child.attrGet("href") || null;
      continue;
    }

    if (child.type === "link_close") {
      activeLink = null;
      continue;
    }

    if (child.type === "softbreak" || child.type === "hardbreak") {
      segments.push({ text: "\n", link: null });
      continue;
    }

    if (child.type === "text" || child.type === "code_inline") {
      segments.push({ text: child.content, link: activeLink });
    }
  }

  const merged = [];
  for (const segment of segments) {
    const previous = merged[merged.length - 1];
    if (previous && previous.link === segment.link) {
      previous.text += segment.text;
    } else {
      merged.push({ ...segment });
    }
  }

  return merged
    .map((segment) => ({
      text: sanitizePdfText(segment.text),
      link: segment.link,
    }))
    .filter((segment) => segment.text.length > 0);
}

function writeSegments(doc, segments, options = {}) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return;
  }

  const defaultColor = options.color || "#1f2937";
  const printableSegments = segments.filter((segment) => segment.text.trim().length > 0);
  if (printableSegments.length === 0) {
    return;
  }

  printableSegments.forEach((segment, index) => {
    const isLast = index === printableSegments.length - 1;
    const textOptions = {
      indent: options.indent || 0,
      paragraphGap: isLast ? options.paragraphGap || 0 : 0,
      continued: !isLast,
    };

    if (segment.link) {
      textOptions.link = segment.link;
      textOptions.underline = true;
      doc.fillColor("#0b63ce");
    } else {
      doc.fillColor(defaultColor);
    }

    doc.text(segment.text, textOptions);
  });

  doc.fillColor(defaultColor);
}

async function buildCvPdfBuffer(markdownContent) {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
  const tokens = md.parse(markdownContent || "", {});
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 54, right: 54, bottom: 54, left: 54 },
    info: {
      Title: "Diogo de Bastos CV",
      Author: "Diogo de Bastos",
      Subject: "Curriculum Vitae",
    },
  });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const bufferPromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const headingSizes = { h1: 24, h2: 19, h3: 16, h4: 14, h5: 13, h6: 12 };
  const listStack = [];
  let pendingListPrefix = "";

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token.type === "heading_open") {
      const next = tokens[i + 1];
      const segments = extractInlineSegments(next);
      const size = headingSizes[token.tag] || 12;
      doc.moveDown(0.4);
      doc.font("Helvetica-Bold").fontSize(size).fillColor("#111827");
      writeSegments(doc, segments, {
        color: "#111827",
        paragraphGap: size >= 19 ? 8 : 5,
      });
      doc.font("Helvetica").fontSize(11).fillColor("#111827");
      continue;
    }

    if (token.type === "paragraph_open") {
      const next = tokens[i + 1];
      const segments = extractInlineSegments(next);
      const combinedText = segments.map((segment) => segment.text).join("").trim();

      if (!combinedText) {
        continue;
      }

      const indent = listStack.length > 0 ? (listStack.length - 1) * 14 : 0;
      const paragraphSegments = pendingListPrefix
        ? [{ text: pendingListPrefix, link: null }, ...segments]
        : segments;

      doc.font("Helvetica").fontSize(11).fillColor("#1f2937");
      writeSegments(doc, paragraphSegments, {
        color: "#1f2937",
        indent,
        paragraphGap: 5,
      });
      pendingListPrefix = "";
      continue;
    }

    if (token.type === "bullet_list_open") {
      listStack.push({ type: "bullet", index: 0 });
      continue;
    }

    if (token.type === "ordered_list_open") {
      const startAttr = Number(token.attrGet("start") || 1);
      listStack.push({ type: "ordered", index: Number.isFinite(startAttr) ? startAttr - 1 : 0 });
      continue;
    }

    if (token.type === "list_item_open") {
      const currentList = listStack[listStack.length - 1];
      if (currentList) {
        if (currentList.type === "ordered") {
          currentList.index += 1;
          pendingListPrefix = `${currentList.index}. `;
        } else {
          pendingListPrefix = "• ";
        }
      }
      continue;
    }

    if (token.type === "bullet_list_close" || token.type === "ordered_list_close") {
      listStack.pop();
      pendingListPrefix = "";
      doc.moveDown(0.2);
      continue;
    }

    if (token.type === "fence" || token.type === "code_block") {
      if (token.content?.trim()) {
        doc
          .font("Courier")
          .fontSize(10)
          .fillColor("#111827")
          .text(token.content, { indent: 10, paragraphGap: 6 });
        doc.font("Helvetica").fontSize(11).fillColor("#1f2937");
      }
    }
  }

  doc.end();
  return bufferPromise;
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/cv", async (_req, res) => {
  try {
    const content = await getCompiledCvMarkdown();

    res.json({ ok: true, content });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to read CV file.",
      details: error.message,
    });
  }
});

app.get("/api/cv/pdf", async (_req, res) => {
  try {
    const markdownContent = await getCompiledCvMarkdown();
    const pdfBuffer = await buildCvPdfBuffer(markdownContent);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="diogo_de_bastos_cv.pdf"');
    res.setHeader("Content-Length", String(pdfBuffer.length));
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to compile CV PDF.",
      details: error.message,
    });
  }
});

app.get("/api/linkedin/metrics", async (_req, res) => {
  try {
    const rows = await readLinkedInMetricsRows();
    const latest = rows[rows.length - 1] ?? null;
    if (!latest) {
      return res.status(404).json({ ok: false, error: "No metrics available." });
    }
    res.json({
      ok: true,
      metrics: {
        profileViews: latest.profileViews,
        connections: latest.connections,
        posts: latest.posts,
        messagesSent: latest.messagesSent,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to load LinkedIn metrics.",
      details: error.message,
    });
  }
});

app.get("/api/linkedin/metrics-history", async (_req, res) => {
  try {
    const rows = await readLinkedInMetricsRows();
    res.json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      count: rows.length,
      rows,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to load local LinkedIn metrics database.",
      details: error.message,
    });
  }
});

app.post("/api/linkedin/metrics-history", async (req, res) => {
  const parsed = parseMetricsPayload(req.body);

  if (!parsed.ok) {
    return res.status(400).json({
      ok: false,
      error: parsed.error,
    });
  }

  const row = parsed.value;

  try {
    await initializeLinkedInMetricsDb();
    await dbRun(
      linkedInMetricsDb,
      `INSERT INTO linkedin_metrics (date, profile_views, connections, posts, messages_sent)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         profile_views = excluded.profile_views,
         connections = excluded.connections,
         posts = excluded.posts,
         messages_sent = excluded.messages_sent`,
      [row.date, row.profileViews, row.connections, row.posts, row.messagesSent]
    );

    const rows = await readLinkedInMetricsRows();
    return res.json({
      ok: true,
      saved: row,
      count: rows.length,
      rows,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Failed to save LinkedIn metrics row.",
      details: error.message,
    });
  }
});

app.get("/api/linkedin/post-capability", (_req, res) => {
  res.json({
    ok: true,
    authenticated: Boolean(currentLinkedInAuth?.accessToken),
    actor: currentLinkedInAuth?.actor || null,
    scopes: config.scopes,
  });
});

app.get("/api/linkedin/photo", async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string" || !isAllowedImageHost(url)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid or non-LinkedIn image URL.",
    });
  }

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/*",
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(Buffer.from(response.data));
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "Failed to load LinkedIn image.",
      detail: safeError(error),
    });
  }
});

app.get("/auth/linkedin", (_req, res) => {
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");

  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", config.redirectUri);
  authUrl.searchParams.set("scope", config.scopes);
  authUrl.searchParams.set("state", state);

  sessions.set(state, { createdAt: Date.now() });
  res.redirect(authUrl.toString());
});

app.get("/auth/linkedin/callback", async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;

  if (error) {
    return res.redirect(
      `/?oauthError=${encodeURIComponent(`${error}: ${errorDescription || "Unknown error"}`)}`
    );
  }

  if (!state || !sessions.has(state)) {
    return res.redirect("/?oauthError=Invalid%20or%20expired%20state");
  }

  sessions.delete(state);

  if (!code) {
    return res.redirect("/?oauthError=No%20authorization%20code%20received");
  }

  try {
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", code);
    params.set("redirect_uri", config.redirectUri);
    params.set("client_id", config.clientId);
    params.set("client_secret", config.clientSecret);

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const idTokenClaims = decodeJwtClaims(tokenResponse.data.id_token);
    const dataResult = await fetchLinkedInData(accessToken);
    const publicProfileResult = await fetchPublicProfile(config.publicUrl);
    const diagnostics = buildDiagnostics(dataResult, config.scopes);

    const actorSub = dataResult.userinfo?.ok ? dataResult.userinfo?.data?.sub : null;
    const actorUrn = actorSub ? `urn:li:person:${actorSub}` : null;

    currentLinkedInAuth = {
      accessToken,
      actor: {
        sub: actorSub,
        urn: actorUrn,
        name: dataResult.userinfo?.data?.name || null,
      },
      authorizedAt: new Date().toISOString(),
    };

    const payload = {
      fetchedAt: new Date().toISOString(),
      tokenMeta: {
        expiresIn: tokenResponse.data.expires_in,
        scopeRequested: config.scopes,
        hasIdToken: Boolean(tokenResponse.data.id_token),
      },
      idTokenClaims,
      apiResults: dataResult,
      publicProfile: publicProfileResult,
      diagnostics,
      posting: {
        authenticated: true,
        actor: currentLinkedInAuth.actor,
      },
    };

    // Escape < to avoid accidentally breaking out of the script tag.
    const serializedPayload = JSON.stringify(payload).replace(/</g, "\\u003c");

    res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LinkedIn Data Loaded</title>
    <style>
      body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #10141a; color: #e6edf3; margin: 0; padding: 2rem; }
      .card { max-width: 1100px; margin: 0 auto; background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 1rem; }
      pre { white-space: pre-wrap; word-break: break-word; background: #0d1117; border-radius: 10px; padding: 1rem; overflow: auto; }
      a { color: #58a6ff; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>LinkedIn Data Loaded</h1>
      <p>Data has been fetched from the available endpoints.</p>
      <p><a href="/">Return to dashboard</a></p>
      <script>
        localStorage.setItem("linkedinData", JSON.stringify(${serializedPayload}));
      </script>
    </div>
  </body>
</html>`);
  } catch (tokenError) {
    const detail = encodeURIComponent(
      JSON.stringify(safeError(tokenError), null, 2)
    );
    res.redirect(`/?oauthError=${detail}`);
  }
});

app.post("/api/linkedin/post", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!currentLinkedInAuth?.accessToken) {
    return res.status(401).json({
      ok: false,
      error: "Not authenticated. Use /auth/linkedin first.",
    });
  }

  if (!currentLinkedInAuth?.actor?.urn) {
    return res.status(400).json({
      ok: false,
      error: "Missing LinkedIn actor identity. Re-authenticate and try again.",
    });
  }

  if (!text) {
    return res.status(400).json({
      ok: false,
      error: "Post text is required.",
    });
  }

  if (text.length > 3000) {
    return res.status(400).json({
      ok: false,
      error: "Post text is too long (max 3000 chars).",
    });
  }

  const payload = {
    author: currentLinkedInAuth.actor.urn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text,
        },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  try {
    const response = await axios.post("https://api.linkedin.com/v2/ugcPosts", payload, {
      headers: {
        Authorization: `Bearer ${currentLinkedInAuth.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    return res.json({
      ok: true,
      actor: currentLinkedInAuth.actor,
      postedAt: new Date().toISOString(),
      linkedin: {
        status: response.status,
        headers: {
          "x-restli-id": response.headers["x-restli-id"] || null,
        },
        data: response.data || null,
      },
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "LinkedIn post publish failed.",
      detail: safeError(error),
    });
  }
});

app.get("/api/linkedin/preview", async (_req, res) => {
  const publicProfileResult = await fetchPublicProfile(config.publicUrl);
  const scopeHints = [];

  if (!(config.scopes || "").split(/\s+/).includes("email")) {
    scopeHints.push("Add `email` to LINKEDIN_SCOPES for richer OIDC userinfo claims.");
  }

  res.json({
    fetchedAt: new Date().toISOString(),
    scopeRequested: config.scopes,
    publicProfile: publicProfileResult,
    hints: scopeHints,
    note: "Full private profile data requires OAuth login via /auth/linkedin.",
  });
});

app.get("/api/cloudflare/open-positions", async (_req, res) => {
  const locationFilter = "lisbon, portugal";
  const titleFilters = ["ai", "data"];
  const titleRegex = /\b(ai|data)\b/i;

  try {
    const response = await axios.get(
      "https://boards-api.greenhouse.io/v1/boards/cloudflare/departments/?render_as=tree",
      {
        timeout: 15000,
      }
    );

    const departments = Array.isArray(response.data?.departments) ? response.data.departments : [];
    const allJobs = flattenDepartments(departments);

    const normalized = allJobs.map((job) => {
      const postingLocations = getJobPostingLocations(job);
      const matchedLocation = postingLocations.find(
        (location) => typeof location === "string" && location.toLowerCase().includes(locationFilter)
      );

      return {
        id: job?.id || null,
        title: job?.title || "Untitled role",
        url: job?.absolute_url || null,
        postingLocations,
        location: matchedLocation || postingLocations[0] || "Unknown",
        firstPublished: job?.first_published || null,
      };
    });

    const filtered = normalized
      .filter(
        (job) =>
          job.postingLocations.some((location) =>
            typeof location === "string" && location.toLowerCase().includes(locationFilter)
          ) &&
          titleRegex.test(job.title)
      )
      .sort((a, b) => {
        const left = a.firstPublished ? new Date(a.firstPublished).getTime() : 0;
        const right = b.firstPublished ? new Date(b.firstPublished).getTime() : 0;
        return right - left;
      });

    res.json({
      ok: true,
      source: "https://www.cloudflare.com/en-gb/careers/jobs/?location=Lisbon%2C+Portugal&title=ai",
      filters: {
        location: "Lisbon, Portugal",
        title: titleFilters,
      },
      fetchedAt: new Date().toISOString(),
      totalFetched: allJobs.length,
      totalMatching: filtered.length,
      jobs: filtered,
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: "Failed to fetch Cloudflare jobs feed.",
      detail: safeError(error),
    });
  }
});

async function startServer() {
  try {
    await initializeLinkedInMetricsDb();
    app.listen(port, () => {
      console.log(`LinkedIn inspector running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize LinkedIn metrics database:", error.message);
    process.exit(1);
  }
}

startServer();
