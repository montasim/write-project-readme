#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  accessSync,
  constants,
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { homedir } from "node:os";
import {
  basename,
  delimiter,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const skillName = "write-project-readme";
const legacySkillNames = ["readme-craft", "craft-project-readme"];
const validTargets = new Set(["auto", "codex", "claude", "both"]);
const validScopes = new Set(["user", "project"]);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillSource = join(packageRoot, "skills", skillName);
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

function usage() {
  return `Write Project README ${packageJson.version}

Install the ${skillName} skill for Codex, Claude Code, or both agents.

Usage:
  write-project-readme [options]

Options:
  --target <agent>    auto, codex, claude, or both (default: auto)
  --scope <scope>     user or project (default: user)
  --path <directory>  Use an exact custom skills root
  --force             Replace an existing ${skillName} installation
  --migrate           Move recognized legacy installations to current roots
  --dry-run           Report every planned change without writing files
  --help, -h          Show this help
  --version, -v       Show the package version

Destinations:
  Codex user          ~/.agents/skills/${skillName}
  Codex project       <git-root>/.agents/skills/${skillName}
  Claude Code user    \${CLAUDE_CONFIG_DIR:-~/.claude}/skills/${skillName}
  Claude Code project <git-root>/.claude/skills/${skillName}

Detection:
  auto installs only when exactly one supported agent is detected. If both or
  neither are detected, select --target codex, --target claude, or --target both.
  Detection inspects environment variables, agent directories, and PATH; it
  never executes an agent command.

Migration:
  Codex migration recognizes readme-craft, craft-project-readme, and previous
  ${skillName} installs under legacy .codex roots. Claude Code migration
  recognizes the legacy names under its selected skills root. Existing current
  destinations require --force --migrate. --target both may migrate one agent
  while freshly installing the other.

Constraints:
  --path cannot be combined with --target both or an explicit --scope.`;
}

function fail(message) {
  console.error(`write-project-readme: ${message}`);
  process.exitCode = 1;
}

function parseArgs(args) {
  const options = {
    dryRun: false,
    force: false,
    migrate: false,
    path: undefined,
    scope: "user",
    scopeExplicit: false,
    target: "auto",
  };

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
      if (options.path !== undefined) throw new Error("--path may be specified only once");
      options.path = value;
      index += 1;
    } else if (argument === "--target") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) throw new Error("--target requires auto, codex, claude, or both");
      if (!validTargets.has(value)) {
        throw new Error(`invalid --target ${value}; expected auto, codex, claude, or both`);
      }
      options.target = value;
      index += 1;
    } else if (argument === "--scope") {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) throw new Error("--scope requires user or project");
      if (!validScopes.has(value)) throw new Error(`invalid --scope ${value}; expected user or project`);
      options.scope = value;
      options.scopeExplicit = true;
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
  const canonicalFirst = canonicalKey(first);
  const canonicalSecond = canonicalKey(second);
  const firstToSecond = relative(canonicalFirst, canonicalSecond);
  const secondToFirst = relative(canonicalSecond, canonicalFirst);
  const contains = (candidate) => candidate === "" || (!candidate.startsWith("..") && !isAbsolute(candidate));
  return contains(firstToSecond) || contains(secondToFirst);
}

function canonicalPath(path) {
  let current = resolve(path);
  const missingSegments = [];

  while (!pathStats(current)) {
    const parent = dirname(current);
    if (parent === current) return current;
    missingSegments.unshift(basename(current));
    current = parent;
  }

  try {
    return resolve(realpathSync(current), ...missingSegments);
  } catch (error) {
    throw new Error(`cannot safely resolve ${path}: ${describeError(error)}`);
  }
}

function canonicalKey(path) {
  const canonical = canonicalPath(path);
  return process.platform === "win32" ? canonical.toLowerCase() : canonical;
}

function samePath(first, second) {
  return canonicalKey(first) === canonicalKey(second);
}

function uniquePaths(paths) {
  const seen = new Set();
  return paths.filter((path) => {
    const key = canonicalKey(path);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function projectRoot() {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: process.cwd(),
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status === 0 && result.stdout.trim()) return resolve(result.stdout.trim());
  return resolve(process.cwd());
}

function isExecutableOnPath(command) {
  const pathValue = process.env.PATH;
  if (!pathValue) return false;

  const extensions = process.platform === "win32"
    ? (process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD")
        .split(";")
        .filter(Boolean)
    : [""];

  for (const rawEntry of pathValue.split(delimiter)) {
    const trimmed = rawEntry.trim();
    const entry = trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')
      ? trimmed.slice(1, -1)
      : trimmed || ".";
    for (const extension of extensions) {
      const candidate = join(entry, process.platform === "win32" ? `${command}${extension}` : command);
      try {
        if (!statSync(candidate).isFile()) continue;
        if (process.platform !== "win32") accessSync(candidate, constants.X_OK);
        return true;
      } catch {
        // Continue scanning PATH. Detection is intentionally best-effort.
      }
    }
  }

  return false;
}

function hasPathSignal(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function detectAgents(root) {
  const home = homedir();
  const codex = Boolean(
    process.env.CODEX_HOME
      || hasPathSignal(join(home, ".agents"))
      || hasPathSignal(join(root, ".agents"))
      || hasPathSignal(join(home, ".codex"))
      || hasPathSignal(join(root, ".codex"))
      || isExecutableOnPath("codex"),
  );
  const claude = Boolean(
    process.env.CLAUDE_CONFIG_DIR
      || hasPathSignal(join(home, ".claude"))
      || hasPathSignal(join(root, ".claude"))
      || isExecutableOnPath("claude"),
  );

  return { claude, codex };
}

function resolveTarget(requestedTarget, root) {
  if (requestedTarget !== "auto") return requestedTarget;

  const detected = detectAgents(root);
  if (detected.codex && detected.claude) {
    throw new Error(
      "auto-detection found both Codex and Claude Code; rerun with --target codex, --target claude, or --target both",
    );
  }
  if (!detected.codex && !detected.claude) {
    throw new Error(
      "auto-detection found neither Codex nor Claude Code; rerun with --target codex, --target claude, or --target both",
    );
  }
  return detected.codex ? "codex" : "claude";
}

function selectedSkillsRoot(agent, options, root) {
  if (options.path) return resolve(options.path);

  if (options.scope === "project") {
    return join(root, agent === "codex" ? ".agents" : ".claude", "skills");
  }

  if (agent === "codex") return join(homedir(), ".agents", "skills");
  const claudeRoot = process.env.CLAUDE_CONFIG_DIR
    ? resolve(process.env.CLAUDE_CONFIG_DIR)
    : join(homedir(), ".claude");
  return join(claudeRoot, "skills");
}

function codexLegacyRoots(options, root) {
  // A custom path is an exact, isolated skills root. Never inspect or mutate
  // unrelated global/project legacy roots when the caller selects one.
  if (options.path) return [];

  if (options.scope === "project") return [join(root, ".codex", "skills")];
  return uniquePaths([
    ...(process.env.CODEX_HOME ? [resolve(process.env.CODEX_HOME, "skills")] : []),
    join(homedir(), ".codex", "skills"),
  ]);
}

function makeTargets(resolvedTarget, options, root) {
  const agents = resolvedTarget === "both" ? ["codex", "claude"] : [resolvedTarget];
  return agents.map((agent) => {
    const skillsRoot = selectedSkillsRoot(agent, options, root);
    return {
      agent,
      destination: join(skillsRoot, skillName),
      label: agent === "codex" ? "Codex" : "Claude Code",
      legacyRoots: agent === "codex" ? codexLegacyRoots(options, root) : [],
      skillsRoot,
    };
  });
}

function validateOptions(options, resolvedTarget) {
  if (options.path && options.scopeExplicit) {
    throw new Error("--path cannot be combined with --scope; a custom path is already an exact skills root");
  }
  if (options.path && resolvedTarget === "both") {
    throw new Error("--path cannot be combined with --target both; select one agent or omit --path");
  }
}

function assertNoTargetOverlap(targets) {
  for (let firstIndex = 0; firstIndex < targets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < targets.length; secondIndex += 1) {
      const first = targets[firstIndex];
      const second = targets[secondIndex];
      if (pathsOverlap(first.skillsRoot, second.skillsRoot)) {
        throw new Error(
          `${first.label} skills root ${first.skillsRoot} overlaps ${second.label} skills root ${second.skillsRoot}; configure distinct roots`,
        );
      }
    }
  }
}

function inspectPlan(targets, options) {
  assertSafeSkillDirectory(skillSource, "packaged skill source");
  assertNoTargetOverlap(targets);

  const allAffectedPaths = [];
  const planTargets = [];

  for (const target of targets) {
    if (pathsOverlap(skillSource, target.skillsRoot)) {
      throw new Error(
        `${target.label} skills root ${target.skillsRoot} overlaps the packaged skill source; choose another destination`,
      );
    }

    const skillsRootStats = pathStats(target.skillsRoot);
    if (skillsRootStats) assertSafeDirectory(target.skillsRoot, `${target.label} skills directory`, skillsRootStats);

    const destinationStats = pathStats(target.destination);
    if (destinationStats) assertSafeDirectory(target.destination, `${target.label} destination`, destinationStats);

    const candidateLegacyRoots = uniquePaths([target.skillsRoot, ...target.legacyRoots]);
    const legacy = [];
    const legacySeen = new Set();

    for (const legacyRoot of candidateLegacyRoots) {
      const rootStats = pathStats(legacyRoot);
      if (!rootStats) continue;
      assertSafeDirectory(legacyRoot, `${target.label} legacy skills directory`, rootStats);

      const names = samePath(legacyRoot, target.skillsRoot)
        ? legacySkillNames
        : [...legacySkillNames, skillName];
      for (const name of names) {
        const path = join(legacyRoot, name);
        if (samePath(path, target.destination) || legacySeen.has(canonicalKey(path))) continue;
        const stats = pathStats(path);
        if (!stats) continue;
        assertSafeSkillDirectory(path, `${target.label} legacy installation`);
        if (pathsOverlap(skillSource, path)) {
          throw new Error(`${target.label} legacy installation ${path} overlaps the packaged skill source`);
        }
        legacySeen.add(canonicalKey(path));
        legacy.push({ agent: target.agent, name, path, root: legacyRoot });
      }
    }

    const inspected = { ...target, destinationExists: Boolean(destinationStats), legacy };
    planTargets.push(inspected);
    allAffectedPaths.push(target.destination, ...legacy.map((entry) => entry.path));
  }

  for (let firstIndex = 0; firstIndex < allAffectedPaths.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < allAffectedPaths.length; secondIndex += 1) {
      const first = allAffectedPaths[firstIndex];
      const second = allAffectedPaths[secondIndex];
      if (pathsOverlap(first, second)) {
        throw new Error(`installation paths overlap (${first} and ${second}); refusing to modify them`);
      }
    }
  }

  const allLegacy = planTargets.flatMap((target) => target.legacy);
  if (!options.migrate && allLegacy.length > 0) {
    throw new Error(
      `legacy installation${allLegacy.length === 1 ? "" : "s"} found at ${allLegacy.map(({ path }) => path).join(", ")}; rerun with --migrate`,
    );
  }

  if (options.migrate && allLegacy.length === 0) {
    const qualifier = planTargets.length === 1 ? ` for ${planTargets[0].label}` : " for either target";
    throw new Error(`--migrate requires a recognized legacy installation${qualifier}`);
  }

  const occupied = planTargets.filter((target) => target.destinationExists);
  if (occupied.length > 0 && !options.force) {
    const destinations = occupied.map(({ destination }) => destination).join(", ");
    throw new Error(
      `${destinations} already exist${occupied.length === 1 ? "s" : ""}; rerun with ${options.migrate ? "--force --migrate" : "--force"} to replace ${occupied.length === 1 ? "it" : "them"}`,
    );
  }

  return planTargets;
}

function transactionPreview(root) {
  return join(root, `.${skillName}-{transaction-id}`);
}

function backupName(entry, index) {
  return `${String(index + 1).padStart(2, "0")}-${entry.agent}-${basename(entry.path)}`;
}

function operationPlan(targets, options, preview = false) {
  const backupEntries = [];
  for (const target of targets) {
    if (target.destinationExists) {
      backupEntries.push({
        agent: target.agent,
        name: skillName,
        path: target.destination,
        root: target.skillsRoot,
      });
    }
    if (options.migrate) backupEntries.push(...target.legacy);
  }

  return {
    backups: backupEntries.map((entry, index) => ({
      ...entry,
      backupName: backupName(entry, index),
      previewTransaction: preview ? transactionPreview(entry.root) : undefined,
    })),
    targets,
  };
}

function reportDryRun(targets, options) {
  const operations = operationPlan(targets, options, true);

  for (const target of targets) {
    const preview = transactionPreview(target.skillsRoot);
    console.log(`Target: ${target.label}`);
    console.log(`Would stage packaged skill from ${skillSource} at ${join(preview, `staged-${target.agent}`)}`);
    for (const entry of operations.backups.filter((backup) => backup.agent === target.agent)) {
      console.log(`Would back up ${entry.path} to ${join(entry.previewTransaction, "backups", entry.backupName)}`);
    }
    console.log(`Would atomically install ${skillName} to ${target.destination}`);
  }
}

function removeTransaction(path, warningContext = undefined) {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch (error) {
    if (!warningContext) throw error;
    console.error(
      `write-project-readme: warning: ${warningContext}; transaction files remain at ${path}: ${describeError(error)}`,
    );
  }
}

function missingDirectoryChain(path) {
  const missing = [];
  let current = resolve(path);

  while (!pathStats(current)) {
    missing.push(current);
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return missing;
}

function removeCreatedDirectories(paths) {
  const errors = [];
  const ordered = [...new Set(paths.map((path) => resolve(path)))]
    .sort((first, second) => second.length - first.length);

  for (const path of ordered) {
    try {
      rmdirSync(path);
    } catch (error) {
      if (error && typeof error === "object" && ["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error.code)) {
        continue;
      }
      errors.push(`could not remove newly created directory ${path}: ${describeError(error)}`);
    }
  }

  return errors;
}

function prepareTransactions(targets, operations) {
  const roots = uniquePaths([
    ...targets.map((target) => target.skillsRoot),
    ...operations.backups.map((entry) => entry.root),
  ]);
  const transactions = new Map();
  const createdDirectories = [];

  try {
    for (const root of roots) {
      createdDirectories.push(...missingDirectoryChain(root));
      mkdirSync(root, { recursive: true });
      const path = mkdtempSync(join(root, `.${skillName}-`));
      const backups = join(path, "backups");
      mkdirSync(backups);
      transactions.set(root, { backups, path, root });
    }

    for (const target of targets) {
      const transaction = transactions.get(target.skillsRoot);
      const staged = join(transaction.path, `staged-${target.agent}`);
      cpSync(skillSource, staged, { recursive: true });
      assertSafeSkillDirectory(staged, `${target.label} staged skill`);
      target.staged = staged;
    }

    for (const entry of operations.backups) {
      const transaction = transactions.get(entry.root);
      entry.backup = join(transaction.backups, entry.backupName);
    }
  } catch (error) {
    const cleanupErrors = [];
    for (const transaction of transactions.values()) {
      try {
        removeTransaction(transaction.path);
      } catch (cleanupError) {
        cleanupErrors.push(`${transaction.path}: ${describeError(cleanupError)}`);
      }
    }
    if (cleanupErrors.length === 0) {
      cleanupErrors.push(...removeCreatedDirectories(createdDirectories));
    }
    if (cleanupErrors.length > 0) {
      throw new Error(
        `${describeError(error)}; staging cleanup was incomplete: ${cleanupErrors.join("; ")}`,
      );
    }
    throw error;
  }

  return { createdDirectories, transactions };
}

function rollbackInstall(installed, moved, context) {
  const errors = [];

  for (const target of [...installed].reverse()) {
    if (!pathStats(target.destination)) continue;
    try {
      rmSync(target.destination, { recursive: true, force: true });
    } catch (error) {
      errors.push(`could not remove failed ${target.label} installation ${target.destination}: ${describeError(error)}`);
    }
  }

  for (const entry of [...moved].reverse()) {
    if (pathStats(entry.path)) {
      errors.push(`could not restore ${entry.path}: the path is occupied`);
      continue;
    }
    if (!pathStats(entry.backup)) {
      errors.push(`could not restore ${entry.path}: backup is missing at ${entry.backup}`);
      continue;
    }
    try {
      renameSync(entry.backup, entry.path);
    } catch (error) {
      errors.push(`could not restore ${entry.path}: ${describeError(error)}`);
    }
  }

  if (errors.length === 0) {
    for (const transaction of context.transactions.values()) {
      try {
        removeTransaction(transaction.path);
      } catch (error) {
        errors.push(`could not remove transaction ${transaction.path}: ${describeError(error)}`);
      }
    }
  }
  if (errors.length === 0) {
    errors.push(...removeCreatedDirectories(context.createdDirectories));
  }

  return errors;
}

function applyPlan(targets, options) {
  const operations = operationPlan(targets, options);
  const context = prepareTransactions(targets, operations);
  const installed = [];
  const moved = [];

  try {
    for (const entry of operations.backups) {
      renameSync(entry.path, entry.backup);
      moved.push(entry);
    }

    for (const target of targets) {
      renameSync(target.staged, target.destination);
      installed.push(target);
      assertSafeSkillDirectory(target.destination, `${target.label} installed skill`);
    }
  } catch (error) {
    const rollbackErrors = rollbackInstall(installed, moved, context);
    if (rollbackErrors.length > 0) {
      const locations = [...context.transactions.values()].map(({ path }) => path).join(", ");
      throw new Error(
        `${describeError(error)}; rollback was incomplete and transaction files may remain at ${locations}: ${rollbackErrors.join("; ")}`,
      );
    }
    throw error;
  }

  for (const transaction of context.transactions.values()) {
    removeTransaction(transaction.path, "installation succeeded but cleanup failed");
  }
}

function reportSuccess(targets, options) {
  for (const target of targets) {
    const action = target.destinationExists ? "Reinstalled" : "Installed";
    console.log(`${target.label}: ${action} ${skillName} to ${target.destination}`);
    if (options.migrate && target.legacy.length > 0) {
      console.log(
        `${target.label}: Removed legacy installation${target.legacy.length === 1 ? "" : "s"}: ${target.legacy.map(({ path }) => path).join(", ")}`,
      );
    }
  }

  if (targets.some(({ agent }) => agent === "codex")) {
    console.log(`Codex: Use $${skillName} to generate this project's README.md.`);
  }
  if (targets.some(({ agent }) => agent === "claude")) {
    console.log(`Claude Code: Use /${skillName} to generate this project's README.md.`);
  }
}

function install(options) {
  // Report option conflicts before inspecting the host, so auto-detection cannot
  // hide an actionable syntax error on an ambiguous machine.
  validateOptions(options, options.target);
  const root = projectRoot();
  const resolvedTarget = resolveTarget(options.target, root);
  if (resolvedTarget !== options.target) validateOptions(options, resolvedTarget);
  const targets = makeTargets(resolvedTarget, options, root);
  const inspectedTargets = inspectPlan(targets, options);

  if (options.dryRun) {
    reportDryRun(inspectedTargets, options);
    return;
  }

  applyPlan(inspectedTargets, options);
  reportSuccess(inspectedTargets, options);
}

try {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) console.log(usage());
  else if (options.version) console.log(packageJson.version);
  else install(options);
} catch (error) {
  fail(describeError(error));
}
