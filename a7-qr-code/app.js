/**
 * A7 Agrovet Solution - Smart Deep-Linking Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth: all channel URLs are read from server/config.js
 * via GET /api/links at runtime. Do NOT hardcode channels here.
 *
 * Usage (HTML): <button onclick="openChannel('facebook')">Follow</button>
 * The CHANNELS map is populated on page load by fetchLinks().
 */

/** Live channel data fetched from /api/links (server/config.js) */
let CHANNELS = {};

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Opens a social channel using smart deep-linking:
 * - Mobile  → attempts native app URI first, falls back to web URL after 650 ms
 * - Desktop → opens web URL in a new tab
 */
function openChannel(platformKey) {
  const channel = CHANNELS[platformKey];
  if (!channel) {
    console.warn(`[A7 Portal] Channel "${platformKey}" not found. Links may not have loaded yet.`);
    return;
  }

  if (!isMobileDevice()) {
    window.open(channel.webUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // Mobile: attempt native deep-link; fall back to webUrl if app not installed
  let hasNavigated = false;
  const startTime  = Date.now();

  const timer = setTimeout(() => {
    if (!hasNavigated && Date.now() - startTime < 1800) {
      window.location.href = channel.webUrl;
    }
  }, 650);

  window.addEventListener('blur', () => {
    hasNavigated = true;
    clearTimeout(timer);
  }, { once: true });

  window.location.href = channel.appUri;
}

/**
 * Fetches live channel config from the server and caches it in CHANNELS.
 * Called once on DOMContentLoaded.
 */
async function fetchLinks() {
  try {
    const res = await fetch('/api/links');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    CHANNELS = await res.json();
    console.log('[A7 Portal] Channel links loaded from /api/links ✓');
  } catch (err) {
    console.error('[A7 Portal] Failed to fetch /api/links:', err.message);
    // Silent fail — openChannel() will warn if called before links load
  }
}

// Prefetch links as early as possible so they are ready when buttons are clicked
document.addEventListener('DOMContentLoaded', fetchLinks);
