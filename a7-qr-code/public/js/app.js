/**
 * A7 Agrovet Solution - Social QR Portal
 * Front-End App Script
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Fetches the social links config from GET /api/links (server/config.js)
 * 2. Renders channel cards dynamically into #channels-list
 * 3. Handles smart deep-linking:
 *    - On mobile → attempts native app URI, falls back to web URL after 650ms
 *    - On desktop → opens web URL in new tab
 */

// ─── SVG Icons per platform ────────────────────────────────────────────────────
const ICONS = {
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,

  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,

  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,

  instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,

  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,

  telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.858.942z"/></svg>`,

  phone: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`
};

const ARROW_SVG = `<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
</svg>`;

// ─── Mobile Detection ──────────────────────────────────────────────────────────
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ─── Smart Deep-Link Handler ───────────────────────────────────────────────────
function openChannel(platformKey, links) {
  const channel = links[platformKey];
  if (!channel) return;

  if (!isMobile()) {
    window.open(channel.webUrl, "_blank", "noopener,noreferrer");
    return;
  }

  // Mobile: attempt native app deep-link with web fallback
  let navigated = false;
  const start = Date.now();

  const timer = setTimeout(() => {
    if (!navigated && Date.now() - start < 1800) {
      window.location.href = channel.webUrl;
    }
  }, 650);

  window.addEventListener("blur", () => {
    navigated = true;
    clearTimeout(timer);
  }, { once: true });

  window.location.href = channel.appUri;
}

// ─── Card Renderer ─────────────────────────────────────────────────────────────
function renderCard(platformKey, channel, links) {
  const iconSvg  = ICONS[platformKey] || ICONS.phone;
  const btnLabel = `${channel.actionAmharic} / ${channel.actionEnglish}`;
  const isPhone  = platformKey === "phone";

  const card = document.createElement("div");
  card.className = "channel-card";

  card.innerHTML = `
    <div class="channel-info">
      <div class="icon-bubble" style="background: ${
        platformKey === "instagram"
          ? "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)"
          : channel.color
      };">${iconSvg}</div>
      <div>
        <div class="channel-name">${channel.name}</div>
        <div class="channel-handle">${channel.handle}</div>
      </div>
    </div>
    ${
      isPhone
        ? `<a href="${channel.webUrl}" class="action-btn" style="background:${channel.color}">
             <span>${btnLabel}</span>${ARROW_SVG}
           </a>`
        : `<button class="action-btn" style="background:${channel.color}">
             <span>${btnLabel}</span>${ARROW_SVG}
           </button>`
    }
  `;

  if (!isPhone) {
    card.querySelector("button").addEventListener("click", () =>
      openChannel(platformKey, links)
    );
  }

  return card;
}

// ─── Boot: Fetch links & Build UI ─────────────────────────────────────────────
async function init() {
  const list = document.getElementById("channels-list");

  try {
    const res   = await fetch("/api/links");
    const links = await res.json();

    list.innerHTML = ""; // clear loading state

    Object.entries(links).forEach(([key, channel]) => {
      list.appendChild(renderCard(key, channel, links));
    });

  } catch (err) {
    list.innerHTML = `<p style="text-align:center;color:#E65100;font-size:12px;padding:16px;">
      Unable to load channels. Please try again.<br><small>${err.message}</small>
    </p>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
