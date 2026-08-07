# Write Project README

> Install one portable skill for Codex, Claude Code, or both that creates or regenerates a software project's root `README.md` from verified repository evidence.

[![CI](https://github.com/montasim/write-project-readme/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/write-project-readme/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/montasim/write-project-readme)](https://github.com/montasim/write-project-readme/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Write Project README gives coding agents a project-type-aware workflow for producing a complete README without turning guessed metadata or publisher defaults into project facts. The same `SKILL.md`, quality references, and deterministic checker are installed for both supported hosts. The workflow inspects manifests, code, public interfaces, tests, CI, release and deployment files, and repository-native governance metadata; then it writes one artifact only: the target repository's root `README.md`.

> **Distribution:** `write-project-readme@latest` tracks the current stable npm release. Use the GitHub source fallback only when you intentionally want the repository's moving default branch.

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target codex
```

Restart the selected host after installation, then invoke the skill with that host's syntax:

| Host | Invocation |
| --- | --- |
| Codex | `$write-project-readme` |
| Claude Code | `/write-project-readme` |

## Why this skill exists

README generators often optimize for a visible template: a hero, badge row, feature list, and install command. Those elements can still leave readers without a verified first-use path, realistic examples, important limitations, or accurate support and license information.

Write Project README instead treats documentation as an evidence and reader-flow problem. It routes applications, packages, CLIs, APIs, containers, templates, monorepos, research projects, AI skills, and hybrids through a shared progression:

1. **Orient:** explain the project, audience, job, and value.
2. **Evaluate:** show verified capabilities, proof, and adoption constraints.
3. **Activate:** provide prerequisites, setup, the first useful action, and a supported success signal.
4. **Use:** document the primary workflow or public interface.
5. **Trust:** disclose material status, compatibility, security, privacy, data, accuracy, and operational limits.
6. **Participate:** expose verified support, contribution, security, funding, authorship, and license paths.

The skill uses a sanitized Ramadan Clock README as a mandatory depth benchmark. That specimen establishes the expected reader confidence; an explicit evidence boundary prevents its technologies, links, identities, commands, or headings from leaking into another project.

## Scope

| The skill does | The skill does not |
| --- | --- |
| Create or intelligently regenerate `<project-root>/README.md` | Produce audit-only reports |
| Preserve useful existing facts after verifying them | Create profile, organization, nested, or translated READMEs |
| Adapt depth and order to the dominant project type | Generate separate banners, screenshots, diagram files, badge assets, or social previews |
| Use repository-native configuration and metadata | Create licenses, funding files, governance files, topics, or releases |
| Mark relevant unresolved optional fields visibly | Guess author, funding, support, demo, compatibility, or license values |
| Run deterministic Markdown hygiene checks | Claim that syntax checks prove factual accuracy |

The local installer supports Codex and Claude Code. Claude.ai and Anthropic API integrations do not read a local Claude Code skills directory; those surfaces require separate skill uploads.

## Install

### Requirements

- Node.js 18 or newer for the dependency-free installer and checker
- Codex, Claude Code, or both, with filesystem-backed skill support

Install the current stable release for the host you want to use:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target codex
npx --yes --package=write-project-readme@latest write-project-readme --target claude
```

Install for both local hosts in one transaction:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target both
```

The equivalent `pnpx` form accepts the same installer options:

```sh
pnpx write-project-readme@latest --target codex
```

Restart each selected host or begin a new session after installation so its skill catalog refreshes.

[`latest`](https://docs.npmjs.com/cli/dist-tag/) is npm's stable distribution tag and is updated by a normal stable publication. It avoids hard-coding a release number while still resolving a published package version. It applies to registry package names, not GitHub repository specifications.

To install the current default branch directly from GitHub instead of a published release:

```sh
npx --yes --package=github:montasim/write-project-readme write-project-readme --target codex
npx --yes --package=github:montasim/write-project-readme write-project-readme --target claude
npx --yes --package=github:montasim/write-project-readme write-project-readme --target both
```

The GitHub form follows the repository's default branch. Prefer `@latest` for normal installation because it resolves an immutable published package instead of a moving source branch.

### Destinations and scope

`--scope` accepts `user` or `project` and defaults to `user`. The installer appends `write-project-readme` to the selected skills root:

| Target | Scope | Skills root | Installed directory |
| --- | --- | --- | --- |
| Codex | `user` | `~/.agents/skills` | `~/.agents/skills/write-project-readme` |
| Codex | `project` | `<repo>/.agents/skills` | `<repo>/.agents/skills/write-project-readme` |
| Claude Code | `user` | `${CLAUDE_CONFIG_DIR:-~/.claude}/skills` | `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/write-project-readme` |
| Claude Code | `project` | `<repo>/.claude/skills` | `<repo>/.claude/skills/write-project-readme` |

For project scope, `<repo>` is the Git worktree root when available and the current directory otherwise. For example:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target codex --scope project
npx --yes --package=write-project-readme@latest write-project-readme --target both --scope project
```

### Automatic target detection

`--target` accepts `auto`, `codex`, `claude`, or `both` and defaults to `auto`. With no explicit target, the installer proceeds only when it detects exactly one supported host:

```sh
npx --yes --package=write-project-readme@latest write-project-readme
```

Detection checks environment variables, known agent directories, and the executable names on `PATH`. It never runs an agent command. In particular:

- Codex signals include `CODEX_HOME`, `.agents` or `.codex` directories, and a `codex` executable.
- Claude Code signals include `CLAUDE_CONFIG_DIR`, `.claude` directories, and a `claude` executable.
- Exactly one detected host selects that target.
- No detected hosts or both detected hosts cause a refusal with instructions to choose `--target codex`, `--target claude`, or `--target both`.
- An explicit `--target` always wins over detection.

Detection chooses an installation destination; it is not caller identity, authentication, or proof that the command was launched from a particular agent. Use an explicit target in automation and whenever the intended destination matters.

### Preview or customize the destination

Preview the full plan without writing:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target both --dry-run
```

`--path` selects one exact custom skills root; the installer still creates its `write-project-readme` child:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target claude --path /absolute/path/to/skills
```

Because a custom path already fixes one root, `--path` is incompatible with `--target both` and with any explicit `--scope`, including an explicit `--scope user`.

### Update an existing installation

The installer preserves every existing `write-project-readme` destination unless replacement is explicit:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target codex --force
```

The packaged skill is staged before the current installation moves. Symlinks and non-directory targets are rejected, as are paths that overlap the packaged source or another selected target.

### Migrate legacy installations

Legacy discovery never causes an implicit move or deletion. Recognized legacy installations are changed only with `--migrate`:

- The old skill names `readme-craft` and `craft-project-readme` are recognized beneath the selected current skills root for either host.
- With a standard Codex destination, migration also recognizes `write-project-readme` and the old names beneath legacy user roots `$CODEX_HOME/skills` and `~/.codex/skills`, or beneath the legacy project root `<repo>/.codex/skills` when project scope is selected.
- An explicit `--path` is isolated: migration checks only `readme-craft` and `craft-project-readme` beneath that exact custom root and does not scan standard or legacy roots.

A normal install refuses before writing when it finds a recognized legacy installation, even if `--force` is present. Preview migration sources, backups, and destinations first:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target codex --migrate --dry-run
```

Then migrate:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target codex --migrate
```

If a current destination also exists, authorize its replacement as part of the migration:

```sh
npx --yes --package=write-project-readme@latest write-project-readme --target codex --force --migrate
```

With `--target both --migrate`, one host may migrate a legacy installation while the other receives a fresh install. At least one selected host must have a recognized legacy installation or `--migrate` refuses.

Install and migration operations stage all selected targets and back up every affected directory before publishing. A `both` operation is one logical transaction: if either host fails to install, the installer attempts to remove newly published copies and restore every moved destination and legacy directory across both hosts. If rollback cannot complete, it reports the transaction locations that need manual recovery; successful cleanup removes the temporary backups.

## Use

After the host refreshes its skill catalog, `SKILL.md`'s description is the shared discovery and trigger contract. In either Codex or Claude Code, a matching natural-language request can activate the skill automatically:

```text
Create or regenerate this project's root README.md from verified repository evidence.
```

Installer `--target auto` and skill activation are separate mechanisms: the installer uses local signals only to select one destination, while the host uses the installed skill description to match a request.

Use the host-specific invocation when you want to select the skill deterministically. For Codex:

```text
Use $write-project-readme to create or regenerate this project's root README.md from verified repository evidence.
```

For Claude Code:

```text
/write-project-readme Create or regenerate this project's root README.md from verified repository evidence.
```

Add project-specific direction in the same request when useful:

```text
Lead with the CLI workflow, preserve the existing migration warnings, and use only facts verified in this repository.
```

Both hosts load the same behavior contract and bundled resources. The skill resolves the Git worktree root when available, otherwise uses the current directory. It reads the existing root README and relevant evidence, classifies the dominant user-facing artifact, builds a verified/inferred/unknown fact inventory, drafts the full reader journey, validates it, and confirms that no other project file changed.

Audit-only requests, a badge-only patch, and non-project README files are intentionally outside the skill's contract.

## Project configuration and publisher separation

The skill is independent and zero-config by default. Other users do not edit this package or inherit its author's support and funding values. Each generated README is configured by its target repository:

| Precedence | Source | Examples |
| --- | --- | --- |
| 1 | Current prompt and applicable repository instructions | Audience, emphasis, verified maintainer-provided links |
| 2 | Standard manifests and workspace metadata | npm `funding`, `bugs`, `homepage`, `author`; Python project URLs; package exports and runtime requirements |
| 3 | Repository-native files | `.github/FUNDING.yml`, `SUPPORT.md`, `SECURITY.md`, `CONTRIBUTING.md`, `AUTHORS*`, `LICENSE*` |
| 4 | Code and operations evidence | CLI help, public APIs, tests, workflows, releases, deployment and safe configuration templates |
| 5 | Existing root README | Only facts that survive verification against stronger evidence |

The installed skill contains no publisher identity, SupportKori URL, live application URL, or personal repository link. This package's own `package.json` and README may identify its maintainer and funding channel, but the skill explicitly forbids using those values as target-project evidence.

There is no proprietary `.readme-craft.json`, installation-directory settings file, or user-global author/funding profile. This keeps the skill portable and makes project configuration reviewable through conventions collaborators already maintain.

When a relevant optional value cannot be established safely, the generated draft uses an adjacent, machine-checkable pair such as:

```markdown
> **Configuration required:** Add the project's verified funding URL.
<!-- write-project-readme:configure funding -->
```

The skill reports every remaining marker in its final handoff. A document containing one is a configuration-required draft, and the checker exits with status `1` until the maintainer supplies evidence or removes the no-longer-relevant field.

## Deterministic README checker

The bundled checker performs read-only, offline validation of the exact root `README.md`:

```sh
# Codex user installation
node ~/.agents/skills/write-project-readme/scripts/check-readme.mjs .

# Claude Code user installation
node "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/skills/write-project-readme/scripts/check-readme.mjs" .
```

For project scope, use the corresponding `.agents/skills` or `.claude/skills` path beneath the project root. Use the exact custom root supplied with `--path` when applicable. Add `--json` for machine-readable diagnostics.

It checks:

- configuration-required marker pairing and field syntax;
- narrowly defined legacy/template placeholders;
- balanced backtick and tilde code fences;
- duplicate normalized ATX headings outside code fences;
- relative inline-link and image targets with exact filename case;
- empty image alternative text.

External URLs, email links, anchors, query strings, fragments, and links inside fenced code are not fetched or treated as local targets.

| Exit code | Meaning |
| --- | --- |
| `0` | Deterministic checks passed |
| `1` | Validation findings or configuration-required markers remain |
| `2` | Invalid invocation or internal failure |

The checker does not determine whether prose claims are true. The skill separately checks commands, versions, public surfaces, links, deployment claims, limitations, and license statements against repository evidence.

## What gets installed

```text
write-project-readme/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── quality-standard.md
│   └── ramadan-clock-standard.md
└── scripts/
    └── check-readme.mjs
```

The npm package adds only the dependency-free installer. It performs no network requests, analytics, or telemetry after the package has been retrieved.

`SKILL.md`, the references, and the checker form one portable behavior contract shared by both hosts. `agents/openai.yaml` supplies Codex UI metadata; it is not a second skill definition and is not required for Claude Code behavior.

## CLI reference

| Option | Behavior |
| --- | --- |
| `--target auto|codex|claude|both` | Select the host; defaults to strict `auto` detection |
| `--scope user|project` | Select a standard user or repository-local root; defaults to `user` |
| `--path <directory>` | Use one exact custom skills root; incompatible with `both` or an explicit `--scope` |
| `--force` | Replace an existing current destination; does not authorize legacy migration |
| `--migrate` | Transactionally move recognized legacy names and Codex legacy-root installations |
| `--dry-run` | Report all selected targets, paths, backups, and actions without writing |
| `--help`, `-h` | Show command help |
| `--version`, `-v` | Print the package version |

## Development

Clone and verify the package:

```sh
git clone https://github.com/montasim/write-project-readme.git
cd write-project-readme
npm install
npm test
npm run pack:check
```

| Command | Purpose |
| --- | --- |
| `npm test` | Run cross-agent installer, scope, migration, rollback, checker, portability, and package-contract tests |
| `npm run pack:check` | Preview the exact files included in the npm archive |

When Codex's `skill-creator` utilities are installed, also validate the bundled skill:

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/write-project-readme
```

GitHub Actions runs the npm test and package checks on pushes to `main` and pull requests using Node.js 22.

## Status and limitations

- Version 0.3.0 is the first installer release supporting both Codex and Claude Code.
- The npm `latest` channel resolves the current stable release; the GitHub default-branch form is a source-based fallback.
- The installer configures local filesystem skill roots for Codex and Claude Code. Claude.ai and Anthropic API use require separate skill uploads.
- Natural-language discovery on both hosts comes from the shared `SKILL.md` description; `$write-project-readme` and `/write-project-readme` are the deterministic explicit forms.
- Automatic detection is a destination-selection heuristic, not caller identity. Machines with zero or two detected hosts require an explicit target.
- `CODEX_HOME/skills`, `~/.codex/skills`, and project `.codex/skills` are legacy migration sources, not v0.3.0 Codex destinations.
- Multi-target installation is transactional with attempted cross-target rollback, but an interrupted or failed rollback can leave reported transaction directories requiring manual recovery.
- The skill writes only the root project README. It deliberately does not fulfill audit-only or repository-marketing requests.
- Repository evidence can be incomplete or stale. Blocking unknowns may require maintainer input; relevant non-blocking optional values remain visible as configuration-required markers.
- Deterministic checks find structural defects, not factual truth, prose quality, accessibility beyond empty image alt text, or remote-link health.
- External verification depends on the network and permissions available to the running agent session.

## Support and security

Read [SUPPORT.md](SUPPORT.md) before opening an issue. Report reproducible detection, target, scope, installation, migration, checker, or skill behavior through [GitHub Issues](https://github.com/montasim/write-project-readme/issues). Include the selected host, command options, Node.js version, operating system, expected result, and sanitized actual output.

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Never post tokens, private repository content, secret values, or sensitive filesystem paths in a public issue.

## Contributing

Focused issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the verification workflow and submission expectations.

## Funding

Optional support through [SupportKori](https://www.supportkori.com/montasim) helps maintain the installer, test matrix, project-type guidance, and compatibility work. This funding link belongs to this package only; it is intentionally excluded from the installed skill's target-project evidence.

Bug reports, documentation improvements, tests, and code contributions are equally valuable ways to help.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Write Project README is available under the [MIT License](LICENSE).
