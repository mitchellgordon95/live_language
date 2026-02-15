#!/usr/bin/env npx tsx
/**
 * Visual verification tool for scene image coordinates.
 * Opens a local HTML page that overlays label markers on the generated scene image.
 *
 * Usage:
 *   npx tsx scripts/verify-coordinates.ts --module home --location kitchen
 *   npx tsx scripts/verify-coordinates.ts --module restaurant --location restaurant_table --port 8080
 *
 * Opens in your default browser. Click labels to adjust positions (saves back to JSON).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const result: { module?: string; location?: string; port?: number } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--module' && next) { result.module = next; i++; }
    else if (arg === '--location' && next) { result.location = next; i++; }
    else if (arg === '--port' && next) { result.port = parseInt(next); i++; }
  }

  if (!result.module || !result.location) {
    console.error('Usage: npx tsx scripts/verify-coordinates.ts --module <name> --location <id>');
    process.exit(1);
  }

  return result as { module: string; location: string; port: number };
}

function main() {
  const opts = parseArgs();
  const port = opts.port || 8765;

  const scenesDir = path.join(PROJECT_ROOT, 'public', 'scenes', opts.module);
  const manifestPath = path.join(scenesDir, `${opts.location}.json`);

  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    console.error('Run generate-scene.ts first.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const imagePath = path.join(scenesDir, manifest.image);

  if (!fs.existsSync(imagePath)) {
    console.error(`Image not found: ${imagePath}`);
    process.exit(1);
  }

  // Load location data for object names
  const engineRoot = path.join(PROJECT_ROOT, 'src');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Verify: ${opts.module}/${opts.location}</title>
  <style>
    body { margin: 0; background: #1a1a2e; color: white; font-family: system-ui; }
    .container { display: flex; gap: 20px; padding: 20px; }
    .scene { position: relative; width: 1024px; height: 1024px; flex-shrink: 0; }
    .scene img { width: 100%; height: 100%; }
    .label {
      position: absolute; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8); color: #4ade80; padding: 2px 8px;
      border-radius: 4px; font-size: 12px; white-space: nowrap;
      cursor: move; border: 1px solid #4ade80; user-select: none;
    }
    .label:hover { background: rgba(0,100,0,0.8); }
    .label.dragging { border-color: #fbbf24; color: #fbbf24; }
    .bbox {
      position: absolute; border: 1px dashed rgba(74,222,128,0.4);
      pointer-events: none;
    }
    .sidebar { flex: 1; }
    .sidebar h2 { margin-top: 0; }
    .coord-list { font-family: monospace; font-size: 13px; line-height: 1.8; }
    .coord-list div { padding: 2px 4px; }
    .coord-list div:hover { background: rgba(255,255,255,0.1); }
    button { background: #4ade80; color: black; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; }
    button:hover { background: #22c55e; }
    .status { color: #888; font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="scene" id="scene">
      <img src="/image" draggable="false" />
    </div>
    <div class="sidebar">
      <h2>${opts.module} / ${opts.location}</h2>
      <p>Drag labels to adjust positions. Click Save when done.</p>
      <button onclick="save()">Save Coordinates</button>
      <div id="status" class="status"></div>
      <h3>Coordinates</h3>
      <div id="coords" class="coord-list"></div>
    </div>
  </div>
  <script>
    const manifest = ${JSON.stringify(manifest, null, 2)};
    const scene = document.getElementById('scene');
    const coordsDiv = document.getElementById('coords');
    const statusDiv = document.getElementById('status');
    let dragging = null;

    // Create labels and bounding boxes
    for (const [id, coords] of Object.entries(manifest.objects)) {
      const c = coords;
      // Bounding box
      const bbox = document.createElement('div');
      bbox.className = 'bbox';
      bbox.id = 'bbox-' + id;
      bbox.style.left = (c.x - c.w/2) + '%';
      bbox.style.top = (c.y - c.h/2) + '%';
      bbox.style.width = c.w + '%';
      bbox.style.height = c.h + '%';
      scene.appendChild(bbox);

      // Label
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = id;
      label.style.left = c.x + '%';
      label.style.top = c.y + '%';
      label.dataset.id = id;
      label.addEventListener('mousedown', startDrag);
      scene.appendChild(label);
    }

    function startDrag(e) {
      dragging = e.target;
      dragging.classList.add('dragging');
      e.preventDefault();
    }

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = scene.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const cx = Math.max(0, Math.min(100, x));
      const cy = Math.max(0, Math.min(100, y));
      dragging.style.left = cx + '%';
      dragging.style.top = cy + '%';
      const id = dragging.dataset.id;
      manifest.objects[id].x = Math.round(cx * 10) / 10;
      manifest.objects[id].y = Math.round(cy * 10) / 10;
      // Update bbox
      const bbox = document.getElementById('bbox-' + id);
      if (bbox) {
        bbox.style.left = (manifest.objects[id].x - manifest.objects[id].w/2) + '%';
        bbox.style.top = (manifest.objects[id].y - manifest.objects[id].h/2) + '%';
      }
      updateCoords();
    });

    document.addEventListener('mouseup', () => {
      if (dragging) dragging.classList.remove('dragging');
      dragging = null;
    });

    function updateCoords() {
      coordsDiv.innerHTML = Object.entries(manifest.objects)
        .map(([id, c]) => '<div>' + id + ': x=' + c.x + ' y=' + c.y + ' w=' + c.w + ' h=' + c.h + '</div>')
        .join('');
    }

    async function save() {
      const res = await fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });
      if (res.ok) {
        statusDiv.textContent = 'Saved! ' + new Date().toLocaleTimeString();
        statusDiv.style.color = '#4ade80';
      } else {
        statusDiv.textContent = 'Save failed!';
        statusDiv.style.color = '#ef4444';
      }
    }

    updateCoords();
  </script>
</body>
</html>`;

  // Start HTTP server
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else if (req.url === '/image') {
      const img = fs.readFileSync(imagePath);
      const ext = manifest.image.split('.').pop();
      const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(img);
    } else if (req.url === '/save' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const updated = JSON.parse(body);
          fs.writeFileSync(manifestPath, JSON.stringify(updated, null, 2));
          res.writeHead(200);
          res.end('OK');
          console.log('  Coordinates saved!');
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\nVerify coordinates: ${url}`);
    console.log('  Drag labels to adjust positions, then click Save.');
    console.log('  Press Ctrl+C to stop.\n');

    // Open in browser
    const platform = process.platform;
    const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${cmd} ${url}`);
  });
}

main();
