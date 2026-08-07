#!/usr/bin/env node

import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const skillName = "write-project-readme";
const legacySkillNames = ["readme-craft", "craft-project-readme"];
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillSource = join(packageRoot, "skills", skillName);
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

function usage() {
  return `Write Project README ${packageJson.version}

Install the ${skillName} skill for Codex.

Usage:
  write-project-readme [options]

Options:
  --path <directory>  Install below a custom skills directory
  --force             Replace the current ${skillName} installation
  --migrate           Replace legacy readme-craft installations
  --dry-run           Report changes without writing files
  --help, -h          Show this help
  --version, -v       Show the package version

Migration:
  --migrate recognizes readme-craft and craft-project-readme in the selected
  skills directory. If ${skillName} also exists, use --force --migrate.
  --force without --migrate replaces only ${skillName}.

Default destination:
  \${CODEX_HOME}/skills/${skillName}, when CODEX_HOME is set
  ~/.codex/skills/${skillName}, otherwise`;
}

function fail(message) {
  console.error(`write-project-readme: ${message}`);
  process.exitCode = 1;
}

function parseArgs(args) {
  const options = { force: false, migrate: false, dryRun: false, path: undefined };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--force") options.force = true;
    else if (argument === "--migrate") options.migrate = true;
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

function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

function pathStats(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function assertSafeDirectory(path, label, stats = pathStats(path)) {
  if (!stats?.isDirectory() || stats.isSymbolicLink()) {
    throw new Error(`${label} ${path} is not a regular directory; refusing to modify it`);
  }
}

function assertSafeSkillDirectory(path, label) {
  assertSafeDirectory(path, label);

  const manifest = join(path, "SKILL.md");
  const manifestStats = pathStats(manifest);
  if (!manifestStats?.isFile() || manifestStats.isSymbolicLink()) {
    throw new Error(`${label} is missing a regular SKILL.md file: ${manifest}`);
  }
}

function pathsOverlap(first, second) {
  const firstToSecond = relative(first, second);
  const secondToFirst = relative(second, first);
  const contains = (candidate) => candidate === "" || (!candidate.startsWith("..") && !isAbsolute(candidate));
  return contains(firstToSecond) || contains(secondToFirst);
}

function removeTransaction(transaction, warn = false) {
  try {
    rmSync(transaction, { recursive: true, force: true });
  } catch (error) {
    if (!warn) throw error;
    console.error(
      `write-project-readme: warning: installation succeeded, but transaction backups remain at ${transaction}: ${describeError(error)}`,
    );
  }
}

function stageSkill(skillsRoot) {
  assertSafeSkillDirectory(skillSource, "packaged skill source");

  mkdirSync(skillsRoot, { recursive: true });
  const transaction = mkdtempSync(join(skillsRoot, `.${skillName}-`));
  const staged = join(transaction, "staged");
  const backups = join(transaction, "backups");

  try {
    mkdirSync(backups);
    cpSync(skillSource, staged, { recursive: true });
    assertSafeSkillDirectory(staged, "staged skill");
  } catch (error) {
    try {
      removeTransaction(transaction);
    } catch (cleanupError) {
      throw new Error(
        `${describeError(error)}; staging cleanup failed and files remain at ${transaction}: ${describeError(cleanupError)}`,
      );
    }
    throw error;
  }

  return { backups, staged, transaction };
}

function rollbackInstallation(destination, movedTargets, installed, transaction) {
  const rollbackErrors = [];

  if (installed && pathStats(destination)) {
    try {
      rmSync(destination, { recursive: true, force: true });
    } catch (error) {
      rollbackErrors.push(`could not remove failed installation ${destination}: ${describeError(error)}`);
    }
  }

  for (const target of [...movedTargets].reverse()) {
    if (pathStats(target.path)) {
      rollbackErrors.push(`could not restore ${target.path}: the path is occupied`);
      continue;
    }
    if (!pathStats(target.backup)) {
      rollbackErrors.push(`could not restore ${target.path}: backup is missing at ${target.backup}`);
      continue;
    }

    try {
      renameSync(target.backup, target.path);
    } catch (error) {
      rollbackErrors.push(`could not restore ${target.path}: ${describeError(error)}`);
    }
  }

  if (rollbackErrors.length === 0) {
    try {
      removeTransaction(transaction);
    } catch (error) {
      rollbackErrors.push(`could not remove transaction ${transaction}: ${describeError(error)}`);
    }
  }

  return rollbackErrors;
}

function replaceInstallation(skillsRoot, destination, targets) {
  const { backups, staged, transaction } = stageSkill(skillsRoot);
  const movedTargets = [];
  let installed = false;

  try {
    for (const target of targets) {
      const backup = join(backups, target.name);
      renameSync(target.path, backup);
      movedTargets.push({ ...target, backup });
    }

    renameSync(staged, destination);
    installed = true;
    assertSafeSkillDirectory(destination, "installed skill");
  } catch (error) {
    const rollbackErrors = rollbackInstallation(destination, movedTargets, installed, transaction);
    if (rollbackErrors.length > 0) {
      throw new Error(
        `${describeError(error)}; rollback was incomplete and backups remain at ${transaction}: ${rollbackErrors.join("; ")}`,
      );
    }
    throw error;
  }

  removeTransaction(transaction, true);
}

function reportDryRun(skillsRoot, destination, targets) {
  const previewRoot = join(skillsRoot, `.${skillName}-<transaction>`);

  console.log(`Would stage packaged skill from ${skillSource} at ${join(previewRoot, "staged")}`);
  for (const target of targets) {
    console.log(`Would back up ${target.path} to ${join(previewRoot, "backups", target.name)}`);
  }
  console.log(`Would atomically install ${skillName} to ${destination}`);
}

function install(options) {
  const skillsRoot = options.path
    ? resolve(options.path)
    : process.env.CODEX_HOME
      ? resolve(process.env.CODEX_HOME, "skills")
      : join(homedir(), ".codex", "skills");
  const destination = join(skillsRoot, skillName);

  if (pathsOverlap(skillSource, destination)) {
    throw new Error(`destination ${destination} overlaps the packaged skill source; choose another --path`);
  }

  const skillsRootStats = pathStats(skillsRoot);
  if (skillsRootStats) assertSafeDirectory(skillsRoot, "skills directory", skillsRootStats);

  const destinationStats = pathStats(destination);
  if (destinationStats) assertSafeDirectory(destination, "destination", destinationStats);

  const legacyPaths = legacySkillNames
    .map((name) => ({ name, path: join(skillsRoot, name), stats: pathStats(join(skillsRoot, name)) }))
    .filter(({ stats }) => stats);

  for (const legacyPath of legacyPaths) {
    assertSafeDirectory(legacyPath.path, "legacy installation", legacyPath.stats);
  }

  if (!options.migrate && legacyPaths.length > 0) {
    throw new Error(
      `legacy installation${legacyPaths.length === 1 ? "" : "s"} found at ${legacyPaths.map(({ path }) => path).join(", ")}; rerun with --migrate`,
    );
  }

  if (options.migrate) {
    if (legacyPaths.length === 0) {
      throw new Error("--migrate requires a readme-craft or craft-project-readme installation");
    }
    if (destinationStats && !options.force) {
      throw new Error(`${destination} already exists; rerun with --force --migrate to replace it`);
    }

    const targets = [
      ...(destinationStats ? [{ name: skillName, path: destination }] : []),
      ...legacyPaths.map(({ name, path }) => ({ name, path })),
    ];

    if (options.dryRun) {
      reportDryRun(skillsRoot, destination, targets);
      return;
    }

    replaceInstallation(skillsRoot, destination, targets);
    console.log(`Installed ${skillName} to ${destination}`);
    console.log(
      `Removed legacy installation${legacyPaths.length === 1 ? "" : "s"}: ${legacyPaths.map(({ path }) => path).join(", ")}`,
    );
  } else {
    if (destinationStats && !options.force) {
      throw new Error(`${destination} already exists; rerun with --force to replace it`);
    }

    const targets = destinationStats ? [{ name: skillName, path: destination }] : [];
    if (options.dryRun) {
      reportDryRun(skillsRoot, destination, targets);
      return;
    }

    replaceInstallation(skillsRoot, destination, targets);
    console.log(`${destinationStats ? "Reinstalled" : "Installed"} ${skillName} to ${destination}`);
  }

  console.log(`Try: Use $${skillName} to generate this project's README.md.`);
}

try {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) console.log(usage());
  else if (options.version) console.log(packageJson.version);
  else install(options);
} catch (error) {
  fail(describeError(error));
}
