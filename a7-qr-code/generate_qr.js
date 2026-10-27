/**
 * A7 Agrovet Solution — Branded QR Code Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a print-ready, branded QR code PNG with the A7 logo embedded
 * in the center. Output goes to:
 *   qr_code/a7_social_qr.png   (used by the planning HTML presentation)
 *   public/images/a7_qr.png    (served by Express for the web portal)
 *
 * Usage:
 *   node generate_qr.js [URL]
 *
 *   Default URL: http://localhost:3000
 *   For production: node generate_qr.js https://yourdomain.com
 *
 * First-time setup:
 *   npm install qrcode jimp
 */

const QRCode       = require("qrcode");
const { Jimp, JimpMime } = require("jimp");
const path         = require("path");
const fs           = require("fs");

// ─── Config ───────────────────────────────────────────────────────────────────
const PORTAL_URL  = process.argv[2] || "http://localhost:3000";
const OUTPUT_SIZE = 1000;           // px  — print-quality square
const LOGO_RATIO  = 0.22;           // logo occupies 22% of QR width
const LOGO_SRC    = path.join(__dirname, "assets", "logo.jpg");

const OUTPUTS = [
  path.join(__dirname, "qr_code",        "a7_social_qr.png"),
  path.join(__dirname, "public", "images", "a7_qr.png"),
];

// A7 brand colors
const DARK_COLOR  = "#143C78";   // Veterinary Navy  (QR modules)
const LIGHT_COLOR = "#FFFFFF";   // White            (QR background)

// ─── Main ─────────────────────────────────────────────────────────────────────
async function generateBrandedQR() {
  console.log("─────────────────────────────────────────────────");
  console.log("  A7 Agrovet Solution — QR Code Generator");
  console.log(`  Encoding URL : ${PORTAL_URL}`);
  console.log(`  Output size  : ${OUTPUT_SIZE}×${OUTPUT_SIZE} px`);
  console.log("─────────────────────────────────────────────────");

  // 1. Render raw QR to a PNG buffer
  const qrBuffer = await QRCode.toBuffer(PORTAL_URL, {
    errorCorrectionLevel: "H",   // High — needed to survive logo overlay
    type:    "png",
    width:   OUTPUT_SIZE,
    margin:  4,
    color: {
      dark:  DARK_COLOR,
      light: LIGHT_COLOR,
    },
  });

  // 2. Load QR and logo using Jimp v1 API
  const [qrImg, logoRaw] = await Promise.all([
    Jimp.fromBuffer(qrBuffer),
    Jimp.fromFile(LOGO_SRC),
  ]);

  // 3. Resize logo and create white badge behind it
  const logoSize  = Math.round(OUTPUT_SIZE * LOGO_RATIO);
  const badgeSize = Math.round(logoSize * 1.18);
  const centerX   = Math.round((OUTPUT_SIZE - badgeSize) / 2);
  const centerY   = Math.round((OUTPUT_SIZE - badgeSize) / 2);

  logoRaw.resize({ w: logoSize, h: logoSize });

  // White badge (square with white fill)
  const badge = new Jimp({ width: badgeSize, height: badgeSize, color: 0xFFFFFFFF });

  // Center logo on badge
  const logoX = Math.round((badgeSize - logoSize) / 2);
  const logoY = Math.round((badgeSize - logoSize) / 2);
  badge.composite(logoRaw, logoX, logoY);

  // 4. Overlay badge onto QR code
  qrImg.composite(badge, centerX, centerY);

  // 5. Save to all output paths
  for (const outputPath of OUTPUTS) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await qrImg.write(outputPath);
    console.log(`  ✓ Saved → ${outputPath}`);
  }

  console.log("─────────────────────────────────────────────────");
  console.log("  Done! QR code generated successfully.");
  console.log("─────────────────────────────────────────────────");
}

generateBrandedQR().catch((err) => {
  console.error("QR generation failed:", err.message);
  process.exit(1);
});
