/**
 * Download vendor JS/CSS into media/vendor/ (CDN content shifted local for CSP).
 * Run: node scripts/fetch-vendor.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const TARGETS = [
  {
    url: 'https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js',
    file: 'cytoscape.min.js',
  },
  {
    url: 'https://unpkg.com/dagre@0.8.5/dist/dagre.min.js',
    file: 'dagre.min.js',
  },
  {
    url: 'https://unpkg.com/cytoscape-dagre@2.5.0/cytoscape-dagre.js',
    file: 'cytoscape-dagre.js',
  },
  {
    // Tailwind play CDN compiled stylesheet (use a static build instead of runtime JIT)
    url: 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
    file: 'tailwind.min.css',
  },
];

const OUT_DIR = path.resolve(__dirname, '..', 'media', 'vendor');
fs.mkdirSync(OUT_DIR, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const handle = (u) => {
      https
        .get(u, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            handle(res.headers.location);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode} for ${u}`));
            return;
          }
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => file.close(() => resolve()));
          file.on('error', reject);
        })
        .on('error', reject);
    };
    handle(url);
  });
}

(async () => {
  for (const t of TARGETS) {
    const dest = path.join(OUT_DIR, t.file);
    process.stdout.write(`Downloading ${t.file}... `);
    try {
      await download(t.url, dest);
      console.log('ok');
    } catch (e) {
      console.error('failed:', e.message);
      process.exitCode = 1;
    }
  }
})();
