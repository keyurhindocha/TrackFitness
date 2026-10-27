#!/usr/bin/env node
// Renders the generated SVGs into PNG contact sheets so the poses can be
// eyeballed before they ship.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dir = process.argv[2] || path.join(__dirname, '..', 'assets', 'exercises');
const out = process.argv[3] || path.join(__dirname, '..', '.preview');
const perSheet = Number(process.argv[4] || 6);

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).sort();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let i = 0; i < files.length; i += perSheet) {
    const batch = files.slice(i, i + perSheet);
    const html =
      `<body style="margin:0;background:#000">` +
      batch.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('') +
      `</body>`;
    await page.setContent(html);
    await page.setViewportSize({ width: 1120, height: 660 * batch.length });
    const file = path.join(out, `sheet-${String(i / perSheet + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
  await browser.close();
})();
