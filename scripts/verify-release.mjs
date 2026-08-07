#!/usr/bin/env node

import { appendFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stableVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function validateRelease({ manifest, lockfile, refName }) {
  const errors = [];
  const version = manifest.version;

  if (manifest.name !== "write-project-readme") {
    errors.push(`package name must be write-project-readme, received ${manifest.name ?? "<missing>"}`);
  }

  if (typeof version !== "string" || !stableVersionPattern.test(version)) {
    errors.push(`package version must be a stable semantic version, received ${version ?? "<missing>"}`);
  }

  if (refName !== `v${version}`) {
    errors.push(`tag ${refName ?? "<missing>"} must equal v${version ?? "<missing>"}`);
  }

  if (lockfile.name !== manifest.name || lockfile.packages?.[""]?.name !== manifest.name) {
    errors.push("package-lock.json package names must match package.json");
  }

  if (lockfile.version !== version || lockfile.packages?.[""]?.version !== version) {
    errors.push("package-lock.json versions must match package.json");
  }

  if (manifest.repository?.url !== "git+https://github.com/montasim/write-project-readme.git") {
    errors.push("package repository URL must match the trusted GitHub repository");
  }

  if (manifest.publishConfig?.access !== "public" || manifest.publishConfig?.provenance !== true) {
    errors.push("publishConfig must require public access and provenance");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return { name: manifest.name, version };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function run() {
  const result = validateRelease({
    manifest: readJson(resolve(repositoryRoot, "package.json")),
    lockfile: readJson(resolve(repositoryRoot, "package-lock.json")),
    refName: process.env.GITHUB_REF_NAME,
  });

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `package=${result.name}\nversion=${result.version}\n`);
  }

  console.log(`Verified ${result.name}@${result.version} for tag v${result.version}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    run();
  } catch (error) {
    console.error(`release verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
