import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repositoryRoot, "bin", "write-project-readme.js");
const skillSource = join(repositoryRoot, "skills", "write-project-readme");

function run(args = [], env = {}, nodeArgs = []) {
  return spawnSync(process.execPath, [...nodeArgs, cli, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function temporaryRoot() {
  return mkdtempSync(join(tmpdir(), "write-project-readme-test-"));
}

function createInstallation(skillsRoot, name, marker = name) {
  const installation = join(skillsRoot, name);
  mkdirSync(installation, { recursive: true });
  writeFileSync(join(installation, "marker.txt"), marker);
  return installation;
}

function readMarker(installation) {
  return readFileSync(join(installation, "marker.txt"), "utf8");
}

function assertNoTransactions(skillsRoot) {
  const entries = existsSync(skillsRoot) ? readdirSync(skillsRoot) : [];
  assert.deepEqual(
    entries.filter((entry) => entry.startsWith(".write-project-readme-")),
    [],
  );
}

test("prints help with the new command and migration behavior", () => {
  const result = run(["--help"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Install the write-project-readme skill for Codex/);
  assert.match(result.stdout, /write-project-readme \[options\]/);
  assert.match(result.stdout, /--force --migrate/);
  assert.match(result.stdout, /--force without --migrate replaces only write-project-readme/);
});

test("installs write-project-readme into CODEX_HOME", () => {
  const root = temporaryRoot();
  const codexHome = join(root, "codex-home");
  const result = run([], { CODEX_HOME: codexHome });
  const skillFile = join(codexHome, "skills", "write-project-readme", "SKILL.md");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Installed write-project-readme/);
  assert.match(result.stdout, /\$write-project-readme/);
  assert.match(readFileSync(skillFile, "utf8"), /^name: write-project-readme$/m);
  assertNoTransactions(join(codexHome, "skills"));
});

test("refuses to replace the new destination unless forced", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const first = run(["--path", skillsRoot]);
  const destination = join(skillsRoot, "write-project-readme");
  const marker = join(destination, "marker.txt");
  writeFileSync(marker, "preserve me");

  const refused = run(["--path", skillsRoot]);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /already exists; rerun with --force/);
  assert.equal(readFileSync(marker, "utf8"), "preserve me");

  const forced = run(["--path", skillsRoot, "--force"]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(forced.stdout, /Reinstalled write-project-readme/);
  assert.equal(existsSync(marker), false);
  assert.match(readFileSync(join(destination, "SKILL.md"), "utf8"), /^name: write-project-readme$/m);
  assertNoTransactions(skillsRoot);
});

test("supports a fresh dry run without creating the skills directory", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const result = run(["--path", skillsRoot, "--dry-run"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Would stage packaged skill/);
  assert.match(result.stdout, /Would atomically install write-project-readme/);
  assert.ok(result.stdout.includes(skillSource));
  assert.ok(result.stdout.includes(join(skillsRoot, "write-project-readme")));
  assert.equal(existsSync(skillsRoot), false);
});

test("normal installs refuse legacy directories before writing, even with --force", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const legacy = createInstallation(skillsRoot, "readme-craft", "legacy stays");

  for (const extraArgs of [[], ["--force"]]) {
    const result = run(["--path", skillsRoot, ...extraArgs]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /legacy installation found/);
    assert.match(result.stderr, /rerun with --migrate/);
    assert.equal(readMarker(legacy), "legacy stays");
    assert.equal(existsSync(join(skillsRoot, "write-project-readme")), false);
    assertNoTransactions(skillsRoot);
  }
});

test("--migrate requires at least one legacy installation and writes nothing", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const result = run(["--path", skillsRoot, "--migrate"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--migrate requires a readme-craft or craft-project-readme installation/);
  assert.equal(existsSync(skillsRoot), false);
});

test("migrates a readme-craft installation", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const legacy = createInstallation(skillsRoot, "readme-craft", "old readme-craft");
  const destination = join(skillsRoot, "write-project-readme");
  const result = run(["--path", skillsRoot, "--migrate"]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(legacy), false);
  assert.match(readFileSync(join(destination, "SKILL.md"), "utf8"), /^name: write-project-readme$/m);
  assert.match(result.stdout, /Removed legacy installation:/);
  assert.ok(result.stdout.includes(legacy));
  assertNoTransactions(skillsRoot);
});

test("migrates both recognized legacy installations in one transaction", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const firstLegacy = createInstallation(skillsRoot, "readme-craft", "first legacy");
  const secondLegacy = createInstallation(skillsRoot, "craft-project-readme", "second legacy");
  const destination = join(skillsRoot, "write-project-readme");
  const result = run(["--path", skillsRoot, "--migrate"]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(firstLegacy), false);
  assert.equal(existsSync(secondLegacy), false);
  assert.match(readFileSync(join(destination, "SKILL.md"), "utf8"), /^name: write-project-readme$/m);
  assert.match(result.stdout, /Removed legacy installations:/);
  assert.ok(result.stdout.includes(firstLegacy));
  assert.ok(result.stdout.includes(secondLegacy));
  assertNoTransactions(skillsRoot);
});

test("migration preserves all installs until --force --migrate authorizes replacement", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const destination = createInstallation(skillsRoot, "write-project-readme", "current install");
  const legacy = createInstallation(skillsRoot, "readme-craft", "legacy install");

  const refused = run(["--path", skillsRoot, "--migrate"]);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /rerun with --force --migrate/);
  assert.equal(readMarker(destination), "current install");
  assert.equal(readMarker(legacy), "legacy install");
  assertNoTransactions(skillsRoot);

  const migrated = run(["--path", skillsRoot, "--force", "--migrate"]);
  assert.equal(migrated.status, 0, migrated.stderr);
  assert.equal(existsSync(join(destination, "marker.txt")), false);
  assert.equal(existsSync(legacy), false);
  assert.match(readFileSync(join(destination, "SKILL.md"), "utf8"), /^name: write-project-readme$/m);
  assertNoTransactions(skillsRoot);
});

test("--dry-run --migrate reports sources, backups, and destination without writes", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  const destination = createInstallation(skillsRoot, "write-project-readme", "current install");
  const firstLegacy = createInstallation(skillsRoot, "readme-craft", "first legacy");
  const secondLegacy = createInstallation(skillsRoot, "craft-project-readme", "second legacy");
  const before = readdirSync(skillsRoot).sort();

  const result = run(["--path", skillsRoot, "--force", "--migrate", "--dry-run"]);

  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes(`Would stage packaged skill from ${skillSource}`));
  for (const source of [destination, firstLegacy, secondLegacy]) {
    assert.ok(result.stdout.includes(`Would back up ${source}`));
  }
  assert.match(result.stdout, /\.write-project-readme-<transaction>\/backups\/write-project-readme/);
  assert.match(result.stdout, /\.write-project-readme-<transaction>\/backups\/readme-craft/);
  assert.match(result.stdout, /\.write-project-readme-<transaction>\/backups\/craft-project-readme/);
  assert.ok(result.stdout.includes(`Would atomically install write-project-readme to ${destination}`));
  assert.deepEqual(readdirSync(skillsRoot).sort(), before);
  assert.equal(readMarker(destination), "current install");
  assert.equal(readMarker(firstLegacy), "first legacy");
  assert.equal(readMarker(secondLegacy), "second legacy");
  assertNoTransactions(skillsRoot);
});

test("rejects non-directory installation targets", () => {
  const skillsRoot = join(temporaryRoot(), "skills");
  mkdirSync(skillsRoot, { recursive: true });
  const destination = join(skillsRoot, "write-project-readme");
  writeFileSync(destination, "not a directory");

  const result = run(["--path", skillsRoot, "--force"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /is not a regular directory; refusing to modify it/);
  assert.equal(readFileSync(destination, "utf8"), "not a directory");
  assertNoTransactions(skillsRoot);
});

test(
  "rejects symlinked legacy targets",
  { skip: process.platform === "win32" },
  () => {
    const root = temporaryRoot();
    const skillsRoot = join(root, "skills");
    const outside = createInstallation(root, "outside", "outside stays");
    mkdirSync(skillsRoot, { recursive: true });
    const legacy = join(skillsRoot, "readme-craft");
    symlinkSync(outside, legacy, "dir");

    const result = run(["--path", skillsRoot, "--migrate"]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /legacy installation .* is not a regular directory; refusing to modify it/);
    assert.equal(readMarker(outside), "outside stays");
    assert.equal(existsSync(join(skillsRoot, "write-project-readme")), false);
    assertNoTransactions(skillsRoot);
  },
);

test("restores destination and every legacy directory when atomic publish fails", () => {
  const root = temporaryRoot();
  const skillsRoot = join(root, "skills");
  const destination = createInstallation(skillsRoot, "write-project-readme", "current install");
  const firstLegacy = createInstallation(skillsRoot, "readme-craft", "first legacy");
  const secondLegacy = createInstallation(skillsRoot, "craft-project-readme", "second legacy");
  const preload = join(root, "fail-publish.cjs");

  writeFileSync(
    preload,
    `const fs = require("node:fs");
const path = require("node:path");
const { syncBuiltinESMExports } = require("node:module");
const originalRenameSync = fs.renameSync;
fs.renameSync = function (source, target) {
  if (path.basename(String(source)) === "staged") {
    const error = new Error("simulated atomic publish failure");
    error.code = "EIO";
    throw error;
  }
  return originalRenameSync(source, target);
};
syncBuiltinESMExports();
`,
  );

  const result = run(
    ["--path", skillsRoot, "--force", "--migrate"],
    {},
    ["--require", preload],
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /simulated atomic publish failure/);
  assert.equal(readMarker(destination), "current install");
  assert.equal(readMarker(firstLegacy), "first legacy");
  assert.equal(readMarker(secondLegacy), "second legacy");
  assertNoTransactions(skillsRoot);
});
