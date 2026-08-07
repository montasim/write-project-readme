#!/usr/bin/env node

import {
  lstatSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import {
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

const SCHEMA_VERSION = 1;
const CONFIG_NOTICE = /^> \*\*Configuration required:\*\* (\S.*)$/;
const CONFIG_MARKER = /^<!-- write-project-readme:configure ([a-z][a-z0-9-]*) -->$/;

function parseArguments(argv) {
  let json = false;
  let projectRoot;

  for (const argument of argv) {
    if (argument === "--json") {
      if (json) {
        throw new Error("--json may be provided only once");
      }
      json = true;
      continue;
    }

    if (argument.startsWith("--")) {
      throw new Error(`unknown option: ${argument}`);
    }

    if (projectRoot !== undefined) {
      throw new Error("expected at most one project-root argument");
    }
    projectRoot = argument;
  }

  return {
    json,
    projectRoot: resolve(projectRoot ?? process.cwd()),
  };
}

function diagnostic(code, category, message, details = {}) {
  return { code, category, line: details.line ?? null, message, ...details };
}

function isEscaped(text, index) {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === "\\"; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

function findClosingBracket(line, start) {
  let depth = 1;
  for (let index = start + 1; index < line.length; index += 1) {
    if (isEscaped(line, index)) continue;
    if (line[index] === "[") depth += 1;
    if (line[index] === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function findClosingParenthesis(line, start) {
  let depth = 1;
  let inAngleDestination = false;

  for (let index = start + 1; index < line.length; index += 1) {
    if (isEscaped(line, index)) continue;
    const character = line[index];
    if (character === "<" && depth === 1) inAngleDestination = true;
    if (character === ">" && inAngleDestination) inAngleDestination = false;
    if (inAngleDestination) continue;
    if (character === "(") depth += 1;
    if (character === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function findInlineLinks(line) {
  const links = [];

  for (let index = 0; index < line.length; index += 1) {
    let image = false;
    let bracket = index;

    if (line[index] === "!" && line[index + 1] === "[" && !isEscaped(line, index)) {
      image = true;
      bracket = index + 1;
    } else if (
      line[index] !== "[" ||
      isEscaped(line, index) ||
      (index > 0 && line[index - 1] === "!" && !isEscaped(line, index - 1))
    ) {
      continue;
    }

    const bracketEnd = findClosingBracket(line, bracket);
    if (bracketEnd === -1 || line[bracketEnd + 1] !== "(") continue;
    const parenthesisEnd = findClosingParenthesis(line, bracketEnd + 1);
    if (parenthesisEnd === -1) continue;

    links.push({
      image,
      alt: line.slice(bracket + 1, bracketEnd),
      rawDestination: line.slice(bracketEnd + 2, parenthesisEnd),
    });
    index = parenthesisEnd;
  }

  return links;
}

function extractDestination(rawDestination) {
  const value = rawDestination.trim();
  if (!value) return { target: "" };

  if (value.startsWith("<")) {
    const closing = value.indexOf(">");
    if (closing === -1) return { error: "angle-bracket link destination is not closed" };
    return { target: value.slice(1, closing) };
  }

  let target = "";
  let parenthesisDepth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === "\\" && index + 1 < value.length) {
      target += value[index + 1];
      index += 1;
      continue;
    }
    if (/\s/.test(character) && parenthesisDepth === 0) break;
    if (character === "(") parenthesisDepth += 1;
    if (character === ")" && parenthesisDepth > 0) parenthesisDepth -= 1;
    target += character;
  }
  return { target };
}

function localTargetFrom(rawTarget) {
  if (!rawTarget || rawTarget.startsWith("#") || rawTarget.startsWith("?")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(rawTarget) || rawTarget.startsWith("//")) return null;
  if (rawTarget.startsWith("/") || isAbsolute(rawTarget)) return null;

  const suffixIndex = rawTarget.search(/[?#]/);
  const withoutSuffix = suffixIndex === -1 ? rawTarget : rawTarget.slice(0, suffixIndex);
  if (!withoutSuffix) return null;

  try {
    return { path: decodeURIComponent(withoutSuffix) };
  } catch {
    return { error: `invalid percent-encoding in relative target: ${rawTarget}` };
  }
}

function inspectExactPath(projectRoot, target) {
  const absoluteTarget = resolve(projectRoot, target);
  const projectRelative = relative(projectRoot, absoluteTarget);
  if (projectRelative === ".." || projectRelative.startsWith(`..${sep}`) || isAbsolute(projectRelative)) {
    return { error: "escape", absoluteTarget };
  }

  if (projectRelative === "") return { ok: true, absoluteTarget };

  let current = projectRoot;
  for (const segment of projectRelative.split(sep)) {
    let entries;
    try {
      entries = readdirSync(current);
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
        return { error: "missing", absoluteTarget };
      }
      throw error;
    }

    if (!entries.includes(segment)) {
      const caseMatches = entries.filter(
        (entry) => entry.toLocaleLowerCase("en") === segment.toLocaleLowerCase("en"),
      );
      if (caseMatches.length > 0) {
        return {
          error: "case",
          absoluteTarget,
          requested: segment,
          actual: caseMatches.sort().join(" or "),
        };
      }
      return { error: "missing", absoluteTarget };
    }
    current = join(current, segment);
  }

  try {
    lstatSync(current);
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
      return { error: "missing", absoluteTarget };
    }
    throw error;
  }
  return { ok: true, absoluteTarget };
}

function normalizeHeading(rawHeading) {
  return rawHeading
    .replace(/[ \t]+#+[ \t]*$/, "")
    .replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_~]/g, "")
    .replace(/\\([!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-])/g, "$1")
    .normalize("NFKC")
    .trim()
    .replace(/[.!?,:;]+$/g, "")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en");
}

function placeholderDiagnostics(line, lineNumber) {
  const diagnostics = [];
  const placeholders = [
    { pattern: /\byour[-_ ]?username\b/i, label: "yourusername" },
    { pattern: /(^|[^-])\brepository-url\b/i, label: "repository-url" },
    { pattern: /\[project name\]/i, label: "[Project name]" },
  ];

  for (const placeholder of placeholders) {
    if (placeholder.pattern.test(line)) {
      diagnostics.push(
        diagnostic(
          "template-placeholder",
          "validation",
          `replace template placeholder ${placeholder.label}`,
          { line: lineNumber },
        ),
      );
    }
  }

  const todoCopy = /^\s*(?:>\s*)?(?:[-*+]\s+)?(?:<!--\s*)?TODO(?:(?:\s*:|\s+-)\s*|\s+)(?:copy\b|add\b|replace\b|write\b|describe\b|document\b|fill\b|insert\b|update\b|customi[sz]e\b|complete\b|provide\b|explain\b|summari[sz]e\b|include\b)/i;
  if (todoCopy.test(line)) {
    diagnostics.push(
      diagnostic("template-placeholder", "validation", "replace TODO template copy", {
        line: lineNumber,
      }),
    );
  }

  return diagnostics;
}

function fenceOpening(line) {
  const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
  if (!match) return null;
  if (match[1][0] === "`" && match[2].includes("`")) return null;
  return { character: match[1][0], length: match[1].length };
}

function isFenceClosing(line, fence) {
  const match = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line);
  return Boolean(
    match && match[1][0] === fence.character && match[1].length >= fence.length,
  );
}

function validateContent(content, projectRoot) {
  const diagnostics = [];
  const lines = content.split(/\r?\n/);
  const notices = new Map();
  const markers = new Map();
  const headings = new Map();
  let fence = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    diagnostics.push(...placeholderDiagnostics(line, lineNumber));

    if (fence) {
      if (isFenceClosing(line, fence)) fence = null;
      continue;
    }

    const opening = fenceOpening(line);
    if (opening) {
      fence = { ...opening, line: lineNumber };
      continue;
    }

    const notice = CONFIG_NOTICE.exec(line);
    if (notice) {
      notices.set(lineNumber, notice[1]);
    } else if (/^\s*>\s*\**Configuration required/i.test(line)) {
      diagnostics.push(
        diagnostic(
          "malformed-configuration-notice",
          "validation",
          "configuration notice must exactly match `> **Configuration required:** ...`",
          { line: lineNumber },
        ),
      );
    }

    const marker = CONFIG_MARKER.exec(line);
    if (marker) {
      markers.set(lineNumber, marker[1]);
    } else if (/^\s*<!--.*write-project-readme:configure/.test(line)) {
      diagnostics.push(
        diagnostic(
          "malformed-configuration-marker",
          "validation",
          "configuration marker must exactly match `<!-- write-project-readme:configure FIELD -->` using a lowercase field ID",
          { line: lineNumber },
        ),
      );
    }

    const heading = /^ {0,3}(#{1,6})(?:[ \t]+(.*)|[ \t]*)$/.exec(line);
    if (heading) {
      const normalized = normalizeHeading(heading[2] ?? "");
      if (normalized) {
        if (headings.has(normalized)) {
          diagnostics.push(
            diagnostic(
              "duplicate-heading",
              "validation",
              `duplicate heading; first occurrence is on line ${headings.get(normalized)}`,
              { line: lineNumber },
            ),
          );
        } else {
          headings.set(normalized, lineNumber);
        }
      }
    }

    for (const link of findInlineLinks(line)) {
      if (link.image && link.alt.trim() === "") {
        diagnostics.push(
          diagnostic("empty-image-alt", "validation", "Markdown image alt text must not be empty", {
            line: lineNumber,
          }),
        );
      }

      const extracted = extractDestination(link.rawDestination);
      if (extracted.error) {
        diagnostics.push(
          diagnostic("invalid-relative-link", "validation", extracted.error, { line: lineNumber }),
        );
        continue;
      }
      const localTarget = localTargetFrom(extracted.target);
      if (!localTarget) continue;
      if (localTarget.error) {
        diagnostics.push(
          diagnostic("invalid-relative-link", "validation", localTarget.error, {
            line: lineNumber,
            target: extracted.target,
          }),
        );
        continue;
      }

      const inspected = inspectExactPath(projectRoot, localTarget.path);
      if (inspected.error === "escape") {
        diagnostics.push(
          diagnostic(
            "invalid-relative-link",
            "validation",
            `relative target escapes the project root: ${extracted.target}`,
            { line: lineNumber, target: extracted.target },
          ),
        );
      } else if (inspected.error === "case") {
        diagnostics.push(
          diagnostic(
            "relative-target-case",
            "validation",
            `relative target has incorrect casing: requested ${inspected.requested}, found ${inspected.actual}`,
            { line: lineNumber, target: extracted.target },
          ),
        );
      } else if (inspected.error === "missing") {
        diagnostics.push(
          diagnostic(
            "missing-relative-target",
            "validation",
            `relative target does not exist: ${extracted.target}`,
            { line: lineNumber, target: extracted.target },
          ),
        );
      }
    }
  }

  if (fence) {
    diagnostics.push(
      diagnostic(
        "unclosed-code-fence",
        "validation",
        `code fence opened with ${fence.character.repeat(fence.length)} is not closed`,
        { line: fence.line },
      ),
    );
  }

  const pairedMarkers = new Set();
  for (const [lineNumber] of notices) {
    const field = markers.get(lineNumber + 1);
    if (field) {
      pairedMarkers.add(lineNumber + 1);
      diagnostics.push(
        diagnostic(
          "configuration-required",
          "configuration",
          `project field requires configuration: ${field}`,
          { line: lineNumber, field },
        ),
      );
    } else {
      diagnostics.push(
        diagnostic(
          "unpaired-configuration-notice",
          "validation",
          "configuration notice must be followed immediately by an exact configuration marker",
          { line: lineNumber },
        ),
      );
    }
  }

  for (const [lineNumber, field] of markers) {
    if (!pairedMarkers.has(lineNumber)) {
      diagnostics.push(
        diagnostic(
          "orphan-configuration-marker",
          "validation",
          `configuration marker for ${field} must immediately follow a visible configuration notice`,
          { line: lineNumber, field },
        ),
      );
    }
  }

  return diagnostics;
}

function sortDiagnostics(diagnostics) {
  return diagnostics.sort((left, right) => {
    const leftLine = left.line ?? Number.MAX_SAFE_INTEGER;
    const rightLine = right.line ?? Number.MAX_SAFE_INTEGER;
    return (
      leftLine - rightLine ||
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message)
    );
  });
}

function resultFor(projectRoot, readmePath, diagnostics, forcedStatus) {
  const sorted = sortDiagnostics(diagnostics);
  const configurationRequired = sorted.filter(
    (item) => item.category === "configuration",
  ).length;
  const validationErrors = sorted.filter((item) => item.category === "validation").length;
  const status =
    forcedStatus ??
    (validationErrors > 0
      ? "invalid"
      : configurationRequired > 0
        ? "configuration-required"
        : "clean");

  return {
    schemaVersion: SCHEMA_VERSION,
    status,
    projectRoot,
    readmePath,
    summary: {
      total: sorted.length,
      validationErrors,
      configurationRequired,
    },
    diagnostics: sorted,
  };
}

function printResult(result, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (result.status === "clean") {
    process.stdout.write(`README validation passed: ${result.readmePath}\n`);
    return;
  }

  for (const item of result.diagnostics) {
    const location = item.line ? `${result.readmePath}:${item.line}` : result.readmePath;
    process.stderr.write(`${location}: [${item.code}] ${item.message}\n`);
  }
  process.stderr.write(
    `README validation found ${result.summary.total} issue(s): ${result.summary.validationErrors} validation, ${result.summary.configurationRequired} configuration required\n`,
  );
}

function printInvocationError(error, json) {
  const result = resultFor(
    null,
    null,
    [diagnostic("invocation-error", "invocation", error.message)],
    "error",
  );
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stderr.write(`check-readme: ${error.message}\n`);
    process.stderr.write("Usage: node check-readme.mjs [project-root] [--json]\n");
  }
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    printInvocationError(error, process.argv.includes("--json"));
    return 2;
  }

  const readmePath = join(options.projectRoot, "README.md");
  try {
    let rootStats;
    try {
      rootStats = statSync(options.projectRoot);
    } catch (error) {
      if (error?.code === "ENOENT") {
        throw new Error(`project root does not exist: ${options.projectRoot}`);
      }
      throw error;
    }
    if (!rootStats.isDirectory()) {
      throw new Error(`project root is not a directory: ${options.projectRoot}`);
    }

    let content;
    try {
      if (!readdirSync(options.projectRoot).includes("README.md")) {
        const result = resultFor(options.projectRoot, readmePath, [
          diagnostic(
            "missing-readme",
            "validation",
            "required exact README.md was not found directly under the project root",
          ),
        ]);
        printResult(result, options.json);
        return 1;
      }
      const readmeStats = statSync(readmePath);
      if (!readmeStats.isFile()) {
        const result = resultFor(options.projectRoot, readmePath, [
          diagnostic("missing-readme", "validation", "required root README.md is not a file"),
        ]);
        printResult(result, options.json);
        return 1;
      }
      content = readFileSync(readmePath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") {
        const result = resultFor(options.projectRoot, readmePath, [
          diagnostic(
            "missing-readme",
            "validation",
            "required exact README.md was not found directly under the project root",
          ),
        ]);
        printResult(result, options.json);
        return 1;
      }
      throw error;
    }

    const result = resultFor(
      options.projectRoot,
      readmePath,
      validateContent(content, options.projectRoot),
    );
    printResult(result, options.json);
    return result.status === "clean" ? 0 : 1;
  } catch (error) {
    const result = resultFor(
      options.projectRoot,
      readmePath,
      [diagnostic("internal-error", "invocation", error.message)],
      "error",
    );
    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      process.stderr.write(`check-readme: ${error.message}\n`);
    }
    return 2;
  }
}

process.exitCode = main();
