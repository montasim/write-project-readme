#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { readFileSync } from "node:fs";

const skillName = "readme-craft";
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillSource = join(packageRoot, "skills", skillName);
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

function usage() {
  return `README Craft ${packageJson.version}

Install the ${skillName} skill for Codex.

Usage:
  readme-craft [options]

Options:
  --path <directory>  Install below a custom skills directory
  --force             Replace an existing installation
  --dry-run           Print the destination without writing files
  --help, -h          Show this help
  --version, -v       Show the package version

Default destination:
  \${CODEX_HOME}/skills/${skillName}, when CODEX_HOME is set
  ~/.codex/skills/${skillName}, otherwise`;
}

function fail(message) {
  console.error(`readme-craft: ${message}`);
  process.exitCode = 1;
}

function parseArgs(args) {
  const options = { force: false, dryRun: false, path: undefined };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--force") options.force = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--version" || argument === "-v") options.version = true;
    else if (argument === "--path") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) throw new Error("--path requires a directory");
      options.path = value;
      index += 1;
    } else {
      throw new Error(`unknown option: ${argument}`);
    }
  }

  return options;
}

function install(options) {
  const skillsRoot = options.path
    ? resolve(options.path)
    : process.env.CODEX_HOME
      ? resolve(process.env.CODEX_HOME, "skills")
      : join(homedir(), ".codex", "skills");
  const destination = join(skillsRoot, skillName);

  if (options.dryRun) {
    console.log(`Would install ${skillName} to ${destination}`);
    return;
  }

  if (existsSync(destination) && !options.force) {
    throw new Error(`${destination} already exists; rerun with --force to replace it`);
  }

  mkdirSync(skillsRoot, { recursive: true });
  const temporary = join(skillsRoot, `.${skillName}-${process.pid}.tmp`);
  const backup = join(skillsRoot, `.${skillName}-${process.pid}.backup`);

  rmSync(temporary, { recursive: true, force: true });
  rmSync(backup, { recursive: true, force: true });

  try {
    cpSync(skillSource, temporary, { recursive: true });

    if (existsSync(destination)) renameSync(destination, backup);
    renameSync(temporary, destination);
    rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    rmSync(temporary, { recursive: true, force: true });
    if (!existsSync(destination) && existsSync(backup)) renameSync(backup, destination);
    throw error;
  }

  console.log(`Installed ${skillName} to ${destination}`);
  console.log(`Try: Use $${skillName} to improve this project's README.`);
}

try {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) console.log(usage());
  else if (options.version) console.log(packageJson.version);
  else install(options);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
