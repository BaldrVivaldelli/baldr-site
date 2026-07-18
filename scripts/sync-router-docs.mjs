import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'router-docs.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const sourceCandidates = [path.join(root, '..', 'baldr-router'), path.join(root, '..')];
const discoveredSource = sourceCandidates.find((candidate) =>
  existsSync(path.join(candidate, '.git')),
);
const sourceRoot = path.resolve(
  process.env.BALDR_ROUTER_SOURCE ?? discoveredSource ?? sourceCandidates[0],
);
const targetRoot = path.join(root, config.targetDirectory);
const checkOnly = process.argv.includes('--check');
const knownDocuments = new Set(config.documents);

function gitShow(relativePath) {
  try {
    return execFileSync(
      'git',
      ['-C', sourceRoot, 'show', `${config.ref}:${relativePath}`],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (error) {
    const detail = error?.stderr?.toString().trim() || error.message;
    throw new Error(
      `No se pudo leer ${relativePath} desde ${config.ref} en ${sourceRoot}: ${detail}`,
    );
  }
}

function splitTarget(target) {
  const hashAt = target.indexOf('#');
  return hashAt === -1
    ? { pathname: target, hash: '' }
    : { pathname: target.slice(0, hashAt), hash: target.slice(hashAt) };
}

function rewriteLinks(markdown, sourceName) {
  return markdown.replace(/(\]\()([^\s)>]+)(\))/g, (match, open, target, close) => {
    if (
      target.startsWith('#') ||
      target.startsWith('/') ||
      /^[a-z][a-z\d+.-]*:/i.test(target)
    ) {
      return match;
    }

    const { pathname, hash } = splitTarget(target);
    const normalized = path.posix.normalize(
      path.posix.join(config.sourceDirectory, path.posix.dirname(sourceName), pathname),
    );
    const docsPrefix = `${config.sourceDirectory}/`;
    if (normalized.startsWith(docsPrefix)) {
      const docsRelative = normalized.slice(docsPrefix.length);
      if (knownDocuments.has(docsRelative) && docsRelative.endsWith('.md')) {
        const slug = docsRelative.replace(/\.md$/, '').replaceAll('.', '');
        return `${open}../${slug}/${hash}${close}`;
      }
    }

    const repositoryPath = normalized.replace(/^\.\//, '');
    const pinnedUrl = `${config.repository}/blob/${config.ref}/${repositoryPath}${hash}`;
    return `${open}${pinnedUrl}${close}`;
  });
}

function renderDocument(sourceName, source) {
  const heading = source.match(/^#\s+(.+)$/m);
  const title =
    config.titleOverrides?.[sourceName] ??
    heading?.[1]?.trim() ??
    sourceName.replace(/\.md$/, '');
  const body = heading ? source.replace(`${heading[0]}\n`, '') : source;
  const sourceUrl = `${config.repository}/blob/${config.ref}/${config.sourceDirectory}/${sourceName}`;
  const digest = createHash('sha256').update(source).digest('hex');
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(`Referencia técnica de Baldr sincronizada desde ${config.ref}.`)}`,
    'editUrl: false',
    '---',
    '',
    `:::note[Fuente canónica · ${config.ref}]`,
    `Esta página se genera desde [\`${sourceName}\`](${sourceUrl}). No la edites en este repositorio.`,
    `Digest de la fuente: \`${digest}\`.`,
    ':::',
    '',
  ].join('\n');
  return `${frontmatter}${rewriteLinks(body, sourceName).trimStart()}`;
}

const expected = new Map();
for (const sourceName of config.documents) {
  const sourcePath = path.posix.join(config.sourceDirectory, sourceName);
  expected.set(sourceName, `${renderDocument(sourceName, gitShow(sourcePath)).trimEnd()}\n`);
}

let stale = false;
for (const [targetName, content] of expected) {
  const target = path.join(targetRoot, targetName);
  let current = null;
  try {
    current = await readFile(target, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (current === content) continue;
  stale = true;
  if (!checkOnly) {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
}

let existing = [];
try {
  existing = (await readdir(targetRoot)).filter((name) => name.endsWith('.md'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
for (const targetName of existing) {
  if (expected.has(targetName)) continue;
  stale = true;
  if (!checkOnly) await rm(path.join(targetRoot, targetName));
}

if (checkOnly && stale) {
  console.error(
    `La referencia técnica no coincide con ${config.repository}@${config.ref}. Ejecutá npm run sync:router-docs.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `${checkOnly ? 'Verificados' : 'Sincronizados'} ${expected.size} documentos desde ${config.ref}.`,
  );
}
