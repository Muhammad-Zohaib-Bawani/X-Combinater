const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
  '/',
  'services.html',
  'services.html',
  'contact.html',
  'about.html',
  'portfolio-3.html'
];

const root = path.resolve(__dirname, '..');
const outDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const p of pages) {
      const filePath = path.join(root, p);
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping (not found): ${p}`);
        continue;
      }
      const url = 'file:///' + filePath.replace(/\\/g, '/');
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      } catch (err) {
        console.warn(`Warning: loaded with possible errors: ${p} — ${err.message}`);
      }
      const outPath = path.join(outDir, p.replace(/\.html?$/i, '') + '.png');
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved screenshot: ${outPath}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})();
