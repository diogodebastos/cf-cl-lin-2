function $(id) {
  return document.getElementById(id);
}

const statusText = $("status-text");
const statusDot = $("status-dot");
const techStackEl = $("tech-stack");
const profileNameEl = $("profile-name");
const profilePictureEl = $("profile-picture");
const cvSection = $("cv-section");
const cvContent = $("cv-content");
const cvDownloadBtn = $("cv-download-btn");
const cloudflareMeta = $("cloudflare-meta");
const cloudflareJobs = $("cloudflare-jobs");
const cloudflareRefreshBtn = $("cloudflare-refresh");
const metricFollowing = $("metric-following");
const metricFollowers = $("metric-followers");
const metricPosts = $("metric-posts");
const activityLog = $("activity-log");
const metricsMeta = $("metrics-meta");
const metricsRefreshBtn = $("metrics-refresh");
const chartFollowing = $("chart-following");
const chartFollowers = $("chart-followers");
const chartPosts = $("chart-posts");

let cloudflareLoaded = false;
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

function renderProfileSnapshot() {
  profileNameEl.textContent = "Claude Takes Control Until Cloudflare Hires Me";
  profilePictureEl.src = "/1768391378809_px.png";
  profilePictureEl.hidden = false;
  profilePictureEl.alt = "@jilvaa198175 profile photo";
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

function renderTwitterMetrics(payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];

  if (rows.length === 0) {
    metricsMeta.textContent = "No rows in local metrics database.";
    destroyMetricCharts();
    return;
  }

  const labels = rows.map((row) => new Date(`${row.date}T00:00:00`).toLocaleDateString());
  const followingSeries = rows.map((row) => row.following);
  const followersSeries = rows.map((row) => row.followers);
  const postsSeries = rows.map((row) => row.posts ?? 0);
  const latest = rows[rows.length - 1];

  metricsMeta.textContent = `Rows: ${rows.length} | Latest: ${latest.date} | Last fetch: ${new Date(
    payload.fetchedAt
  ).toLocaleString()}`;

  metricFollowing.textContent = latest.following;
  metricFollowers.textContent = latest.followers;
  metricPosts.textContent = latest.posts ?? 0;

  destroyMetricCharts();

  metricCharts.push(buildMetricChart(chartFollowing, labels, followingSeries, "#f6821f"));
  metricCharts.push(buildMetricChart(chartFollowers, labels, followersSeries, "#2979ff"));
  metricCharts.push(buildMetricChart(chartPosts, labels, postsSeries, "#00e676"));
}

async function fetchTwitterMetrics() {
  metricsRefreshBtn.disabled = true;
  metricsMeta.textContent = "Loading local X metrics...";

  try {
    const response = await fetch("/api/twitter/metrics-history");
    const result = await response.json();

    if (!response.ok || !result.ok) {
      metricsMeta.textContent = "Failed to load local X metrics.";
      addLog("X metrics fetch failed");
      return;
    }

    renderTwitterMetrics(result);
    addLog(`X metrics loaded (${result.count} rows)`);
  } catch (error) {
    metricsMeta.textContent = "Failed to load local X metrics.";
    addLog("X metrics fetch failed due to network/runtime error");
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

cloudflareRefreshBtn.addEventListener("click", fetchCloudflareJobs);
metricsRefreshBtn.addEventListener("click", fetchTwitterMetrics);
cvDownloadBtn.addEventListener("click", downloadCvPdf);

techStackEl.textContent = "Cloudflare D1, Cloudflare Workers";
setStatus("Profile linked", true);
renderProfileSnapshot();
loadCv();
fetchCloudflareJobs();
fetchTwitterMetrics();
addLog("Dashboard initialized");
