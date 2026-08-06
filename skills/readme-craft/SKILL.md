---
name: readme-craft
description: Create, rewrite, improve, or audit complete repository README.md files using verified project evidence, an audience-first product structure, and the bundled Ramadan Clock canonical quality benchmark. Use when Codex needs to document a software project, package, library, CLI, API, application, service, template, or monorepo; enforce full-document README quality; repair shallow or boilerplate documentation; add or verify setup, usage, proof, architecture, limitations, deployment, support, funding, contribution, security, authorship, or license paths; or reject badge-only and single-section patches that leave the overall README incomplete.
---

# Craft Project README

Produce a useful README that helps the intended reader understand the value, trust the claims, and reach a successful first use quickly. Adapt the document to the repository instead of forcing every section into every project.

## Use the canonical quality reference

Before creating, improving, or scoring a project README, read [references/ramadan-clock-standard.md](references/ramadan-clock-standard.md) in full. Treat it as the minimum quality standard for the complete reading experience.

Match its level of reader confidence, not its exact headings or length. Adapting by project type changes the content—not the completeness bar. A package may replace deployment and end-user workflows with API examples, compatibility, versioning, and release guidance; it must still provide equally strong value, proof, activation, trust, and stewardship.

Never call a README standard merely because it is project-specific, longer than boilerplate, or has badges and setup instructions.

## Choose the operation

- **Create:** Build a README from repository evidence.
- **Improve:** Preserve correct, useful content and reshape weak or missing parts.
- **Audit:** Report prioritized findings without editing unless the user also requests changes.

Treat requests such as "review and fix" as audit followed by improve.

## Follow the workflow

### 1. Inspect before writing

Read applicable repository instructions first. Then inspect the existing README and the smallest useful set of evidence:

- package manifests, lockfiles, runtime/version files, and executable scripts
- application entry points, public APIs, routes, CLI help, or exported package surface
- environment templates and configuration schemas
- tests, CI workflows, deployment configuration, and release automation
- `LICENSE`, contribution, security, conduct, funding, and documentation files
- screenshots, logos, diagrams, examples, and live deployment metadata

Use fast repository search to verify specific claims. Do not treat filenames, comments, dependencies, planned work, or an old README as proof that a feature currently works.

Inspect the complete current README, not only its opening or headings. Compare it with the canonical reference and record gaps across every relevant quality pillar before editing.

### 2. Build a fact inventory

Classify important information internally as:

- **Verified:** directly supported by code, configuration, repository files, command output, or a checked external endpoint.
- **Inferred:** strongly suggested but not directly established. Confirm it or use qualified wording.
- **Unknown:** not available. Omit it, mark it clearly, or ask only when the missing choice materially changes the result.

Never invent features, users, performance numbers, compatibility, commands, environment variables, deployment status, URLs, badges, screenshots, roadmap commitments, funding links, authorship, or license terms.

### 3. Identify the reader and value

Determine the primary audience and their fastest path to value. Establish:

1. What the project is.
2. Who it helps.
3. What problem or job it addresses.
4. Why it is useful or distinct.
5. What the reader should do next: try, install, integrate, deploy, or contribute.

Write the first screen as a compact product page: name, descriptive tagline, a small set of meaningful badges, a plain-language value statement, and the strongest verified proof such as a demo, usage example, or screenshot.

### 4. Select sections deliberately

Read [references/quality-standard.md](references/quality-standard.md) for the project-type matrix, badge rules, quality rubric, and audit severities.

Include only sections that help the intended reader. Most projects need value, key capabilities, quick start, usage, support, contribution, and license information. Add architecture, API details, deployment, security, funding, data methodology, limitations, or roadmap only when relevant and supported.

“Include deliberately” does not mean “accept a thin README.” Every project still needs an evidence-backed equivalent for the canonical reference's relevant reader paths: proof, first use, normal use, contributor setup, trust and limitations, operations or releases, help, stewardship, authorship, and licensing status.

For a new document, use [assets/project-readme-template.md](assets/project-readme-template.md) as a skeleton, not a mandatory form. Remove all placeholders, instructions, and irrelevant sections from the delivered README.

### 5. Draft for progressive disclosure

- Lead with outcomes and user value; follow with implementation details.
- Put the shortest successful path before exhaustive configuration.
- Prefer concrete examples, command blocks, tables, and small diagrams where they reduce explanation.
- Keep headings descriptive and navigation proportional to document length.
- Link to dedicated documents instead of duplicating lengthy contribution, security, license, API, or operational material.
- Keep tone factual and confident. Avoid hype, filler, excessive emojis, and unsupported superlatives.
- Use GitHub Flavored Markdown and repository-relative links for local files.

Choose the edit scope from the whole-document gap:

- **Rewrite or restructure** when two or more quality pillars are missing, setup is unreliable, the opening is implementation-first, trust information is absent, or the document contains false or stale claims.
- **Make a focused patch** only when the existing complete README already passes every relevant acceptance gate and the requested change is genuinely isolated.

Adding badges, funding, a screenshot, or one new section is never sufficient when the rest of the README remains below the canonical standard.

### 6. Verify the draft

Before finishing:

- Confirm local links and referenced files exist, including exact filename case.
- Derive commands from actual scripts or tooling and run safe checks when practical.
- Compare prerequisites and version claims with manifests, lockfiles, and CI.
- Compare environment-variable documentation with the safe template or configuration code; never expose secret values.
- Verify external links and badge endpoints when network access is available.
- Ensure CI and deployment badges reference the correct repository, workflow filename, provider, and site identifier.
- Confirm screenshots are current, readable, useful, and linked to the intended destination.
- Ensure every license claim matches an existing license file. If no license exists, state the gap instead of choosing one without authorization.
- Check Markdown structure, code-fence pairing, table layout, duplicate sections, stale placeholders, and relative anchors.
- Review the final diff so unrelated content and user changes are preserved.

Then read the complete final README from top to bottom and compare it side by side with [references/ramadan-clock-standard.md](references/ramadan-clock-standard.md). Apply the full-document acceptance gate in [references/quality-standard.md](references/quality-standard.md). Do not judge quality from the size of the diff or the number of headings.

If an external badge or deployment cannot be verified, explain the uncertainty instead of presenting it as working.

## Apply operation-specific behavior

### Create

Write the README only when the user asked for creation or implementation. If a README already exists unexpectedly, inspect it and preserve useful project knowledge.

### Improve

Keep accurate details, attribution, community links, and intentional voice. Consolidate repetition and stale detail. Make material changes only when supported by evidence. Report any important unresolved assumptions.

Do not preserve a weak structure simply because some text is accurate. Preserve verified knowledge while rewriting the document as needed to pass the complete quality gate.

### Audit

Do not modify files. Lead with findings ordered by impact, cite file locations or concrete evidence, and distinguish defects from optional enhancements. End with a short prioritized recommendation.

## Completion standard

A completed README must provide the same level of confidence and discoverability as the canonical Ramadan Clock reference. Without inspecting source code, a new reader must be able to answer:

- What is this and why would I use it?
- Is there trustworthy proof that it works?
- How do I install or run it successfully?
- How do I perform the primary use case?
- What are the important requirements, limits, or safety notes?
- Where do I get help, contribute, fund the work, inspect the license, or report security issues when those paths exist?

It must also:

- lead with verified product or package value and the strongest available proof;
- explain the primary user workflow or minimal API workflow;
- provide reproducible contributor activation with exact prerequisites, configuration, and commands;
- document architecture, data flow, API shape, or package surface when that understanding materially helps;
- state current status, compatibility, privacy, accuracy, security, data, and operational limitations where relevant;
- expose documentation, support, security, contribution, conduct, funding, author, and license paths when verified;
- explicitly disclose a missing license rather than imply open-source permission;
- contain no stale placeholders, broken primary links, decorative-only proof, or unsupported claims.

If any relevant item is missing, the README is not finished. Continue inspecting and revising rather than reporting an “acceptable” result.

In the final response, summarize the full-document outcome, verification performed, unresolved gaps, and any claims or links that remain unverified.
