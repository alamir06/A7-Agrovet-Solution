/**
 * A7 Agrovet Solution — Branded QR Code Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a print-ready, branded QR code PNG with the A7 logo embedded
 * in the center. Output goes to:
 *   qr_code/a7_social_qr.png    (used by the planning HTML presentation)
 *   public/images/a7_qr.png     (served by Express for the web portal)
 *
 * Usage:
 *   node generate_qr.mjs [URL]
 *
 *   Default URL: http://localhost:3000
 *   For production: node generate_qr.mjs https://yourdomain.com
 *
 * Dependencies (already installed):
 *   npm install qrcode jimp
 */

import QRCode        from "qrcode";
import { Jimp }      from "jimp";
import path          from "path";
import fs            from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────────
const PORTAL_URL  = process.argv[2] || "http://localhost:3000";
const OUTPUT_SIZE = 1000;           // px — print-quality square
const LOGO_RATIO  = 0.22;          // logo badge occupies 22% of QR width
const LOGO_SRC    = path.join(__dirname, "assets", "logo.jpg");

// A7 brand colors
const DARK_COLOR  = "#143C78";    // Veterinary Navy (QR modules)
const LIGHT_COLOR = "#FFFFFF";    // White (QR background)

const OUTPUTS = [
  path.join(__dirname, "qr_code",         "a7_social_qr.png"),
  path.join(__dirname, "public", "images", "a7_qr.png"),
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function generateBrandedQR() {
  console.log("─────────────────────────────────────────────────");
  console.log("  A7 Agrovet Solution — QR Code Generator");
  console.log(`  Encoding URL : ${PORTAL_URL}`);
  console.log(`  Output size  : ${OUTPUT_SIZE}×${OUTPUT_SIZE} px`);
  console.log("─────────────────────────────────────────────────");

  // 1. Render QR to PNG buffer (Error Correction = H so logo cutout stays scannable)
  const qrBuffer = await QRCode.toBuffer(PORTAL_URL, {
    errorCorrectionLevel: "H",
    type:    "png",
    width:   OUTPUT_SIZE,
    margin:  4,
    color: { dark: DARK_COLOR, light: LIGHT_COLOR },
  });

  // 2. Load QR buffer and logo file using Jimp
  const [qrImg, logoRaw] = await Promise.all([
    Jimp.read(qrBuffer),
    Jimp.read(LOGO_SRC),
  ]);

  // 3. Resize logo and create white badge
  const logoSize  = Math.round(OUTPUT_SIZE * LOGO_RATIO);
  const badgeSize = Math.round(logoSize * 1.20);   // white border around logo
  const centerX   = Math.round((OUTPUT_SIZE - badgeSize) / 2);
  const centerY   = Math.round((OUTPUT_SIZE - badgeSize) / 2);

  logoRaw.resize({ w: logoSize, h: logoSize });

  // White background badge
  const badge = new Jimp({ width: badgeSize, height: badgeSize, color: 0xFFFFFFFF });
  const logoX = Math.round((badgeSize - logoSize) / 2);
  const logoY = Math.round((badgeSize - logoSize) / 2);
  badge.composite(logoRaw, logoX, logoY);

  // 4. Composite badge onto QR code
  qrImg.composite(badge, centerX, centerY);

  // 5. Write to output paths
  for (const outputPath of OUTPUTS) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await qrImg.write(outputPath);
    console.log(`  ✓ Saved → ${outputPath}`);
  }

  console.log("─────────────────────────────────────────────────");
  console.log("  Done! Scan the QR with your phone to test.");
  console.log("─────────────────────────────────────────────────");
}

generateBrandedQR().catch((err) => {
  console.error("QR generation failed:", err.message);
  process.exit(1);
});
