import MarkdownIt from "markdown-it";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import cvMd from "../data/cv_data/cv.md";
import summaryMd from "../data/cv_data/summary.md";
import workExperienceMd from "../data/cv_data/work_experience.md";
import researchMd from "../data/cv_data/research.md";
import educationMd from "../data/cv_data/education.md";
import publicationsMd from "../data/cv_data/publications.md";
import skillsMd from "../data/cv_data/skills.md";
import conferencesMd from "../data/cv_data/conferences.md";

const defaultTwitterMetricsRows = [
  { date: "2026-02-24", following: 418, followers: 502, posts: 89 },
  { date: "2026-03-03", following: 429, followers: 534, posts: 94 },
  { date: "2026-03-10", following: 441, followers: 563, posts: 99 },
];

const cvFiles = {
  "cv.md": cvMd,
  "summary.md": summaryMd,
  "work_experience.md": workExperienceMd,
  "research.md": researchMd,
  "education.md": educationMd,
  "publications.md": publicationsMd,
  "skills.md": skillsMd,
  "conferences.md": conferencesMd,
};

function getDb(env) {
  return env.DB || null;
}

function getTwitterPublicUrl(env) {
  return env.TWITTER_PUBLIC_URL || "https://x.com/jilvaa198175";
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

async function safeErrorFromResponse(response) {
  let data = null;
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (_error) {
    data = null;
  }

  if (typeof data === "string" && data.length > 1200) {
    data = `${data.slice(0, 1200)}\n...[truncated]`;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    data,
  };
}

function resolveCvIncludes(content, seen = new Set()) {
  const includeRegex = /\{%\s*include\s+(.+?)\s*%\}/g;
  const matches = [...content.matchAll(includeRegex)];

  let resolved = content;

  for (const match of matches) {
    const includeTarget = String(match[1] || "").trim().replace(/^['"]|['"]$/g, "");
    if (seen.has(includeTarget)) {
      throw new Error(`Circular include detected: ${includeTarget}`);
    }

    const includeRaw = cvFiles[includeTarget];
    if (typeof includeRaw !== "string") {
      throw new Error(`Missing include file: ${includeTarget}`);
    }

    const includeResolved = resolveCvIncludes(includeRaw, new Set([...seen, includeTarget]));
    resolved = resolved.replace(match[0], includeResolved);
  }

  return resolved;
}

function sanitizePdfText(value) {
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

  const bytesPromise = new Promise((resolve, reject) => {
    doc.on("end", () => {
      const arrays = chunks.map((chunk) => {
        if (chunk instanceof Uint8Array) {
          return chunk;
        }
        if (chunk instanceof ArrayBuffer) {
          return new Uint8Array(chunk);
        }
        return new Uint8Array(chunk);
      });

      const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const arr of arrays) {
        merged.set(arr, offset);
        offset += arr.length;
      }
      resolve(merged);
    });
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
  return bytesPromise;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function parseMetricsPayload(payload) {
  const date = typeof payload?.date === "string" ? payload.date.trim() : "";
  const following = Number(payload?.following);
  const followers = Number(payload?.followers);
  const posts = Number(payload?.posts ?? 0);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    return { ok: false, error: "`date` must be in YYYY-MM-DD format." };
  }

  const values = { following, followers, posts };
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isInteger(value) || value < 0) {
      return { ok: false, error: `\`${key}\` must be a non-negative integer.` };
    }
  }

  return { ok: true, value: { date, following, followers, posts } };
}

async function initializeTwitterMetricsDb(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS twitter_metrics (
        date TEXT PRIMARY KEY,
        following INTEGER NOT NULL,
        followers INTEGER NOT NULL,
        posts INTEGER NOT NULL DEFAULT 0
      )`
    )
    .run();

  const tableInfo = await db.prepare("PRAGMA table_info(twitter_metrics)").all();
  const columns = Array.isArray(tableInfo?.results) ? tableInfo.results : [];
  const hasPostsColumn = columns.some((column) => column?.name === "posts");

  if (!hasPostsColumn) {
    await db
      .prepare("ALTER TABLE twitter_metrics ADD COLUMN posts INTEGER NOT NULL DEFAULT 0")
      .run();
  }

  const countResult = await db.prepare("SELECT COUNT(*) AS count FROM twitter_metrics").first();
  const count = Number(countResult?.count || 0);

  if (count === 0) {
    const statement = db.prepare(
      `INSERT INTO twitter_metrics (date, following, followers, posts)
       VALUES (?1, ?2, ?3, ?4)`
    );

    const batchStatements = defaultTwitterMetricsRows.map((row) =>
      statement.bind(row.date, row.following, row.followers, row.posts)
    );

    await db.batch(batchStatements);
  }
}

async function readTwitterMetricsRows(db) {
  await initializeTwitterMetricsDb(db);

  const result = await db
    .prepare(
      `SELECT date, following, followers, posts
       FROM twitter_metrics
       ORDER BY date ASC`
    )
    .all();

  const rows = Array.isArray(result?.results) ? result.results : [];
  return rows.map((row) => ({
    date: row.date,
    following: row.following,
    followers: row.followers,
    posts: Number(row.posts ?? 0),
  }));
}

async function upsertTwitterMetricsRow(db, row) {
  await initializeTwitterMetricsDb(db);

  await db
    .prepare(
      `INSERT INTO twitter_metrics (date, following, followers, posts)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(date) DO UPDATE SET
         following = excluded.following,
         followers = excluded.followers,
         posts = excluded.posts`
    )
    .bind(row.date, row.following, row.followers, row.posts)
    .run();
}

async function fetchPublicProfile(publicUrl) {
  if (!publicUrl) {
    return {
      ok: false,
      error: { message: "TWITTER_PUBLIC_URL is not configured." },
    };
  }

  try {
    const response = await fetch(publicUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      let data = null;
      try {
        data = await response.text();
      } catch (_error) {
        data = null;
      }

      return {
        ok: false,
        url: publicUrl,
        error: {
          status: response.status,
          statusText: response.statusText,
          data,
        },
      };
    }

    const html = await response.text();
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
    return {
      ok: false,
      url: publicUrl,
      error: { message: error.message },
    };
  }
}

async function handleApi(request, env, pathname) {
  const db = getDb(env);
  if (!db) {
    return json({ ok: false, error: "D1 binding is missing. Expected `DB` or `twitter_metrics`." }, 500);
  }

  if (pathname === "/health" && request.method === "GET") {
    return json({ ok: true });
  }

  if (pathname === "/api/twitter/profile" && request.method === "GET") {
    return json({
      ok: true,
      handle: "@jilvaa198175",
      url: getTwitterPublicUrl(env),
    });
  }

  if (pathname === "/api/twitter/metrics" && request.method === "GET") {
    try {
      const rows = await readTwitterMetricsRows(db);
      const latest = rows[rows.length - 1] ?? null;

      if (!latest) {
        return json({ ok: false, error: "No metrics available." }, 404);
      }

      return json({
        ok: true,
        metrics: {
          following: latest.following,
          followers: latest.followers,
          posts: latest.posts,
        },
      });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to load X metrics.",
          details: error.message,
        },
        500
      );
    }
  }

  if (pathname === "/api/twitter/metrics-history" && request.method === "GET") {
    try {
      const rows = await readTwitterMetricsRows(db);
      return json({ ok: true, fetchedAt: new Date().toISOString(), count: rows.length, rows });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to load X metrics database.",
          details: error.message,
        },
        500
      );
    }
  }

  if (pathname === "/api/twitter/metrics-history" && request.method === "POST") {
    let payload;

    try {
      payload = await request.json();
    } catch (_error) {
      return json({ ok: false, error: "Request body must be valid JSON." }, 400);
    }

    const parsed = parseMetricsPayload(payload);
    if (!parsed.ok) {
      return json({ ok: false, error: parsed.error }, 400);
    }

    try {
      await upsertTwitterMetricsRow(db, parsed.value);
      const rows = await readTwitterMetricsRows(db);
      return json({ ok: true, saved: parsed.value, count: rows.length, rows, fetchedAt: new Date().toISOString() });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to save X metrics row.",
          details: error.message,
        },
        500
      );
    }
  }

  if (pathname === "/api/twitter/preview" && request.method === "GET") {
    const publicProfile = await fetchPublicProfile(getTwitterPublicUrl(env));
    return json({
      fetchedAt: new Date().toISOString(),
      publicProfile,
      note: "Public preview from the configured X profile URL.",
    });
  }

  if (pathname === "/api/cv" && request.method === "GET") {
    try {
      const content = resolveCvIncludes(cvFiles["cv.md"]);
      return json({ ok: true, content });
    } catch (error) {
      return json({ ok: false, error: "Failed to read CV file.", details: error.message }, 500);
    }
  }

  if (pathname === "/api/cv/pdf" && request.method === "GET") {
    try {
      const content = resolveCvIncludes(cvFiles["cv.md"]);
      const pdfBytes = await buildCvPdfBuffer(content);
      return new Response(pdfBytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="cv.pdf"',
          "Content-Length": String(pdfBytes.length),
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      return json({ ok: false, error: "Failed to generate CV PDF.", details: error.message }, 500);
    }
  }

  if (pathname === "/api/cloudflare/open-positions" && request.method === "GET") {
    const locationFilter = "lisbon, portugal";
    const titleFilters = ["ai", "data"];
    const titleRegex = /\b(ai|data)\b/i;

    try {
      const response = await fetch(
        "https://boards-api.greenhouse.io/v1/boards/cloudflare/departments/?render_as=tree"
      );

      if (!response.ok) {
        return json(
          {
            ok: false,
            error: "Failed to fetch Cloudflare jobs feed.",
            detail: {
              status: response.status,
              statusText: response.statusText,
            },
          },
          502
        );
      }

      const payload = await response.json();
      const departments = Array.isArray(payload?.departments) ? payload.departments : [];
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
            job.postingLocations.some(
              (location) => typeof location === "string" && location.toLowerCase().includes(locationFilter)
            ) &&
            titleRegex.test(job.title)
        )
        .sort((a, b) => {
          const left = a.firstPublished ? new Date(a.firstPublished).getTime() : 0;
          const right = b.firstPublished ? new Date(b.firstPublished).getTime() : 0;
          return right - left;
        });

      return json({
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
      return json(
        {
          ok: false,
          error: "Failed to fetch Cloudflare jobs feed.",
          detail: { message: error.message },
        },
        502
      );
    }
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
    return json({ ok: false, error: "Endpoint not implemented." }, 404);
  }

  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const apiResponse = await handleApi(request, env, url.pathname);
    if (apiResponse) {
      return apiResponse;
    }

    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};
