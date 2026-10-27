const express = require("express");
const path    = require("path");
const helmet  = require("helmet");
const morgan  = require("morgan");

const portalRouter = require("./routes/portal");

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Logging Middleware ────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP disabled so CDN fonts load cleanly
app.use(morgan("dev"));

// ─── Static Assets ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "public")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/", portalRouter);

// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send("<h2>404 — Page not found.</h2>");
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────────────");
  console.log("  A7 Agrovet Solution — QR Portal Server Running");
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log("─────────────────────────────────────────────────────");
});

module.exports = app;
