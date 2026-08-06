import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repositoryRoot, "bin", "readme-craft.js");

function run(args = [], env = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

test("prints help", () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Install the readme-craft skill for Codex/);
  assert.match(result.stdout, /--force/);
});

test("installs into CODEX_HOME", () => {
  const root = mkdtempSync(join(tmpdir(), "readme-craft-test-"));
  const codexHome = join(root, "codex-home");
  const result = run([], { CODEX_HOME: codexHome });
  const skillFile = join(codexHome, "skills", "readme-craft", "SKILL.md");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Installed readme-craft/);
  assert.match(readFileSync(skillFile, "utf8"), /name: readme-craft/);
});

test("refuses to overwrite unless forced", () => {
  const root = mkdtempSync(join(tmpdir(), "readme-craft-test-"));
  const skillsRoot = join(root, "skills");
  const first = run(["--path", skillsRoot]);
  const marker = join(skillsRoot, "readme-craft", "marker.txt");
  writeFileSync(marker, "preserve me");
  const refused = run(["--path", skillsRoot]);

  assert.equal(first.status, 0, first.stderr);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /already exists/);
  assert.equal(readFileSync(marker, "utf8"), "preserve me");

  const forced = run(["--path", skillsRoot, "--force"]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.throws(() => readFileSync(marker, "utf8"));
});

test("supports dry runs without creating files", () => {
  const root = mkdtempSync(join(tmpdir(), "readme-craft-test-"));
  const skillsRoot = join(root, "skills");
  const result = run(["--path", skillsRoot, "--dry-run"]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Would install readme-craft/);
});
