import MarkdownIt from "markdown-it";
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";

const defaultTwitterMetricsRows = [
  { date: "2026-02-24", following: 418, followers: 502, posts: 89 },
  { date: "2026-03-03", following: 429, followers: 534, posts: 94 },
  { date: "2026-03-10", following: 441, followers: 563, posts: 99 },
];

const cvFiles = {
  "cv.md": `Lisbon, Portugal | [email](mailto:diogodebastos18@gmail.com) | [X](https://x.com/jilvaa198175) | [GitHub](https://github.com/diogodebastos) | [Google Scholar](https://scholar.google.com/citations?user=6f2lV5YAAAAJ&hl=en)

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
