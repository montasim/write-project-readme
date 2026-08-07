import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = join(repositoryRoot, "skills", "write-project-readme");
const skillFile = join(skillRoot, "SKILL.md");
const agentMetadataFile = join(skillRoot, "agents", "openai.yaml");

function readSkill() {
  const source = readFileSync(skillFile, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  assert.ok(match, "SKILL.md must begin with YAML frontmatter");

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-z][a-z0-9_-]*):\s*(.*?)\s*$/);
    assert.ok(field, `unsupported frontmatter line: ${line}`);
    assert.equal(
      Object.hasOwn(metadata, field[1]),
      false,
      `duplicate frontmatter field: ${field[1]}`,
    );
    metadata[field[1]] = field[2];
  }

  return {
    body: source.slice(match[0].length),
    metadata,
    source,
  };
}

test("frontmatter satisfies the shared Agent Skills metadata contract", () => {
  const { metadata } = readSkill();

  assert.deepEqual(Object.keys(metadata).sort(), ["description", "name"]);
  assert.ok(metadata.name.length >= 1 && metadata.name.length <= 64);
  assert.match(metadata.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(metadata.description.trim().length >= 1);
  assert.ok(metadata.description.length <= 1024);
  assert.doesNotMatch(metadata.description, /\b(?:codex|claude(?:\s+code)?)\b/i);
});

test("portable skill behavior does not require a host-specific invocation", () => {
  const { body } = readSkill();

  assert.doesNotMatch(body, /\b(?:codex|claude(?:\s+code)?)\b/i);
  assert.doesNotMatch(body, /\$write-project-readme\b/);
  assert.doesNotMatch(body, /(?:^|\s)\/write-project-readme\b/m);
  assert.doesNotMatch(body, /<skill-dir>/);
  assert.match(body, /installed skill directory that contains this loaded `SKILL\.md`/i);
});

test("portable supporting resources exist and the checker is discoverable", () => {
  const { body } = readSkill();
  const portableResources = [
    "references/quality-standard.md",
    "references/ramadan-clock-standard.md",
    "scripts/check-readme.mjs",
  ];

  for (const resource of portableResources) {
    assert.equal(existsSync(join(skillRoot, resource)), true, `${resource} is missing`);
    assert.match(body, new RegExp(resource.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(body, /Node\.js 18 or newer/i);
  assert.match(body, /run its bundled deterministic checker with `node`/i);
  assert.match(body, /report that the deterministic checker could not run/i);
});

test("OpenAI UI metadata stays packaged outside the portable behavior contract", () => {
  const { body } = readSkill();

  assert.equal(existsSync(agentMetadataFile), true, "agents/openai.yaml is missing");
  assert.match(readFileSync(agentMetadataFile, "utf8"), /^interface:\s*$/m);
  assert.doesNotMatch(body, /(?:agents\/)?openai\.yaml/i);
});
