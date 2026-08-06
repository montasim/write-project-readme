# README Quality Standard

Use this reference to decide what belongs in a README and how to review it. Relevance matters more than section count.

## Canonical benchmark

Read [ramadan-clock-standard.md](ramadan-clock-standard.md) before creating, materially improving, or scoring a README. It is the canonical standard for quality.

Do not copy its headings mechanically and do not target its line count. Match the confidence it gives each relevant audience:

- the first screen explains value and offers trustworthy proof;
- users can perform the primary job;
- contributors can reproduce the project locally;
- configuration and commands are exact;
- architecture, data, API, or package boundaries are understandable;
- limitations and sensitive assumptions are explicit;
- deployment, releases, or distribution are documented;
- documentation, support, security, contribution, funding, author, and license paths are discoverable.

Project-type adaptation may replace one reader path with its equivalent, but may not lower the completeness or verification standard.

## Reject shallow improvements

Evaluate the entire final README, never only the patch.

A badge row, funding block, screenshot, feature list, or setup section is a useful addition only when the rest of the README already passes this standard. If the original document is framework boilerplate, implementation-first, inaccurate, incomplete, or missing several reader paths, rewrite or substantially restructure it.

Hard-fail the result when any of these remain:

- wrong repository names, clone targets, commands, versions, URLs, workflow badges, or deployment claims;
- an asserted license without the matching license file;
- placeholders such as yourusername, repository-url, TODO copy, or framework starter text;
- technology badges used as the main proof while a live demo, release, CI workflow, package page, or screenshot exists;
- no realistic usage path or minimal example;
- no reproducible contributor setup;
- missing privacy, provenance, accuracy, security, or safety limitations for sensitive or third-party data;
- missing status or limitation guidance that could cause readers to over-trust the project;
- dedicated governance or support files that are not discoverable from the README;
- a small additive patch presented as completion while multiple relevant quality pillars remain weak.

## Section selection matrix

| Project type | Highest-value sections | Common optional sections |
| --- | --- | --- |
| End-user application or SaaS | Value proposition, live demo, screenshot, features, usage, local setup, deployment, support | Architecture, data methodology, funding, roadmap |
| Library or package | One-line purpose, install, minimal example, API surface, compatibility, versioning, license | Benchmarks, migration, recipes, contributing |
| CLI | Purpose, install, quick command, command examples, configuration, exit/output behavior | Shell completion, automation examples, troubleshooting |
| API or service | Purpose, base workflow, authentication, minimal request/response, local setup, API reference | Architecture, deployment, rate limits, observability |
| Developer tool or framework | Problem, workflow, install, examples, integration, constraints | Internals, plugins, benchmarks, roadmap |
| Template or starter | Intended outcome, included stack, create/use command, configuration, customization | Deployment recipes, upgrade policy |
| Monorepo | Repository purpose, package map, shared prerequisites, bootstrap, common commands | Dependency graph, release process, package-level docs |

## Above-the-fold standard

The opening should usually contain:

1. Project name and a descriptive tagline.
2. Three to seven meaningful badges at most.
3. A short paragraph explaining audience, problem, solution, and value.
4. One strong next action or proof point: install command, minimal example, live demo, or screenshot.

Do not delay the value proposition with a long table of contents, exhaustive technology list, or implementation history.

Use the strongest verified operational proof available. A live application, current screenshot, passing CI workflow, published package, signed release, or verified documentation is stronger than a static technology badge.

## Badge rules

Prefer operational signals over decorative technology labels:

1. CI or test status
2. Package or release version
3. License
4. Deployment status
5. Coverage, documentation, compatibility, or funding when genuinely useful

Verify both the badge image and destination. A badge is misleading when it references a nonexistent workflow, a different branch, an unrelated deployment, or a version that is manually hard-coded and likely to become stale. Technology badges are optional and should not dominate the header.

## Content rules

- Describe observable user capabilities, not every internal module.
- Put the minimal working example before an exhaustive reference.
- Keep installation steps reproducible and ordered.
- State platform, runtime, service, and account prerequisites explicitly.
- Document configuration names and purpose without including real secrets.
- Call out destructive commands, privileged access, irreversible migrations, sensitive data, and other meaningful risks.
- Separate current behavior from planned work.
- Keep a roadmap small and honest; use the issue tracker for detailed planning.
- Link to `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `LICENSE` with short README sections when those discovery paths benefit readers.
- Include funding only when a real funding channel exists; explain briefly what support enables and keep it optional.
- Include attribution and accuracy limitations for third-party, calculated, regulated, medical, financial, religious, or safety-relevant data.

## Full-document acceptance gate

Review every relevant row. A README passes only when every applicable row is supported by evidence.

| Pillar | Required outcome |
| --- | --- |
| First screen | Name, descriptive tagline, verified operational signals, clear value, and one strong next action or proof point |
| Why and audience | The intended reader, problem, outcome, and differentiator are clear without reading source code |
| Capabilities | Observable current behavior is separated from plans and internal implementation |
| Primary use | An end user can complete the main workflow, or a developer can run the smallest realistic API, package, or CLI example |
| Activation | Clone, install, configure, and run steps are ordered, complete, and derived from repository evidence |
| Configuration | Required services, accounts, environment variables, safe defaults, and secret handling are documented |
| Understanding | Architecture, data flow, API, routes, package surface, or project structure is explained at the useful level |
| Operations | Deployment, release, distribution, data updates, or maintenance is documented when the project has such a lifecycle |
| Trust | Status, limitations, compatibility, accuracy, privacy, security, provenance, and destructive or sensitive behavior are explicit where relevant |
| Quality | Available commands and automated verification are described accurately |
| Discovery | Deeper documentation and issue or support paths are easy to find |
| Stewardship | Contribution, security, conduct, funding, author, and license status are present or explicitly disclosed when absent |
| Maintenance | Badges and facts are dynamic where possible; stale hard-coded values and duplication are minimized |

For short projects, satisfy these outcomes concisely. Do not omit them merely to keep the README short.

## Audit severity

Classify findings by reader impact:

- **Critical:** Unsafe instructions, exposed secrets, materially false claims, malicious links, or license misrepresentation.
- **High:** Broken primary setup, invalid install/usage commands, dead live demo, wrong compatibility, or missing information that prevents first use.
- **Medium:** Unclear value, important undocumented prerequisites, stale badges/screenshots, missing support or limitation guidance, or excessive duplication.
- **Low:** Navigation, wording, formatting, optional polish, or minor consistency issues.

In an audit, report evidence and the smallest useful remedy. Do not inflate optional sections into defects.

## Final quality rubric

Score mentally rather than adding a score to the README:

- **Clarity:** A new reader understands the project and intended audience within 30 seconds.
- **Value:** The README explains the problem and outcome, not only the stack.
- **Proof:** Important claims have demos, examples, screenshots, tests, releases, or repository evidence.
- **Activation:** The shortest setup and primary-use path are easy to follow.
- **Accuracy:** Commands, versions, links, badges, configuration, and license claims are verified.
- **Scope:** Detail is proportional to the project; dedicated documents hold deep reference material.
- **Trust:** Limitations, status, support, security, funding, and attribution are honest where relevant.
- **Maintenance:** The document minimizes hard-coded facts that will become stale without automation.

The rubric is a gate, not a suggestion. “Mostly good,” “acceptable,” and “better than before” are not completion states when a relevant pillar still fails.
