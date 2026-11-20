import { cp, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// GitHub Pages publishes this repository's main/docs folder.
// Keep it aligned with Vite's production output on every build.
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const buildDirectory = join(projectRoot, 'dist');
const pagesDirectory = join(projectRoot, 'docs');
const index = await readFile(join(buildDirectory, 'index.html'), 'utf8');

// Validate the build before replacing the published entry point.
const assetPaths = [...index.matchAll(/(?:src|href)="\/Portfolio\/(assets\/[^"?#]+)"/g)]
  .map((match) => match[1]);
if (assetPaths.length === 0) throw new Error('The production build has no local assets.');
await Promise.all(assetPaths.map((asset) => stat(join(buildDirectory, asset))));

await mkdir(pagesDirectory, { recursive: true });
const entries = await readdir(buildDirectory, { withFileTypes: true });
for (const entry of entries.filter((entry) => entry.name !== 'index.html')) {
  await cp(join(buildDirectory, entry.name), join(pagesDirectory, entry.name), {
    recursive: true,
    force: true,
  });
}
await cp(join(buildDirectory, 'index.html'), join(pagesDirectory, 'index.html'));
console.log(`GitHub Pages: synchronized docs with dist (${assetPaths.length} entry assets).`);
