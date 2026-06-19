import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

function generateSitemap() {
  const rootDir = process.cwd();
  const DYNAMIC_DATA_PATH = path.join(rootDir, 'src', 'data', 'synced_sarkari_data.json');
  const PUBLIC_SITEMAP_PATH = path.join(rootDir, 'public', 'sitemap-static.xml');
  const domain = "https://sarkariresultgovt.online";

  console.log("Generating static sitemap.xml via Vite plugin...");
  let notifications = [];

  try {
    if (fs.existsSync(DYNAMIC_DATA_PATH)) {
      const content = fs.readFileSync(DYNAMIC_DATA_PATH, 'utf-8');
      notifications = JSON.parse(content);
    }
  } catch (error: any) {
    console.warn("Could not read synced_sarkari_data.json for sitemap:", error.message);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Main URL
  xml += `  <url>\n`;
  xml += `    <loc>${domain}/</loc>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // All jobs
  let addedCount = 0;
  if (Array.isArray(notifications)) {
    for (const item of notifications) {
      if (item && item.id) {
        const safeId = encodeURIComponent(item.id);
        xml += `  <url>\n`;
        xml += `    <loc>${domain}/jobs/${safeId}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
        addedCount++;
      }
    }
  }

  xml += `</urlset>\n`;

  // Make sure public directory exists
  const publicDir = path.dirname(PUBLIC_SITEMAP_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(PUBLIC_SITEMAP_PATH, xml, 'utf-8');
  console.log(`Successfully generated sitemap.xml with ${addedCount} vacancy URLs at ${PUBLIC_SITEMAP_PATH}`);
}

const sitemapPlugin = () => ({
  name: 'generate-sitemap',
  buildStart() {
    generateSitemap();
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sitemapPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
