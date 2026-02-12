import { chromium, type Browser, type Page } from 'playwright';
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = parseInt(process.argv.find((_, i, a) => a[i - 1] === '--port') || '4001');
const screenshotDir = resolve(__dirname, '..', 'playtests', 'screenshots');
mkdirSync(screenshotDir, { recursive: true });

let browser: Browser | null = null;
let page: Page | null = null;
let turnNumber = 0;

function screenshotPath(label: string): string {
  return resolve(screenshotDir, `${port}-${label}.png`);
}

async function takeScreenshot(label: string): Promise<string> {
  if (!page) throw new Error('No page');
  const path = screenshotPath(label);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function readBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString();
  return raw ? JSON.parse(raw) : {};
}

function json(res: ServerResponse, data: any, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${port}`);

    if (url.pathname === '/init' && req.method === 'POST') {
      const { module: mod = 'home' } = await readBody(req);
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto('http://localhost:3000');
      // Click the module button by its display name
      const displayName = mod.charAt(0).toUpperCase() + mod.slice(1);
      await page.click(`button:has-text("${displayName}")`);
      // Wait for game to load (input bar appears)
      await page.waitForSelector('input[type="text"]', { timeout: 15000 });
      // Small delay for scene images to render
      await page.waitForTimeout(1000);
      turnNumber = 0;
      const path = await takeScreenshot('init');
      json(res, { status: 'ok', screenshot: path });

    } else if (url.pathname === '/turn' && req.method === 'POST') {
      if (!page) { json(res, { error: 'Not initialized' }, 400); return; }
      const { text } = await readBody(req);
      if (!text) { json(res, { error: 'Missing text' }, 400); return; }

      // Type and submit
      await page.fill('input[type="text"]', text);
      await page.press('input[type="text"]', 'Enter');

      // Wait for "Thinking..." to appear then disappear (response loaded)
      try {
        await page.waitForSelector('.animate-pulse', { state: 'attached', timeout: 3000 });
      } catch { /* may have already resolved */ }
      await page.waitForSelector('.animate-pulse', { state: 'detached', timeout: 90000 });

      // Small delay for UI to settle (portraits, scene updates)
      await page.waitForTimeout(500);

      turnNumber++;
      const path = await takeScreenshot(`turn-${turnNumber}`);
      json(res, { screenshot: path, turnNumber });

    } else if (url.pathname === '/screenshot' && req.method === 'GET') {
      if (!page) { json(res, { error: 'Not initialized' }, 400); return; }
      const path = await takeScreenshot(`manual-${Date.now()}`);
      json(res, { path });

    } else if (url.pathname === '/close' && req.method === 'POST') {
      if (browser) { await browser.close(); browser = null; page = null; }
      json(res, { status: 'closed' });
      setTimeout(() => process.exit(0), 100);

    } else {
      json(res, { error: 'Not found' }, 404);
    }
  } catch (err: any) {
    json(res, { error: err.message }, 500);
  }
});

server.listen(port, () => {
  console.log(`Playtest bridge running on http://localhost:${port}`);
});
