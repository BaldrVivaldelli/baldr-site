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

function applyLocalizationReplacements(markdown, sourceName, locale) {
  const replacements = config.localizationReplacements?.[locale]?.[sourceName] ?? {};
  return Object.entries(replacements).reduce(
    (content, [source, replacement]) => content.replaceAll(source, replacement),
    markdown,
  );
}

function renderDocument(sourceName, localizedSource, canonicalSource, locale) {
  const heading = localizedSource.match(/^#\s+(.+)$/m);
  const title = heading?.[1]?.trim() ?? sourceName.replace(/\.md$/, '');
  const body = heading
    ? localizedSource.replace(`${heading[0]}\n`, '')
    : localizedSource;
  const sourceUrl = `${config.repository}/blob/${config.ref}/${config.sourceDirectory}/${sourceName}`;
  const digest = createHash('sha256').update(canonicalSource).digest('hex');
  const copy = locale === 'es'
    ? {
        description: `Referencia técnica de Baldr sincronizada desde ${config.ref}.`,
        note: `Fuente canónica · ${config.ref}`,
        provenance: `Esta página se genera desde [\`${sourceName}\`](${sourceUrl}). No la edites en este repositorio.`,
        digest: 'Digest de la fuente',
      }
    : {
        description: `Baldr technical reference synchronized from ${config.ref}.`,
        note: `Canonical source · ${config.ref}`,
        provenance: `This page is generated from [\`${sourceName}\`](${sourceUrl}). Do not edit it in this repository.`,
        digest: 'Source digest',
      };
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(copy.description)}`,
    'editUrl: false',
    '---',
    '',
    `:::note[${copy.note}]`,
    copy.provenance,
    `${copy.digest}: \`${digest}\`.`,
    ':::',
    '',
  ].join('\n');
  return `${frontmatter}${rewriteLinks(body, sourceName).trimStart()}`;
}

const canonicalSources = new Map();
for (const sourceName of config.documents) {
  const sourcePath = path.posix.join(config.sourceDirectory, sourceName);
  canonicalSources.set(sourceName, gitShow(sourcePath));
}

let stale = false;
let documentCount = 0;
for (const [locale, localeConfig] of Object.entries(config.locales)) {
  const targetRoot = path.join(root, localeConfig.targetDirectory);
  const expected = new Map();
  for (const sourceName of config.documents) {
    const canonicalSource = canonicalSources.get(sourceName);
    const sourceLocale = config.sourceLocales[sourceName] ?? 'en';
    const translationPath = path.join(root, localeConfig.translationsDirectory, sourceName);
    let localizedSource = canonicalSource;
    try {
      localizedSource = await readFile(translationPath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      if (sourceLocale !== locale) {
        throw new Error(`Missing ${locale} translation for ${sourceName}: ${translationPath}`);
      }
    }
    localizedSource = applyLocalizationReplacements(localizedSource, sourceName, locale);
    expected.set(
      sourceName,
      `${renderDocument(sourceName, localizedSource, canonicalSource, locale).trimEnd()}\n`,
    );
  }

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
  documentCount += expected.size;
}

if (checkOnly && stale) {
  console.error(
    `Technical references do not match ${config.repository}@${config.ref}. Run npm run sync:router-docs.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `${checkOnly ? 'Verified' : 'Synchronized'} ${documentCount} localized documents from ${config.ref}.`,
  );
}
