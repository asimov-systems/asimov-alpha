import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const requested = process.argv[2];

if (!requested || process.argv.length !== 3) {
  console.error("usage: bun run bump <version>");
  process.exit(2);
}
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(requested)) {
  throw new Error(`invalid version: ${requested}`);
}

const versionPath = join(root, "VERSION");
const current = (await Bun.file(versionPath).text()).trim();
if (requested === current) throw new Error(`VERSION is already ${requested}`);

const changesPath = join(root, "CHANGES.md");
const changes = await Bun.file(changesPath).text();
const firstRelease = changes.search(/^## /m);
const heading = `## ${requested} - ${new Date().toISOString().slice(0, 10)}\n\n`;
const nextChanges =
  firstRelease === -1
    ? `${changes.trimEnd()}\n\n${heading}`
    : `${changes.slice(0, firstRelease)}${heading}${changes.slice(firstRelease)}`;

await Bun.write(versionPath, `${requested}\n`);
await Bun.write(changesPath, nextChanges);
console.log(`bumped ${current} -> ${requested}`);
