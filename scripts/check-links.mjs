import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const siteBase = '/baldr-site/';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target)));
    else files.push(target);
  }
  return files;
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function pageUrl(file) {
  const relative = path.relative(dist, file).split(path.sep).join('/');
  const route = relative === 'index.html' ? '' : relative.replace(/index\.html$/, '');
  return new URL(`${siteBase}${route}`, 'https://baldr.local');
}

async function resolveBuildFile(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (!pathname.startsWith(siteBase)) return null;
  const relative = pathname.slice(siteBase.length).replace(/^\/+/, '');
  const candidates = relative.endsWith('/')
    ? [path.join(dist, relative, 'index.html')]
    : [
        path.join(dist, relative),
        path.join(dist, `${relative}.html`),
        path.join(dist, relative, 'index.html'),
      ];
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

const idCache = new Map();

async function documentIds(file) {
  if (idCache.has(file)) return idCache.get(file);
  const html = await readFile(file, 'utf8');
  const ids = new Set(
    Array.from(html.matchAll(/\sid=["']([^"']+)["']/g), (match) => match[1]),
  );
  idCache.set(file, ids);
  return ids;
}

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('.html'));
const failures = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/\shref=["']([^"']+)["']/g)) {
    const href = match[1];
    if (
      !href ||
      /^(?:https?:|mailto:|tel:|data:|javascript:)/.test(href)
    ) {
      continue;
    }
    checked += 1;
    const target = new URL(href, pageUrl(file));
    if (target.origin !== 'https://baldr.local') continue;
    const buildFile = await resolveBuildFile(target);
    if (!buildFile) {
      failures.push(`${path.relative(dist, file)} -> ${href}`);
      continue;
    }
    if (target.hash && buildFile.endsWith('.html')) {
      const fragment = decodeURIComponent(target.hash.slice(1));
      const ids = await documentIds(buildFile);
      if (!ids.has(fragment)) {
        failures.push(`${path.relative(dist, file)} -> ${href} (anchor inexistente)`);
      }
    }
  }
}

if (failures.length) {
  console.error('Se encontraron enlaces internos sin destino:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Verificados ${checked} enlaces internos en ${htmlFiles.length} páginas.`);
}
