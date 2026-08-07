import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateRelease } from "../scripts/verify-release.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
const packageLock = JSON.parse(readFileSync(join(repositoryRoot, "package-lock.json"), "utf8"));
const workflow = readFileSync(join(repositoryRoot, ".github", "workflows", "publish.yml"), "utf8");

test("release metadata matches a stable version tag", () => {
  assert.deepEqual(
    validateRelease({
      manifest: packageJson,
      lockfile: packageLock,
      refName: `v${packageJson.version}`,
    }),
    { name: packageJson.name, version: packageJson.version },
  );
});

test("release verification rejects tag and lockfile drift", () => {
  assert.throws(
    () => validateRelease({ manifest: packageJson, lockfile: packageLock, refName: "v999.0.0" }),
    /must equal/,
  );

  const staleLock = structuredClone(packageLock);
  staleLock.packages[""].version = "0.0.0";
  assert.throws(
    () => validateRelease({ manifest: packageJson, lockfile: staleLock, refName: `v${packageJson.version}` }),
    /versions must match/,
  );
});

test("release verification rejects prereleases and untrusted repositories", () => {
  const prerelease = { ...packageJson, version: "1.0.0-beta.1" };
  const prereleaseLock = structuredClone(packageLock);
  prereleaseLock.version = prerelease.version;
  prereleaseLock.packages[""].version = prerelease.version;
  assert.throws(
    () => validateRelease({ manifest: prerelease, lockfile: prereleaseLock, refName: "v1.0.0-beta.1" }),
    /stable semantic version/,
  );

  const fork = {
    ...packageJson,
    repository: { type: "git", url: "git+https://github.com/example/write-project-readme.git" },
  };
  assert.throws(
    () => validateRelease({ manifest: fork, lockfile: packageLock, refName: `v${packageJson.version}` }),
    /trusted GitHub repository/,
  );
});

test("publish workflow keeps npm and GitHub release gates explicit", () => {
  assert.match(workflow, /tags:\s*\n\s+- 'v\*'/);
  assert.match(workflow, /github\.repository == 'montasim\/write-project-readme'/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /node scripts\/verify-release\.mjs/);
  assert.match(workflow, /npm publish --access public/);
  assert.match(workflow, /--package=write-project-readme@latest[\s\S]*--target codex/);
  assert.match(workflow, /--package=write-project-readme@latest[\s\S]*--target claude/);
  assert.match(workflow, /--package=write-project-readme@latest[\s\S]*--target both/);
  assert.match(workflow, /pnpx write-project-readme@latest/);
  assert.match(workflow, /gh release create/);
  assert.match(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /NPM_TOKEN|NODE_AUTH_TOKEN/);
});
