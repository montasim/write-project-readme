---
name: write-project-readme
description: Create or regenerate the root README.md for a software project from verified repository evidence. Use when an AI coding agent must write the complete project README for an application, library, package, SDK, CLI, API, service, container, template, monorepo, research or data project, model, AI skill, or hybrid repository. Do not use for audit-only requests, profile or organization READMEs, nested documentation indexes, badge-only edits, community files, marketing assets, or non-project README files.
---

# Write Project README

Create one complete, evidence-based project document: `<project-root>/README.md`.

## Enforce the output contract

- Resolve the project root with `git rev-parse --show-toplevel` when inside a Git worktree; otherwise use the current working directory.
- Write only the root `README.md`. Do not create or edit any other file, including nested READMEs, translations, screenshots, diagram or badge assets, funding files, licenses, contribution files, repository topics, or social previews. The README may reference verified existing media and may contain a useful inline diagram when evidence supports it.
- Treat an existing root README as project evidence to verify and intelligently regenerate. Preserve accurate project knowledge, intentional voice, attribution, and useful links; do not preserve weak structure or stale claims.
- Do not turn an audit-only request into a write. This skill's deliverable is a project README, not an audit report.
- Produce portable Markdown. Use host-specific syntax only when the repository host and syntax support are verified.

## Load the standards

Before inspecting the target project, read these bundled references in full:

1. [references/ramadan-clock-standard.md](references/ramadan-clock-standard.md) — the mandatory canonical benchmark for reader confidence and document depth.
2. [references/quality-standard.md](references/quality-standard.md) — the project router, evidence model, priority system, and acceptance gates.

The benchmark is not project evidence. Never copy its facts, commands, structure, links, identities, technology, headings, or claims into the target README unless the target repository independently proves them. Match the benchmark's quality and reader confidence, not its content or length.

## Follow the evidence boundary

Use this precedence for every claim:

1. The user's explicit request and applicable repository instructions.
2. Authoritative project manifests and standard repository files.
3. Code, public interfaces, tests, CI, release, deployment, and operations configuration.
4. Relevant external endpoints that you actually verify.
5. The existing root README, after verifying each retained fact.
6. A clearly qualified inference.
7. A visible configuration-required marker for a relevant unresolved optional field.

Never use the bundled benchmark, this skill's package metadata, the skill publisher's identity or funding links, local usernames, global Git configuration, Git commit authors, or installation paths as evidence about the target project.

Read safe configuration templates and schemas such as `.env.example`; never open or quote real secret files such as `.env`, private keys, credential stores, or tokens. Do not expose secrets observed elsewhere.

Do not invent features, audiences, commands, expected output, compatibility, performance, URLs, badges, screenshots, status, deployment, roadmap promises, funding, support channels, authorship, or license terms.

## Inspect the repository

Read applicable instructions first, then inspect the smallest sufficient evidence set:

- the complete existing root README;
- manifests, lockfiles, workspace files, runtime declarations, and executable scripts;
- entry points, exports, routes, CLI help, API specifications, examples, and tests;
- safe environment templates, configuration schemas, and documented defaults;
- CI workflows, release automation, deployment files, container files, and health checks;
- `LICENSE*`, `CONTRIBUTING*`, `SECURITY*`, `SUPPORT*`, `CODE_OF_CONDUCT*`, `AUTHORS*`, and `.github/FUNDING.yml` when present;
- existing documentation and media that the root README may link to.

Use repository search to validate important details. A filename, dependency, comment, disabled test, planned task, or old README statement does not prove current behavior.

Build an internal fact inventory:

- **Verified:** directly supported by authoritative evidence.
- **Inferred:** strongly suggested; verify it or qualify the wording.
- **Unknown:** not established; ask only if blocking, otherwise omit it or mark it when relevant.

## Route by the dominant project type

Classify the dominant user-facing artifact, not merely the first manifest found:

- application;
- library, package, or SDK;
- CLI or developer tool;
- API or service;
- container or image;
- template or starter;
- monorepo;
- research, data, or model project;
- AI skill;
- hybrid.

Use repository purpose, public interface, distribution method, entry points, and examples together. For a hybrid, lead with the artifact that gives the primary audience its first useful result, then document the other surfaces without duplicating setup.

## Design the reading flow

Make the document answer these reader needs in order:

1. **Orient:** What is this, who is it for, and what outcome does it enable?
2. **Evaluate:** What can it do, what proof exists, and what constraints affect adoption?
3. **Activate:** What exact prerequisites, install or setup steps, first useful action, and verified success signal get a reader started?
4. **Use:** How does the reader perform the primary workflows or use the public interface?
5. **Trust:** What are the status, compatibility, security, privacy, data, accuracy, operational, or destructive-behavior limits?
6. **Support and participation:** Where do support, contribution, security, funding, authorship, and license paths exist?

Follow the type-specific ordering and P0/P1/P2 priorities in the quality standard. A heading is optional; the reader outcome is not. Keep the shortest successful path before exhaustive reference material.

The activation block must combine:

- verified prerequisites and installation or setup;
- the first useful command, request, import, integration, or interaction;
- a success signal when output or behavior is supported by evidence.

Do not fabricate expected output merely to complete the block.

## Resolve configuration without publisher defaults

This skill is zero-config by default. Discover README facts and preferences only from:

- the current user prompt and applicable repository instructions;
- standard ecosystem manifests and workspace files;
- repository-native governance, funding, support, security, documentation, release, and deployment files;
- verified code and public interfaces.

Do not read or create a proprietary skill config file. Do not use installation-scoped or user-global defaults for author, funding, support, demo, documentation, badges, or section choices. A `homepage` is not a demo unless project evidence establishes that role. A Git remote or commit identity is not proof of authorship.

Ask a concise question only when an unknown materially changes the document and cannot be resolved safely from the repository. Otherwise:

- omit irrelevant or unsupported optional content;
- state a verified absence when it matters, such as a missing license file;
- for a relevant optional field that maintainers must supply, insert an adjacent marker pair:

```markdown
> **Configuration required:** Add the project's verified funding URL.
<!-- write-project-readme:configure funding -->
```

Use a lowercase kebab-case field identifier. Never put a guessed value in the marker. A README containing a marker is a configuration-required draft, not a finished README. List every remaining marker in the final handoff.

## Draft from evidence

- Lead with a descriptive name, concise value statement, intended audience, and the strongest verified next action or proof.
- Describe observable benefits, not an inventory of internal modules.
- Include badges only when their source and destination are verified and they materially help readers. There is no badge minimum.
- Derive commands from actual scripts, package metadata, executable help, or maintained documentation.
- Use examples that exercise the real public surface. Distinguish current behavior from planned work.
- Link to dedicated repository documents rather than duplicating them.
- Keep navigation proportional to length and omit empty, decorative, or speculative sections.
- Follow the language established by the prompt and repository. Preserve links to existing translations, but create only the root `README.md`.

## Verify the complete README

Before finishing:

1. Check every command, prerequisite, configuration name, link, badge, compatibility claim, and license statement against evidence.
2. Confirm all relative targets exist with exact filename case.
3. Run safe, relevant project checks when practical; do not perform deployments, releases, destructive commands, or external writes merely to verify documentation.
4. Read the complete draft top to bottom against both bundled references and every applicable P0 gate.
5. Confirm Node.js 18 or newer is available. Resolve the absolute installed skill directory that contains this loaded `SKILL.md`, then run its bundled deterministic checker with `node`, passing the absolute project root as the first argument:

   ```sh
   node /absolute/path/to/installed-skill/scripts/check-readme.mjs /absolute/path/to/project
   ```

   Resolve both placeholders to concrete absolute paths before execution. Use the host agent's skill-resource path resolution; do not assume a host-specific installation directory. If the required Node.js runtime is unavailable, continue the manual evidence and acceptance-gate review and report that the deterministic checker could not run.

Use `--json` when machine-readable diagnostics help. Exit code `0` is clean, `1` means validation or configuration-required findings, and `2` means invocation or internal failure. The checker does not prove factual accuracy; resolve its diagnostics and still perform the evidence review.

6. Review the final diff and confirm that only the root `README.md` changed.

If markers remain intentionally, deliver the configuration-required draft and clearly identify what maintainers must supply. Otherwise, continue until all applicable acceptance gates pass.

## Hand off the result

Report:

- that the root project README was created or regenerated;
- the main reader paths improved;
- verification performed and commands run;
- every unresolved marker or externally unverifiable claim.

Do not claim completion when relevant P0 information is absent, setup is unverified, the license is misstated, primary links are broken, or unsupported facts remain.
