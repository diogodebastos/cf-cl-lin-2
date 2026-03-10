function $(id) {
  return document.getElementById(id);
}

const statusText = $("status-text");
const statusDot = $("status-dot");
const fetchedAtEl = $("fetched-at");
const scopeEl = $("scope");
const outputEl = $("json-output");
const profileNameEl = $("profile-name");
const profilePictureEl = $("profile-picture");
const cvSection = $("cv-section");
const cvContent = $("cv-content");
const cvDownloadBtn = $("cv-download-btn");
const previewBtn = $("preview-btn");
const clearBtn = $("clear-btn");
const postBtn = $("post-btn");
const postText = $("post-text");
const postStatus = $("post-status");
const postOutput = $("post-output");
const cloudflareMeta = $("cloudflare-meta");
const cloudflareJobs = $("cloudflare-jobs");
const cloudflareRefreshBtn = $("cloudflare-refresh");
const metricProfileViews = $("metric-profile-views");
const metricConnections = $("metric-connections");
const metricLiPosts = $("metric-li-posts");
const metricMessagesSent = $("metric-messages-sent");
const activityLog = $("activity-log");
const metricsMeta = $("metrics-meta");
const metricsRefreshBtn = $("metrics-refresh");
const chartProfileViews = $("chart-profile-views");
const chartConnections = $("chart-connections");
const chartPosts = $("chart-posts");
const chartMessages = $("chart-messages");

const tabProfile = $("tab-profile");
const tabCompose = $("tab-compose");
const tabPayload = $("tab-payload");
const panelProfile = $("panel-profile");
const panelCompose = $("panel-compose");
const panelPayload = $("panel-payload");

let lastDirectPictureUrl = "";
let cloudflareLoaded = false;
let publishedPosts = 0;
let cvLoaded = false;
let metricCharts = [];

function addLog(text) {
  const entry = document.createElement("article");
  entry.className = "log-item";
  entry.innerHTML = `<p class="log-time">${new Date().toLocaleTimeString()}</p><p class="log-text">${escapeHtml(
    text
  )}</p>`;

  if (activityLog.firstElementChild && activityLog.firstElementChild.tagName === "P") {
    activityLog.innerHTML = "";
  }

  activityLog.prepend(entry);
}

function setStatus(text, live) {
  statusText.textContent = text;
  statusDot.classList.toggle("live", Boolean(live));
  statusDot.classList.toggle("paused", !live);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showLeftTab(tab) {
  const tabs = [
    [tabProfile, panelProfile, tab === "profile"],
    [tabCompose, panelCompose, tab === "compose"],
    [tabPayload, panelPayload, tab === "payload"],
  ];

  for (const [button, panel, active] of tabs) {
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  }
}

function renderProfileSnapshot(data) {
  const userInfo = data?.apiResults?.userinfo?.data;
  const name = userInfo?.name || "Not available yet";
  const picture =
    userInfo?.picture ||
    data?.idTokenClaims?.picture ||
    data?.publicProfile?.data?.image ||
    "";

  profileNameEl.textContent = name;

  if (picture) {
    lastDirectPictureUrl = picture;
    profilePictureEl.src = `/api/linkedin/photo?url=${encodeURIComponent(picture)}`;
    profilePictureEl.hidden = false;
    profilePictureEl.alt = `${name} profile photo`;
  } else {
    profilePictureEl.hidden = true;
    profilePictureEl.removeAttribute("src");
    profilePictureEl.alt = "LinkedIn profile";
  }
}

profilePictureEl.addEventListener("error", () => {
  if (lastDirectPictureUrl && profilePictureEl.src !== lastDirectPictureUrl) {
    profilePictureEl.src = lastDirectPictureUrl;
    return;
  }

  profilePictureEl.hidden = true;
});

function renderData(data, source) {
  if (!data) {
    outputEl.textContent = "No data yet.";
    fetchedAtEl.textContent = "None";
    scopeEl.textContent = "Unknown";
    setStatus("Idle", false);
    renderProfileSnapshot(null);
    cvSection.hidden = true;
    return;
  }

  fetchedAtEl.textContent = data.fetchedAt || "Unknown";
  scopeEl.textContent = data.tokenMeta?.scopeRequested || data.scopeRequested || "Unknown";
  setStatus(`Loaded: ${source}`, true);
  renderProfileSnapshot(data);
  outputEl.textContent = JSON.stringify(data, null, 2);
  cvSection.hidden = false;

  if (!cvLoaded) {
    loadCv();
  }
}

async function loadCv() {
  cvSection.hidden = false;
  cvContent.textContent = "Loading CV...";

  try {
    const response = await fetch("/api/cv");
    const result = await response.json();

    if (!response.ok || !result.ok) {
      cvContent.textContent = "Failed to load CV.";
      addLog("CV load failed");
      return;
    }

    const markdown = result.content || "No CV content found.";
    if (window.marked && typeof window.marked.parse === "function") {
      cvContent.innerHTML = window.marked.parse(markdown);
    } else {
      cvContent.textContent = markdown;
    }
    cvLoaded = true;
    addLog("CV loaded");
  } catch (error) {
    cvContent.textContent = "Failed to load CV.";
    addLog("CV load failed due to network/runtime error");
  }
}

async function downloadCvPdf() {
  cvDownloadBtn.disabled = true;

  try {
    const response = await fetch("/api/cv/pdf");
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }

    const pdfBlob = await response.blob();
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "diogo_de_bastos_cv.pdf";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    addLog("CV PDF downloaded");
  } catch (error) {
    addLog("CV PDF download failed");
  } finally {
    cvDownloadBtn.disabled = false;
  }
}

function setPostState(status, output) {
  postStatus.textContent = status;
  postOutput.textContent =
    typeof output === "string" ? output : JSON.stringify(output, null, 2);
}

function renderCloudflareJobs(payload) {
  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
  const fetchedAt = payload?.fetchedAt ? new Date(payload.fetchedAt).toLocaleString() : "Unknown";

  cloudflareMeta.textContent = `Filters: Lisbon, Portugal + title contains 'ai' or 'data' | Matches: ${jobs.length} | Fetched: ${fetchedAt}`;

  if (jobs.length === 0) {
    cloudflareJobs.innerHTML = "No current Cloudflare openings matched this filter.";
    return;
  }

  cloudflareJobs.innerHTML = jobs
    .map((job) => {
      const published = job.firstPublished
        ? new Date(job.firstPublished).toLocaleDateString()
        : "Unknown";

      return `<article class="job-card">
        <p class="job-title"><a href="${escapeHtml(job.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(
        job.title || "Untitled role"
      )}</a></p>
        <p class="job-meta">${escapeHtml(job.location || "Unknown")} | Posted ${escapeHtml(
        published
      )}</p>
      </article>`;
    })
    .join("");
}

function destroyMetricCharts() {
  for (const chart of metricCharts) {
    chart.destroy();
  }
  metricCharts = [];
}

function buildMetricChart(canvas, labels, values, color) {
  const context = canvas.getContext("2d");
  return new window.Chart(context, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: values,
          borderColor: color,
          backgroundColor: `${color}33`,
          borderWidth: 2,
          tension: 0.25,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#8a8a8a",
            maxRotation: 0,
            font: {
              family: "IBM Plex Mono",
              size: 10,
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.08)",
          },
        },
        y: {
          beginAtZero: false,
          ticks: {
            color: "#a3a3a3",
            font: {
              family: "IBM Plex Mono",
              size: 10,
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.08)",
          },
        },
      },
    },
  });
}

function renderLinkedInMetrics(payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];

  if (rows.length === 0) {
    metricsMeta.textContent = "No rows in local metrics database.";
    destroyMetricCharts();
    return;
  }

  const labels = rows.map((row) => new Date(`${row.date}T00:00:00`).toLocaleDateString());
  const profileViewsSeries = rows.map((row) => row.profileViews);
  const connectionsSeries = rows.map((row) => row.connections);
  const postsSeries = rows.map((row) => row.posts);
  const messagesSeries = rows.map((row) => row.messagesSent);
  const latest = rows[rows.length - 1];

  metricsMeta.textContent = `Rows: ${rows.length} | Latest: ${latest.date} | Last fetch: ${new Date(
    payload.fetchedAt
  ).toLocaleString()}`;

  metricProfileViews.textContent = latest.profileViews;
  metricConnections.textContent = latest.connections;
  metricLiPosts.textContent = latest.posts;
  metricMessagesSent.textContent = latest.messagesSent;

  destroyMetricCharts();

  metricCharts.push(buildMetricChart(chartProfileViews, labels, profileViewsSeries, "#f6821f"));
  metricCharts.push(buildMetricChart(chartConnections, labels, connectionsSeries, "#2979ff"));
  metricCharts.push(buildMetricChart(chartPosts, labels, postsSeries, "#00e676"));
  metricCharts.push(buildMetricChart(chartMessages, labels, messagesSeries, "#ffca28"));
}

async function fetchLinkedInMetrics() {
  metricsRefreshBtn.disabled = true;
  metricsMeta.textContent = "Loading local LinkedIn metrics...";

  try {
    const response = await fetch("/api/linkedin/metrics-history");
    const result = await response.json();

    if (!response.ok || !result.ok) {
      metricsMeta.textContent = "Failed to load local LinkedIn metrics.";
      addLog("LinkedIn metrics fetch failed");
      return;
    }

    renderLinkedInMetrics(result);
    addLog(`LinkedIn metrics loaded (${result.count} rows)`);
  } catch (error) {
    metricsMeta.textContent = "Failed to load local LinkedIn metrics.";
    addLog("LinkedIn metrics fetch failed due to network/runtime error");
  } finally {
    metricsRefreshBtn.disabled = false;
  }
}

async function fetchCloudflareJobs() {
  cloudflareRefreshBtn.disabled = true;
  cloudflareMeta.textContent = "Loading Cloudflare openings...";

  try {
    const response = await fetch("/api/cloudflare/open-positions");
    const result = await response.json();

    if (!response.ok || !result.ok) {
      cloudflareMeta.textContent = "Cloudflare fetch failed.";
      cloudflareJobs.textContent = JSON.stringify(result, null, 2);
      addLog("Cloudflare fetch failed");
      return;
    }

    cloudflareLoaded = true;
    renderCloudflareJobs(result);
    addLog(`Cloudflare jobs loaded (${result.totalMatching} matches)`);
  } catch (error) {
    cloudflareMeta.textContent = "Cloudflare fetch failed.";
    cloudflareJobs.textContent = JSON.stringify(
      { ok: false, error: error.message || "Unknown error" },
      null,
      2
    );
    addLog("Cloudflare fetch failed due to network/runtime error");
  } finally {
    cloudflareRefreshBtn.disabled = false;
  }
}

async function publishPost() {
  const text = postText.value.trim();
  if (!text) {
    setPostState("Missing text", { ok: false, error: "Write something before posting." });
    return;
  }

  postBtn.disabled = true;
  setPostState("Publishing...", "Sending post to LinkedIn...");

  try {
    const response = await fetch("/api/linkedin/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      setPostState("Publish failed", result);
      addLog("LinkedIn post publish failed");
      return;
    }

    setPostState("Published", result);
    publishedPosts += 1;
    addLog("LinkedIn post published");
  } catch (error) {
    setPostState("Publish failed", { ok: false, error: error.message || "Unknown error" });
    addLog("LinkedIn post publish failed due to network/runtime error");
  } finally {
    postBtn.disabled = false;
  }
}

async function fetchPreview() {
  try {
    setStatus("Fetching preview...", true);
    const response = await fetch("/api/linkedin/preview");
    const data = await response.json();
    localStorage.setItem("linkedinData", JSON.stringify(data));
    renderData(data, "preview");
    addLog("LinkedIn preview fetched");
  } catch (error) {
    setStatus("Preview failed", false);
    outputEl.textContent = JSON.stringify({ error: error.message || "Unknown error" }, null, 2);
    addLog("LinkedIn preview failed");
  }
}

function loadFromLocalStorage() {
  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get("oauthError");
  if (oauthError) {
    setStatus("OAuth error", false);
    outputEl.textContent = decodeURIComponent(oauthError);
    addLog("OAuth error returned from LinkedIn");
    return;
  }

  const raw = localStorage.getItem("linkedinData");
  if (!raw) {
    renderData(null, "none");
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    renderData(parsed, "local storage");
    addLog("Loaded LinkedIn data from local snapshot");
  } catch (_error) {
    renderData(null, "none");
  }
}

previewBtn.addEventListener("click", fetchPreview);
clearBtn.addEventListener("click", () => {
  localStorage.removeItem("linkedinData");
  renderData(null, "none");
  addLog("Local LinkedIn snapshot cleared");
});
postBtn.addEventListener("click", publishPost);
cloudflareRefreshBtn.addEventListener("click", fetchCloudflareJobs);
metricsRefreshBtn.addEventListener("click", fetchLinkedInMetrics);
cvDownloadBtn.addEventListener("click", downloadCvPdf);

tabProfile.addEventListener("click", () => showLeftTab("profile"));
tabCompose.addEventListener("click", () => showLeftTab("compose"));
tabPayload.addEventListener("click", () => showLeftTab("payload"));

loadFromLocalStorage();
fetchCloudflareJobs();
fetchLinkedInMetrics();
addLog("Dashboard initialized");
