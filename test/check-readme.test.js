import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checker = join(
  repositoryRoot,
  "skills",
  "write-project-readme",
  "scripts",
  "check-readme.mjs",
);
const temporaryRoots = [];

after(() => {
  for (const root of temporaryRoots) rmSync(root, { force: true, recursive: true });
});

function makeRoot(readme) {
  const root = mkdtempSync(join(tmpdir(), "write-project-readme-check-"));
  temporaryRoots.push(root);
  if (readme !== undefined) writeFileSync(join(root, "README.md"), readme);
  return root;
}

function put(root, path, content = "fixture\n") {
  const destination = join(root, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

function run(args = [], cwd = repositoryRoot) {
  return spawnSync(process.execPath, [checker, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function jsonResult(result) {
  assert.equal(result.stderr, "");
  return JSON.parse(result.stdout);
}

test("accepts a clean root README", () => {
  const root = makeRoot("# Example\n\nA complete project description.\n");
  const result = run([root]);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /README validation passed/);
  assert.equal(result.stderr, "");
});

test("requires exact README.md directly under the root", () => {
  const root = makeRoot();
  writeFileSync(join(root, "readme.md"), "# Wrong case\n");
  const result = run([root, "--json"]);
  const report = jsonResult(result);

  assert.equal(result.status, 1);
  assert.equal(report.status, "invalid");
  assert.equal(report.diagnostics[0].code, "missing-readme");
  assert.equal(report.diagnostics[0].line, null);
});

test("reports a paired configuration marker as configuration required", () => {
  const root = makeRoot(
    "# Example\n\n> **Configuration required:** Add a verified funding URL.\n<!-- write-project-readme:configure funding -->\n",
  );
  const result = run(["--json", root]);
  const report = jsonResult(result);

  assert.equal(result.status, 1);
  assert.equal(report.status, "configuration-required");
  assert.deepEqual(report.summary, {
    total: 1,
    validationErrors: 0,
    configurationRequired: 1,
  });
  assert.equal(report.diagnostics[0].code, "configuration-required");
  assert.equal(report.diagnostics[0].field, "funding");
  assert.equal(report.diagnostics[0].line, 3);
});

test("rejects malformed and unpaired configuration markers", () => {
  const root = makeRoot(
    "# Example\n\n> **Configuration required:** Add support details.\n<!-- write-project-readme:configure Support -->\n<!-- write-project-readme:configure docs -->\n",
  );
  const result = run([root]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /README\.md:3: \[unpaired-configuration-notice\]/);
  assert.match(result.stderr, /README\.md:4: \[malformed-configuration-marker\]/);
  assert.match(result.stderr, /README\.md:5: \[orphan-configuration-marker\]/);
});

test("detects narrow legacy placeholders but permits ordinary TODO prose", () => {
  const root = makeRoot([
    "# Example",
    "",
    "Clone https://github.com/yourusername/tool.",
    "Replace repository-url before publishing.",
    "[Project name] helps teams.",
    "TODO: Add the real usage example.",
    "The TODO command prints tracked work and TODO items remain searchable.",
    "",
  ].join("\n"));
  const result = run([root, "--json"]);
  const report = jsonResult(result);

  assert.equal(result.status, 1);
  assert.equal(report.diagnostics.filter((item) => item.code === "template-placeholder").length, 4);
  assert.deepEqual(
    report.diagnostics
      .filter((item) => item.code === "template-placeholder")
      .map((item) => item.line),
    [3, 4, 5, 6],
  );
});

test("checks balanced backtick and tilde fences", () => {
  const clean = makeRoot([
    "# Example",
    "",
    "````markdown",
    "```",
    "# Not a real heading",
    "```",
    "````",
    "",
    "~~~text",
    "content",
    "~~~~",
    "",
  ].join("\n"));
  assert.equal(run([clean]).status, 0);

  const broken = makeRoot("# Example\n\n```js\nconsole.log('open')\n");
  const result = run([broken]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /README\.md:3: \[unclosed-code-fence\]/);
});

test("detects normalized duplicate ATX headings outside fences", () => {
  const root = makeRoot([
    "# Example",
    "",
    "## Getting *Started*!",
    "",
    "```markdown",
    "## getting started",
    "```",
    "",
    "### GETTING STARTED",
    "",
  ].join("\n"));
  const result = run([root]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /README\.md:9: \[duplicate-heading\].*line 3/);
});

test("accepts existing local inline links and images", () => {
  const root = makeRoot([
    "# Example",
    "",
    "Read the [guide](docs/Guide.md#setup) or [source](<docs/Guide.md> \"Guide\").",
    "",
    "![Architecture diagram](assets/diagram.png?raw=1)",
    "",
  ].join("\n"));
  put(root, "docs/Guide.md", "# Guide\n");
  put(root, "assets/diagram.png", "not-a-real-png");

  const result = run([root]);
  assert.equal(result.status, 0, result.stderr);
});

test("reports missing relative targets with their line", () => {
  const root = makeRoot("# Example\n\nSee [missing documentation](docs/missing.md).\n");
  const result = run([root]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /README\.md:3: \[missing-relative-target\].*docs\/missing\.md/);
});

test("reports relative target casing mismatches", () => {
  const root = makeRoot("# Example\n\nSee [the guide](docs/guide.md).\n");
  put(root, "docs/Guide.md", "# Guide\n");
  const result = run([root, "--json"]);
  const report = jsonResult(result);

  assert.equal(result.status, 1);
  assert.equal(report.diagnostics[0].code, "relative-target-case");
  assert.equal(report.diagnostics[0].line, 3);
  assert.equal(report.diagnostics[0].target, "docs/guide.md");
});

test("ignores external, mailto, anchor, query, and fenced links", () => {
  const root = makeRoot([
    "# Example",
    "",
    "[Web](https://example.com) [Mail](mailto:team@example.com) [Anchor](#usage) [Query](?tab=usage)",
    "",
    "```markdown",
    "[Illustrative missing link](docs/not-real.md)",
    "![](also-not-real.png)",
    "```",
    "",
    "The TODO command displays TODO items.",
    "",
  ].join("\n"));
  const result = run([root]);

  assert.equal(result.status, 0, result.stderr);
});

test("rejects empty Markdown image alt text", () => {
  const root = makeRoot("# Example\n\n![](assets/logo.png)\n");
  put(root, "assets/logo.png", "fixture");
  const result = run([root]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /README\.md:3: \[empty-image-alt\]/);
});

test("uses the current working directory by default", () => {
  const root = makeRoot("# Default root\n");
  const result = run([], root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, new RegExp(root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("returns exit 2 for invocation errors in text and JSON modes", () => {
  const textResult = run(["one", "two"]);
  assert.equal(textResult.status, 2);
  assert.match(textResult.stderr, /expected at most one project-root argument/);
  assert.match(textResult.stderr, /Usage:/);

  const jsonInvocation = run(["one", "two", "--json"]);
  const report = jsonResult(jsonInvocation);
  assert.equal(jsonInvocation.status, 2);
  assert.equal(report.status, "error");
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.diagnostics[0].code, "invocation-error");
});

test("returns exit 2 when the project root is not a directory", () => {
  const root = makeRoot("# Example\n");
  const file = join(root, "README.md");
  const result = run([file, "--json"]);
  const report = jsonResult(result);

  assert.equal(result.status, 2);
  assert.equal(report.status, "error");
  assert.equal(report.diagnostics[0].code, "internal-error");
  assert.match(report.diagnostics[0].message, /not a directory/);
});
