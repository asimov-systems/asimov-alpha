import { mkdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync, zipSync, type Zippable } from "fflate";

const tools = fileURLToPath(new URL("../", import.meta.url));
const root = fileURLToPath(new URL("../../", import.meta.url));
const outputDirectory = join(root, "dist");
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const targets = [
  "linux-arm-gnu",
  "linux-arm-musl",
  "linux-x86-gnu",
  "linux-x86-musl",
  "macos-arm",
  // "macos-x86",
  "windows-x64",
] as const;

type Target = (typeof targets)[number];
type ArchiveFiles = Map<string, Uint8Array>;
type ZipEntry = { path: string; data: Uint8Array; mode: number };
type ReleaseAsset = { id: number; name: string; browser_download_url: string };
type Release = { tag_name: string; assets: ReleaseAsset[] };
type Options = {
  cli: string;
  modules: Map<string, string>;
  skills: string;
  targets: Target[];
};

type ModuleDefinition = {
  repository: string;
  artifact: string;
  authenticated: boolean;
};

const moduleDefinitions: Record<string, ModuleDefinition> = {
  social: {
    repository: "asimov-systems/asimov-sandbox",
    artifact: "asimov-social-module",
    authenticated: true,
  },
};

function sha256(data: Uint8Array): string {
  return new Bun.CryptoHasher("sha256").update(data).digest("hex");
}

async function extractArchive(name: string, data: Uint8Array): Promise<ArchiveFiles> {
  if (name.endsWith(".zip")) return new Map(Object.entries(unzipSync(data)));
  if (!name.endsWith(".tar.gz")) throw new Error(`unsupported archive type: ${name}`);

  const files: ArchiveFiles = new Map();
  for (const [path, file] of await new Bun.Archive(data).files()) {
    files.set(path, await file.bytes());
  }
  return files;
}

function findFile(files: ArchiveFiles, expectedBasename: string): Uint8Array {
  const matches = [...files].filter(([path]) => basename(path) === expectedBasename);
  if (matches.length !== 1) {
    throw new Error(`expected exactly one ${expectedBasename} in archive, found ${matches.length}`);
  }
  return matches[0][1];
}

function findReadme(files: ArchiveFiles): Uint8Array | undefined {
  const matches = [...files].filter(([path]) => basename(path).toUpperCase().startsWith("README"));
  if (matches.length > 1) {
    throw new Error(`expected at most one README in archive, found ${matches.length}`);
  }
  return matches[0]?.[1];
}

async function request(
  url: string,
  authenticated = false,
  accept = "application/vnd.github+json",
): Promise<Response> {
  const token = process.env.SANDBOX_RELEASES_TOKEN?.trim();
  if (authenticated && !token) {
    throw new Error(
      "SANDBOX_RELEASES_TOKEN is required to read the private asimov-sandbox release; see README.md",
    );
  }
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "asimov-alpha-packager",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(authenticated ? { Authorization: `Bearer ${token}` } : {}),
    },
    redirect: "follow",
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 500).trim();
    throw new Error(
      `GitHub request failed (${response.status} ${response.statusText}): ${url}${body ? `\n${body}` : ""}`,
    );
  }
  return response;
}

async function resolveRelease(
  repository: string,
  requested: string,
  authenticated: boolean,
): Promise<Release> {
  const selector = requested === "latest" ? "latest" : `tags/${encodeURIComponent(requested)}`;
  return request(
    `https://api.github.com/repos/${repository}/releases/${selector}`,
    authenticated,
  ).then((response) => response.json()) as Promise<Release>;
}

function releaseAsset(release: Release, name: string): ReleaseAsset {
  const asset = release.assets.find((candidate) => candidate.name === name);
  if (!asset) {
    throw new Error(
      `release ${release.tag_name} does not contain ${name}; available assets:\n${release.assets.map((item) => `  ${item.name}`).join("\n")}`,
    );
  }
  return asset;
}

async function downloadAsset(
  repository: string,
  asset: ReleaseAsset,
  authenticated: boolean,
): Promise<Uint8Array> {
  const response = authenticated
    ? await request(
        `https://api.github.com/repos/${repository}/releases/assets/${asset.id}`,
        true,
        "application/octet-stream",
      )
    : await request(asset.browser_download_url, false, "application/octet-stream");
  return new Uint8Array(await response.arrayBuffer());
}

async function verifiedReleaseArchive(
  repository: string,
  release: Release,
  assetName: string,
  authenticated: boolean,
): Promise<{ data: Uint8Array; sha256: string }> {
  const asset = releaseAsset(release, assetName);
  const checksumAsset = releaseAsset(release, `${assetName}.sha256`);
  const [data, checksumData] = await Promise.all([
    downloadAsset(repository, asset, authenticated),
    downloadAsset(repository, checksumAsset, authenticated),
  ]);
  const expected = decoder
    .decode(checksumData)
    .match(/\b[0-9a-fA-F]{64}\b/)?.[0]
    ?.toLowerCase();
  if (!expected) throw new Error(`invalid checksum file: ${checksumAsset.name}`);
  const actual = sha256(data);
  if (actual !== expected)
    throw new Error(`checksum mismatch for ${assetName}: expected ${expected}, got ${actual}`);
  return { data, sha256: actual };
}

async function resolveSkill(
  requested: string,
): Promise<{ commit: string; skill: Map<string, Uint8Array> }> {
  const reference = requested === "latest" ? "HEAD" : requested;
  const response = await request(
    `https://api.github.com/repos/asimov-platform/skills/commits/${encodeURIComponent(reference)}`,
  );
  const commit = (await response.json()) as { sha: string };
  const archiveResponse = await request(
    `https://codeload.github.com/asimov-platform/skills/tar.gz/${commit.sha}`,
    false,
    "application/gzip",
  );
  const files = await extractArchive(
    "skills.tar.gz",
    new Uint8Array(await archiveResponse.arrayBuffer()),
  );
  const prefix = "/skills/asimov/";
  const skill = new Map(
    [...files].flatMap(([path, data]) => {
      const index = path.indexOf(prefix);
      if (index === -1) return [];
      const relative = path.slice(index + prefix.length);
      return relative === "" || relative.endsWith("/") ? [] : [[relative, data] as const];
    }),
  );
  if (!skill.has("SKILL.md")) throw new Error("skills/asimov/SKILL.md is missing");
  return { commit: commit.sha, skill };
}

function parseOptions(arguments_: string[]): Options {
  const options: Options = {
    cli: "latest",
    modules: new Map([["social", "latest"]]),
    skills: "latest",
    targets: [],
  };
  for (let index = 0; index < arguments_.length; index++) {
    const argument = arguments_[index];
    if (argument === "--help" || argument === "-h") {
      console.log(`usage: bun run zip [options]

options:
  --cli <tag|latest>          CLI release (default: latest)
  --modules <name/tag,...>    Module releases (default: social/latest)
  --skills <ref|latest>       Skills tag, commit, or default-branch HEAD (default: latest)
  --target <name>             Build one target; repeat to build several (default: all)
  -h, --help                  Show this help

targets:
  ${targets.join("\n  ")}`);
      process.exit(0);
    }
    if (!["--cli", "--modules", "--skills", "--target"].includes(argument)) {
      throw new Error(`unknown option: ${argument}`);
    }
    const value = arguments_[++index];
    if (!value) throw new Error(`missing value for ${argument}`);
    if (argument === "--cli") options.cli = value;
    if (argument === "--modules") {
      options.modules.clear();
      for (const item of value.split(",")) {
        const [name, release, extra] = item.trim().split("/");
        if (!name || !release || extra !== undefined) {
          throw new Error(`invalid module selection: ${item}; expected name/tag`);
        }
        if (!moduleDefinitions[name]) {
          throw new Error(`unknown module: ${name}; available: ${Object.keys(moduleDefinitions)}`);
        }
        options.modules.set(name, release);
      }
    }
    if (argument === "--skills") options.skills = value;
    if (argument === "--target") {
      if (!targets.includes(value as Target)) throw new Error(`unknown target: ${value}`);
      if (!options.targets.includes(value as Target)) options.targets.push(value as Target);
    }
  }
  if (options.targets.length === 0) options.targets = [...targets];
  return options;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const version = (await Bun.file(join(root, "VERSION")).text()).trim();
  const [cliRelease, skill, readme, install, uninstall] = await Promise.all([
    resolveRelease("asimov-platform/asimov-cli", options.cli, false),
    resolveSkill(options.skills),
    Bun.file(join(tools, "bundle/README.md")).bytes(),
    Bun.file(join(tools, "bundle/install.sh")).bytes(),
    Bun.file(join(tools, "bundle/uninstall.sh")).bytes(),
  ]);
  const modules = await Promise.all(
    [...options.modules].map(async ([name, requested]) => {
      const definition = moduleDefinitions[name];
      return {
        name,
        requested,
        ...definition,
        release: await resolveRelease(definition.repository, requested, definition.authenticated),
      };
    }),
  );

  if (options.modules.has("social")) {
    const snippet = await Bun.file(join(tools, "bundle/social-skill.md")).text();
    const upstream = decoder.decode(skill.skill.get("SKILL.md")!);
    skill.skill.set("SKILL.md", encoder.encode(`${upstream.trimEnd()}\n\n${snippet.trim()}\n`));
  }

  console.log(`ASIMOV Alpha ${version}`);
  console.log(`  CLI:    ${cliRelease.tag_name}`);
  for (const module of modules) console.log(`  ${module.name}: ${module.release.tag_name}`);
  console.log(`  Skills: ${skill.commit}`);

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  const checksums: string[] = [];

  for (const target of options.targets) {
    const extension = target === "windows-x64" ? ".zip" : ".tar.gz";
    const executableExtension = target === "windows-x64" ? ".exe" : "";
    const cliAssetName = `asimov-cli-${target}${extension}`;
    console.log(`  Building ${target}...`);

    const [cliArchive, ...moduleArchives] = await Promise.all([
      verifiedReleaseArchive("asimov-platform/asimov-cli", cliRelease, cliAssetName, false),
      ...modules.map((module) =>
        verifiedReleaseArchive(
          module.repository,
          module.release,
          `${module.artifact}-${target}${extension}`,
          module.authenticated,
        ),
      ),
    ]);
    const [cliFiles, ...moduleFiles] = await Promise.all([
      extractArchive(cliAssetName, cliArchive.data),
      ...modules.map((module, index) =>
        extractArchive(`${module.artifact}-${target}${extension}`, moduleArchives[index].data),
      ),
    ]);
    const cli = findFile(cliFiles, `asimov${executableExtension}`);
    const bundledModules = modules.map((module, index) => {
      const files = moduleFiles[index];
      const manifest = findFile(files, "asimov-module.json");
      const parsedManifest = JSON.parse(decoder.decode(manifest)) as {
        name?: string;
        provides?: { programs?: string[] };
      };
      if (parsedManifest.name !== module.name) {
        throw new Error(`expected module ${module.name}, found ${parsedManifest.name}`);
      }
      const programs = parsedManifest.provides?.programs;
      if (!programs?.length) throw new Error(`${module.name} manifest does not list any programs`);
      return { ...module, files, manifest, programs, archive: moduleArchives[index] };
    });

    const archiveName = `asimov-alpha-${version}-${target}`;
    const top = `${archiveName}/`;
    const sources = {
      version,
      target,
      components: {
        "asimov-cli": {
          repository: "https://github.com/asimov-platform/asimov-cli",
          requested: options.cli,
          release: cliRelease.tag_name,
          asset: cliAssetName,
          sha256: cliArchive.sha256,
        },
        ...Object.fromEntries(
          bundledModules.map((module) => [
            module.artifact,
            {
              repository: `https://github.com/${module.repository}`,
              requested: module.requested,
              release: module.release.tag_name,
              asset: `${module.artifact}-${target}${extension}`,
              sha256: module.archive.sha256,
            },
          ]),
        ),
        "asimov-skill": {
          repository: "https://github.com/asimov-platform/skills",
          requested: options.skills,
          commit: skill.commit,
        },
      },
    };
    const entries: ZipEntry[] = [
      { path: `${top}README.md`, data: readme, mode: 0o100644 },
      { path: `${top}VERSION`, data: encoder.encode(`${version}\n`), mode: 0o100644 },
      {
        path: `${top}SOURCES.json`,
        data: encoder.encode(`${JSON.stringify(sources, null, 2)}\n`),
        mode: 0o100644,
      },
      { path: `${top}install.sh`, data: install, mode: 0o100755 },
      { path: `${top}uninstall.sh`, data: uninstall, mode: 0o100755 },
      { path: `${top}asimov/bin/asimov${executableExtension}`, data: cli, mode: 0o100755 },
      ...[...skill.skill].map(([path, data]) => ({
        path: `${top}asimov/skills/asimov/${path}`,
        data,
        mode: 0o100644,
      })),
    ];
    for (const module of bundledModules) {
      entries.push({
        path: `${top}asimov/modules/installed/${module.name}/manifest.json`,
        data: module.manifest,
        mode: 0o100644,
      });
      const readme = findReadme(module.files);
      if (readme) {
        entries.push({
          path: `${top}asimov/modules/installed/${module.name}/doc/README.md`,
          data: readme,
          mode: 0o100644,
        });
      }
      for (const program of module.programs) {
        entries.push({
          path: `${top}asimov/modules/installed/${module.name}/bin/${program}`,
          data: findFile(module.files, `${program}${executableExtension}`),
          mode: 0o100755,
        });
      }
    }

    const zipEntries: Zippable = {};
    for (const entry of entries) {
      zipEntries[entry.path] = [
        entry.data,
        {
          level: 9,
          mtime: new Date(1980, 0, 1),
          os: 3,
          attrs: (entry.mode & 0xffff) * 0x10000,
        },
      ];
    }
    const zip = zipSync(zipEntries);
    const filename = `${archiveName}.zip`;
    const checksum = sha256(zip);
    await Bun.write(join(outputDirectory, filename), zip);
    await Bun.write(join(outputDirectory, `${filename}.sha256`), `${checksum}  ${filename}\n`);
    checksums.push(`${checksum}  ${filename}`);
  }

  await Bun.write(join(outputDirectory, "SHA256SUMS.txt"), `${checksums.join("\n")}\n`);
  console.log(`Wrote ${checksums.length} bundles to ${outputDirectory}`);
}

if (import.meta.main) {
  await main();
}
