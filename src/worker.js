import MarkdownIt from "markdown-it";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

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

const cvFiles = {
  "cv.md": `Lisbon, Portugal | [email](mailto:diogodebastos18@gmail.com) | [LinkedIn](https://www.linkedin.com/in/diogodebastos) | [GitHub](https://github.com/diogodebastos) | [Google Scholar](https://scholar.google.com/citations?user=6f2lV5YAAAAJ&hl=en)

👉 [try talking with my CV](https://diogodebastos.vercel.app/)

{% include summary.md %}
{% include work_experience.md %}
{% include research.md %}
{% include education.md %}
{% include publications.md %}
{% include skills.md %}
{% include conferences.md %}`,
  "summary.md": `## Summary 📜
Senior data scientist (5+ years) with a Ph.D. in Physics and a track record of deploying machine learning solutions that operate on large-scale, high-velocity data. I pair rigorous statistical modelling with production engineering, working closely with product, engineering, and risk stakeholders to deliver resilient analytics. Recent focus spans time-series forecasting, optimisation, and LLM-enabled automation, with experience maintaining distributed compute environments within global collaborations.`,
  "work_experience.md": `## Work experience 💻
### Stealth
Lisbon, 2022/09 - current | Senior data scientist, AI/ML & quantitative analyst

- Reduced short-term price forecast error from 15% to 5% by combining LSTM, CNN, and Temporal Fusion Transformer models implemented in Python with PyTorch and SQL-backed data pipelines.
- Designed portfolio optimisation and algorithmic trading frameworks that improved gross margin by 30%, integrating ML outputs into decision workflows for trading and risk teams.
- Migrated analytics from MATLAB and R to a Python ecosystem, formalising code efficiency, scalability, and reproducibility for globally distributed stakeholders.
- Deployed predictive services and analytical applications on Databricks Services to meet availability, monitoring, and scalability requirements.
- Built LLM-powered assistants using Azure OpenAI, Llama2, Retrieval Augmented Generation, Weaviate, and LangChain to automate report generation and data interpretation. PoCs for report automation and research summarisation. Cut manual review time by >40%.
- Mentored colleagues on MLOps practices, supervised a master’s thesis on deep learning for price forecasting, and acted as product lead for ML, optimisation, and trading initiatives.

### Stealth Startup
Coimbra, 2016/01 - 2017/06 | Business and hardware development

- Co-founded a cold-chain IoT startup, managing product strategy, client acquisition, and data-driven validation of market needs.
- Built sensor-to-cloud monitoring across 24 devices, integrating wireless communications (2.1 GHz/433 MHz), embedded prototyping (Arduino, Raspberry Pi), and analytics (SQLite, MATLAB).
- Designed low-power PCBs with Altium and coordinated with engineers and customers to deliver reliable hardware deployments.

### Stealth
Coimbra, 2014/09 - 2016/02 | CEO

- Expanded the non-profit tech organisation from 10 to 30 members by redesigning recruitment and leadership development.
- Directed rebranding, launched a summer academy focused on programming and hardware, and created networking events linking academia with startups.
- Oversaw hackathons and community programs, honing stakeholder communication and execution under tight timelines.`,
  "education.md": `## Education 🎓

- Doctorate of Philosophy in Physics, Instituto Superior Técnico Universidade de Lisboa - Thesis: "Search for top squarks in the four-body decay mode with single lepton final states in proton-proton collisions at the Large Hadron Collider (Pass with Distinction)
- Master’s in Physics Engineering, University of Coimbra - Thesis: “Automated monitoring and diagnosis of cold chains” (18/20)`,
  "publications.md": `## Publications 📚

- 2023/06/12 - The CMS Collaboration,
“Search for top squarks in the four-body
decay mode with single lepton final states in proton-proton collisions at the Large Hadron Collider” [JHEP06(2023)060](https://doi.org/10.1007/JHEP06(2023)060)

- Bastos, D.
“Using Variational Quantum Algorithms and Quantum
Generative Adversarial Networks for Supersymmetry in High‑Energy Physics”
(internal paper)

- The CMS Collaboration,
“Experimental characterization of the BTL Front-end
Board based on TOFHIR1” (internal note)

- Speaker: “Predicting Spain power price with Deep Learning,” 11th Annual Electricity Price Forecasting and Modelling Forum, 2024.

- Speaker: “Searches for top squarks in compressed scenarios with the CMS experiment,” SUSY Conference, 2022.`,
  "skills.md": `## Skills 💫

- Programming: Python, C++, R, MATLAB, Bash
- Data Analysis & Visualisation: Pandas, NumPy, Matplotlib, Seaborn
- Machine Learning: PyTorch, TensorFlow, scikit-learn, Keras, neural networks, LSTM, TFT, CNN, BDT, genetic programming
- NLP & GenAI: Azure OpenAI, Llama2, LangChain, Retrieval Augmented Generation, speech-to-text, translation, text-to-speech
- Databases & Platforms: SQL, MySQL, Oracle, Azure, Databricks
- Statistical & Optimisation Techniques: Quadratic programming, risk control, Bayesian analysis
- Leadership & Communication: Portuguese and English fluency, mentorship, outreach, conference speaking`,
  "conferences.md": `## Conferences 🗣

- 2024/09/13 - Speaker: “Predicting Spain power price with Deep Learning”, 11th Annual Electricity Price Forecasting And Modelling Forum
- 2022/06/29 - Speaker on behalf of the CMS collaboration: “Searches for top squarks in compressed scenarios with the CMS experiment”, The XXIX International Conference on Supersymmetry and Unification of Fundamental Interactions, Ioannina, Greece
- 2020/06/26 - Speaker: “High-performance timing detector for the HL-LHC Upgrade of the CMS experiment at CERN”, 6th IDPASC /LIP PhD student Workshop, remote
- 2020/03/09 - Seminar: “Presentation to the CAT”, Lisbon, Portugal
- 2020/02/15 - Speaker: “CMS: Searching for stop”, Braga, Portugal
- 2019/09/25 - Invited speaker: “Distributed Computing at the CMS Experiment: From the point of view of a physicist”, IBERGRID 2019, Santiago de Compostela, Spain
- 2019/07/01 - Speaker: “Search for the SUperSYmmetric partner of the top quark at the LHC with a multivariate approach”, 5th IDPASC /LIP PhD student Workshop, Braga, Portugal
- 2019/04/06 - Invited mentor: “IST Masterclasses”, Lisbon, Portugal
- 2019/02/11 - Invited speaker: “Particles - from the Universe to the lab”, Lisbon, Portugal
- 2017/10/26 - Organizer of [LISBON.AI](https://web.archive.org/web/20221006040617/http://lisbon.ai/), a conference dedicated to Artificial Intelligence for 150 engineers
- 2015/07/23 - Organizer of [Summer JADE Meeting](https://youtu.be/GkxUpzfNlMA), a 4-day international congress for 300+ Entrepreneurs`,
  "research.md": `## Research 🔬

### Ph.D.
2018/01 - 2023/07 | High Energy Physics and Quantum Machine Learning

- Advanced supersymmetry searches within the CMS experiment by building C++ frameworks, boosted decision trees (ROOT TMVA), and TensorFlow neural networks to classify proton-proton collision data.
- Performed Bayesian statistical analyses to set stringent limits on top squark pair production cross sections at low masses, managing class imbalance and detector noise.
- Experimented with Variational Quantum Classifiers and Quantum GANs (Python, PennyLane, Qiskit) to accelerate Monte Carlo data augmentation.
- Tested and calibrated ASICs for the CMS Timing Detector upgrade and maintained computing operations for the CMS collaboration, ensuring data integrity across distributed resources.
- Mentored junior researchers and organised outreach events to promote STEM education.`,
};

function getDb(env) {
  return env.DB || env.linkedin_metrics || null;
}

function isAllowedImageHost(urlString) {
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();
    return host.endsWith("licdn.com") || host.endsWith("linkedin.com");
  } catch (_error) {
    return false;
  }
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

function getLinkedInPublicUrl(env) {
  return env.LINKEDIN_PUBLIC_URL || "";
}

function getLinkedInScopes(env) {
  return env.LINKEDIN_SCOPES || "openid profile";
}

function requiredHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function makeState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
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
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (_error) {
    return null;
  }
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

function buildDiagnostics(apiResults, scopeString) {
  const scopes = new Set((scopeString || "").split(/\s+/).filter(Boolean));
  const hints = [];

  if (!scopes.has("email")) {
    hints.push("Add `email` to LINKEDIN_SCOPES to request email claims in OIDC userinfo.");
  }

  const meError = apiResults.me && !apiResults.me.ok ? apiResults.me.error?.data?.message : "";
  if (typeof meError === "string" && meError.includes("me.GET.NO_VERSION")) {
    hints.push(
      "`/v2/me` is blocked for this app. Keep using OIDC `/v2/userinfo` unless LinkedIn approves additional products/permissions."
    );
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
      const response = await fetch(endpoint.url, {
        headers: requiredHeaders(accessToken),
      });

      if (!response.ok) {
        results[endpoint.key] = {
          ok: false,
          description: endpoint.description,
          error: await safeErrorFromResponse(response),
        };
        continue;
      }

      const data = await response.json();
      results[endpoint.key] = {
        ok: true,
        description: endpoint.description,
        data,
      };
    } catch (error) {
      results[endpoint.key] = {
        ok: false,
        description: endpoint.description,
        error: { message: error.message },
      };
    }
  }

  return results;
}

async function initializeLinkedInAuthDb(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS oauth_states (
        state TEXT PRIMARY KEY,
        created_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS linkedin_auth (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        access_token TEXT NOT NULL,
        actor_sub TEXT,
        actor_urn TEXT,
        actor_name TEXT,
        authorized_at TEXT NOT NULL
      )`
    )
    .run();
}

async function storeOAuthState(db, state) {
  await initializeLinkedInAuthDb(db);
  await db
    .prepare(`INSERT OR REPLACE INTO oauth_states (state, created_at) VALUES (?1, ?2)`)
    .bind(state, new Date().toISOString())
    .run();
}

async function consumeOAuthState(db, state) {
  await initializeLinkedInAuthDb(db);
  const row = await db.prepare(`SELECT state FROM oauth_states WHERE state = ?1`).bind(state).first();

  if (!row) {
    return false;
  }

  await db.prepare(`DELETE FROM oauth_states WHERE state = ?1`).bind(state).run();
  return true;
}

async function saveLinkedInAuth(db, auth) {
  await initializeLinkedInAuthDb(db);
  await db
    .prepare(
      `INSERT INTO linkedin_auth (id, access_token, actor_sub, actor_urn, actor_name, authorized_at)
       VALUES (1, ?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET
         access_token = excluded.access_token,
         actor_sub = excluded.actor_sub,
         actor_urn = excluded.actor_urn,
         actor_name = excluded.actor_name,
         authorized_at = excluded.authorized_at`
    )
    .bind(auth.accessToken, auth.actor.sub, auth.actor.urn, auth.actor.name, auth.authorizedAt)
    .run();
}

async function getLinkedInAuth(db) {
  await initializeLinkedInAuthDb(db);
  const row = await db
    .prepare(
      `SELECT access_token, actor_sub, actor_urn, actor_name, authorized_at
       FROM linkedin_auth
       WHERE id = 1`
    )
    .first();

  if (!row) {
    return null;
  }

  return {
    accessToken: row.access_token,
    actor: {
      sub: row.actor_sub,
      urn: row.actor_urn,
      name: row.actor_name,
    },
    authorizedAt: row.authorized_at,
  };
}

async function fetchPublicProfile(publicUrl) {
  if (!publicUrl) {
    return {
      ok: false,
      error: { message: "LINKEDIN_PUBLIC_URL is not configured." },
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
        note:
          response.status === 999
            ? "LinkedIn returned authwall protection (HTTP 999). Public scraping is blocked."
            : null,
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

async function initializeLinkedInMetricsDb(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS linkedin_metrics (
        date TEXT PRIMARY KEY,
        profile_views INTEGER NOT NULL,
        connections INTEGER NOT NULL,
        posts INTEGER NOT NULL,
        messages_sent INTEGER NOT NULL
      )`
    )
    .run();

  const countResult = await db.prepare("SELECT COUNT(*) AS count FROM linkedin_metrics").first();
  const count = Number(countResult?.count || 0);

  if (count === 0) {
    const statement = db.prepare(
      `INSERT INTO linkedin_metrics (date, profile_views, connections, posts, messages_sent)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    );

    const batchStatements = defaultLinkedInMetricsRows.map((row) =>
      statement.bind(row.date, row.profileViews, row.connections, row.posts, row.messagesSent)
    );

    await db.batch(batchStatements);
  }
}

async function readLinkedInMetricsRows(db) {
  await initializeLinkedInMetricsDb(db);

  const result = await db
    .prepare(
      `SELECT date, profile_views, connections, posts, messages_sent
       FROM linkedin_metrics
       ORDER BY date ASC`
    )
    .all();

  const rows = Array.isArray(result?.results) ? result.results : [];

  return rows.map((row) => ({
    date: row.date,
    profileViews: row.profile_views,
    connections: row.connections,
    posts: row.posts,
    messagesSent: row.messages_sent,
  }));
}

async function upsertLinkedInMetricsRow(db, row) {
  await initializeLinkedInMetricsDb(db);

  await db
    .prepare(
      `INSERT INTO linkedin_metrics (date, profile_views, connections, posts, messages_sent)
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(date) DO UPDATE SET
         profile_views = excluded.profile_views,
         connections = excluded.connections,
         posts = excluded.posts,
         messages_sent = excluded.messages_sent`
    )
    .bind(row.date, row.profileViews, row.connections, row.posts, row.messagesSent)
    .run();
}

async function handleApi(request, env, pathname) {
  const db = getDb(env);
  if (!db) {
    return json({ ok: false, error: "D1 binding is missing. Expected `DB` or `linkedin_metrics`." }, 500);
  }

  if (pathname === "/health" && request.method === "GET") {
    return json({ ok: true });
  }

  if (pathname === "/api/linkedin/metrics" && request.method === "GET") {
    try {
      const rows = await readLinkedInMetricsRows(db);
      const latest = rows[rows.length - 1] ?? null;

      if (!latest) {
        return json({ ok: false, error: "No metrics available." }, 404);
      }

      return json({
        ok: true,
        metrics: {
          profileViews: latest.profileViews,
          connections: latest.connections,
          posts: latest.posts,
          messagesSent: latest.messagesSent,
        },
      });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to load LinkedIn metrics.",
          details: error.message,
        },
        500
      );
    }
  }

  if (pathname === "/api/linkedin/metrics-history" && request.method === "GET") {
    try {
      const rows = await readLinkedInMetricsRows(db);

      return json({
        ok: true,
        fetchedAt: new Date().toISOString(),
        count: rows.length,
        rows,
      });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to load LinkedIn metrics database.",
          details: error.message,
        },
        500
      );
    }
  }

  if (pathname === "/api/linkedin/metrics-history" && request.method === "POST") {
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
      await upsertLinkedInMetricsRow(db, parsed.value);
      const rows = await readLinkedInMetricsRows(db);

      return json({
        ok: true,
        saved: parsed.value,
        count: rows.length,
        rows,
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to save LinkedIn metrics row.",
          details: error.message,
        },
        500
      );
    }
  }

  if (pathname === "/api/cv" && request.method === "GET") {
    try {
      const content = resolveCvIncludes(cvFiles["cv.md"]);
      return json({ ok: true, content });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to read CV file.",
          details: error.message,
        },
        500
      );
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
      return json(
        {
          ok: false,
          error: "Failed to generate CV PDF.",
          details: error.message,
        },
        500
      );
    }
  }

  if (pathname === "/api/linkedin/post-capability" && request.method === "GET") {
    const auth = await getLinkedInAuth(db);
    return json({
      ok: true,
      authenticated: Boolean(auth?.accessToken),
      actor: auth?.actor || null,
      scopes: getLinkedInScopes(env),
    });
  }

  if (pathname === "/api/linkedin/photo" && request.method === "GET") {
    const urlValue = new URL(request.url).searchParams.get("url");
    if (!urlValue || !isAllowedImageHost(urlValue)) {
      return json({ ok: false, error: "Invalid or non-LinkedIn image URL." }, 400);
    }

    try {
      const upstream = await fetch(urlValue, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "image/*",
        },
      });

      if (!upstream.ok) {
        return json(
          {
            ok: false,
            error: "Failed to load LinkedIn image.",
            detail: {
              status: upstream.status,
              statusText: upstream.statusText,
            },
          },
          502
        );
      }

      return new Response(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "Failed to load LinkedIn image.",
          detail: { message: error.message },
        },
        502
      );
    }
  }

  if (pathname === "/api/linkedin/preview" && request.method === "GET") {
    const publicProfile = await fetchPublicProfile(getLinkedInPublicUrl(env));
    const scopes = getLinkedInScopes(env);
    const scopeHints = [];

    if (!scopes.split(/\s+/).includes("email")) {
      scopeHints.push("Add `email` to LINKEDIN_SCOPES for richer OIDC userinfo claims.");
    }

    return json({
      fetchedAt: new Date().toISOString(),
      scopeRequested: scopes,
      publicProfile,
      hints: scopeHints,
      note: "Full private profile data requires OAuth login via /auth/linkedin.",
    });
  }

  if (pathname === "/api/linkedin/post" && request.method === "POST") {
    const auth = await getLinkedInAuth(db);
    const body = await request.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!auth?.accessToken) {
      return json({ ok: false, error: "Not authenticated. Use /auth/linkedin first." }, 401);
    }

    if (!auth?.actor?.urn) {
      return json(
        {
          ok: false,
          error: "Missing LinkedIn actor identity. Re-authenticate and try again.",
        },
        400
      );
    }

    if (!text) {
      return json({ ok: false, error: "Post text is required." }, 400);
    }

    if (text.length > 3000) {
      return json({ ok: false, error: "Post text is too long (max 3000 chars)." }, 400);
    }

    const payload = {
      author: auth.actor.urn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    try {
      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return json(
          {
            ok: false,
            error: "LinkedIn post publish failed.",
            detail: await safeErrorFromResponse(response),
          },
          502
        );
      }

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (_error) {
        responseData = null;
      }

      return json({
        ok: true,
        actor: auth.actor,
        postedAt: new Date().toISOString(),
        linkedin: {
          status: response.status,
          headers: {
            "x-restli-id": response.headers.get("x-restli-id"),
          },
          data: responseData,
        },
      });
    } catch (error) {
      return json(
        {
          ok: false,
          error: "LinkedIn post publish failed.",
          detail: { message: error.message },
        },
        502
      );
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
        source:
          "https://www.cloudflare.com/en-gb/careers/jobs/?location=Lisbon%2C+Portugal&title=ai",
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

  if (pathname === "/auth/linkedin" && request.method === "GET") {
    if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_REDIRECT_URI) {
      return json(
        {
          ok: false,
          error: "Missing LINKEDIN_CLIENT_ID or LINKEDIN_REDIRECT_URI.",
        },
        500
      );
    }

    const state = makeState();
    await storeOAuthState(db, state);

    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", env.LINKEDIN_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", env.LINKEDIN_REDIRECT_URI);
    authUrl.searchParams.set("scope", getLinkedInScopes(env));
    authUrl.searchParams.set("state", state);

    return Response.redirect(authUrl.toString(), 302);
  }

  if (pathname === "/auth/linkedin/callback" && request.method === "GET") {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");
    const oauthErrorDescription = url.searchParams.get("error_description");

    if (oauthError) {
      const redirectUrl = new URL("/", url.origin);
      redirectUrl.searchParams.set("oauthError", `${oauthError}: ${oauthErrorDescription || "Unknown error"}`);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    if (!state || !(await consumeOAuthState(db, state))) {
      return Response.redirect(`${url.origin}/?oauthError=Invalid%20or%20expired%20state`, 302);
    }

    if (!code) {
      return Response.redirect(`${url.origin}/?oauthError=No%20authorization%20code%20received`, 302);
    }

    if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET || !env.LINKEDIN_REDIRECT_URI) {
      return json(
        {
          ok: false,
          error: "Missing LinkedIn OAuth env vars.",
        },
        500
      );
    }

    try {
      const params = new URLSearchParams();
      params.set("grant_type", "authorization_code");
      params.set("code", code);
      params.set("redirect_uri", env.LINKEDIN_REDIRECT_URI);
      params.set("client_id", env.LINKEDIN_CLIENT_ID);
      params.set("client_secret", env.LINKEDIN_CLIENT_SECRET);

      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!tokenResponse.ok) {
        const detail = encodeURIComponent(JSON.stringify(await safeErrorFromResponse(tokenResponse), null, 2));
        return Response.redirect(`${url.origin}/?oauthError=${detail}`, 302);
      }

      const tokenPayload = await tokenResponse.json();
      const accessToken = tokenPayload.access_token;
      const idTokenClaims = decodeJwtClaims(tokenPayload.id_token);
      const apiResults = await fetchLinkedInData(accessToken);
      const publicProfile = await fetchPublicProfile(getLinkedInPublicUrl(env));
      const diagnostics = buildDiagnostics(apiResults, getLinkedInScopes(env));

      const actorSub = apiResults.userinfo?.ok ? apiResults.userinfo?.data?.sub : null;
      const actorUrn = actorSub ? `urn:li:person:${actorSub}` : null;

      const auth = {
        accessToken,
        actor: {
          sub: actorSub,
          urn: actorUrn,
          name: apiResults.userinfo?.data?.name || null,
        },
        authorizedAt: new Date().toISOString(),
      };

      await saveLinkedInAuth(db, auth);

      const payload = {
        fetchedAt: new Date().toISOString(),
        tokenMeta: {
          expiresIn: tokenPayload.expires_in,
          scopeRequested: getLinkedInScopes(env),
          hasIdToken: Boolean(tokenPayload.id_token),
        },
        idTokenClaims,
        apiResults,
        publicProfile,
        diagnostics,
        posting: {
          authenticated: true,
          actor: auth.actor,
        },
      };

      const serializedPayload = JSON.stringify(payload).replace(/</g, "\\u003c");

      return new Response(
        `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>LinkedIn Data Loaded</title>
  </head>
  <body>
    <script>
      localStorage.setItem("linkedinData", JSON.stringify(${serializedPayload}));
      window.location.replace("/");
    </script>
  </body>
</html>`,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    } catch (error) {
      const detail = encodeURIComponent(JSON.stringify({ message: error.message }, null, 2));
      return Response.redirect(`${url.origin}/?oauthError=${detail}`, 302);
    }
  }

  if (pathname.startsWith("/api/")) {
    return json({ ok: false, error: "Endpoint not implemented in Worker yet." }, 404);
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
