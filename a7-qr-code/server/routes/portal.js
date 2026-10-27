const express     = require("express");
const path        = require("path");
const SOCIAL_LINKS = require("../config");

const router = express.Router();

// ─── Main Portal Page ─────────────────────────────────────────────────────────
// Serves the landing page and injects social links as JSON so the
// front-end deep-linking script always reads from the single source of truth.
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// ─── API: Social Links (JSON) ──────────────────────────────────────────────────
// Front-end calls GET /api/links to receive the live social links config.
// When you update server/config.js, the UI updates automatically on next load.
router.get("/api/links", (req, res) => {
  res.json(SOCIAL_LINKS);
});

// ─── Redirect Helper ──────────────────────────────────────────────────────────
// GET /go/:platform  →  redirects to webUrl of that platform.
// Useful for QR codes that encode https://yourdomain.com/go/facebook etc.
router.get("/go/:platform", (req, res) => {
  const platform = req.params.platform.toLowerCase();
  const link = SOCIAL_LINKS[platform];

  if (!link) {
    return res.status(404).send("Platform not found.");
  }

  res.redirect(302, link.webUrl);
});

module.exports = router;
