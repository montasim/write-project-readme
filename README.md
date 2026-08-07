# Write Project README

> Install a self-contained Codex skill that creates or regenerates a software project's root `README.md` from verified repository evidence.

[![CI](https://github.com/montasim/write-project-readme/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/write-project-readme/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/montasim/write-project-readme)](https://github.com/montasim/write-project-readme/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)

Write Project README gives Codex a project-type-aware workflow for producing a complete README without turning guessed metadata or publisher defaults into project facts. It inspects manifests, code, public interfaces, tests, CI, release and deployment files, and repository-native governance metadata; then it writes one artifact only: the target repository's root `README.md`.

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme
```

Restart Codex, then invoke the installed skill:

```text
Use $write-project-readme to create or regenerate this project's root README.md from verified repository evidence.
```

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

## Install

### Requirements

- Node.js 18 or newer for the dependency-free installer and checker
- Codex with filesystem-backed skill support

Install the pinned GitHub release:

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme
```

The equivalent `pnpx` command is:

```sh
pnpx github:montasim/write-project-readme#v0.2.0
```

By default, the installer writes to:

- `$CODEX_HOME/skills/write-project-readme` when `CODEX_HOME` is set;
- `~/.codex/skills/write-project-readme` otherwise.

Restart Codex or begin a new session after installation so the skill catalog refreshes.

The unscoped npm package is not part of the currently verified distribution. After it is published, the shorter commands will be `npx write-project-readme` and `pnpx write-project-readme`; until then, use the pinned GitHub form above.

### Preview or customize the destination

Preview without writing:

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme --dry-run
```

Install beneath a custom skills directory:

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme --path /absolute/path/to/skills
```

### Update an existing installation

The installer preserves an existing `write-project-readme` directory unless replacement is explicit:

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme --force
```

Replacement is staged before the current installation is moved, and the installer attempts to restore the previous copy if the transaction fails. Symlink and non-directory targets are rejected.

### Migrate an earlier skill name

Version 0.2.0 recognizes installations named `readme-craft` and `craft-project-readme`. A normal install refuses to proceed while either legacy directory exists, so migration is always explicit:

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme --migrate
```

Preview the sources, backups, and destination first:

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme --migrate --dry-run
```

If the new destination and a legacy installation both exist, confirm replacement of the new destination as part of the transaction:

```sh
npx --yes --package=github:montasim/write-project-readme#v0.2.0 write-project-readme --migrate --force
```

Migration backs up every affected skill directory, installs the renamed skill, and removes the backups only after success. On failure, it attempts to restore all original directories.

## Use

From the target project's root, ask Codex:

```text
Use $write-project-readme to create or regenerate this project's root README.md from verified repository evidence.
```

You can add project-specific direction in the same prompt:

```text
Use $write-project-readme to regenerate this project's root README.md. Lead with the CLI workflow, preserve the existing migration warnings, and use only facts verified in this repository.
```

The skill resolves the Git worktree root when available, otherwise uses the current directory. It reads the existing root README and relevant evidence, classifies the dominant user-facing artifact, builds a verified/inferred/unknown fact inventory, drafts the full reader journey, validates it, and confirms that no other project file changed.

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
node ~/.codex/skills/write-project-readme/scripts/check-readme.mjs .
```

Use the corresponding `$CODEX_HOME` or custom installation path when applicable. Add `--json` for machine-readable diagnostics.

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

## CLI reference

| Option | Behavior |
| --- | --- |
| `--path <directory>` | Install beneath a custom skills directory |
| `--force` | Replace an existing new-name installation; combine with `--migrate` when both new and legacy names exist |
| `--migrate` | Transactionally replace detected legacy-name installations |
| `--dry-run` | Report the planned paths and actions without writing |
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
| `npm test` | Run installer, migration, checker, portability, and package-contract tests |
| `npm run pack:check` | Preview the exact files included in the npm archive |

When Codex's `skill-creator` utilities are installed, also validate the bundled skill:

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/write-project-readme
```

GitHub Actions runs the npm test and package checks on pushes to `main` and pull requests using Node.js 22.

## Status and limitations

- Version 0.2.0 is the first release under the Write Project README name; the earlier `v0.1.0` release remains available under the repository's history.
- The GitHub release is the verified installation source. Publishing the unscoped npm package still requires maintainer authentication.
- The installer targets Codex's filesystem-backed skill convention; it does not configure unrelated agent products.
- The skill writes only the root project README. It deliberately does not fulfill audit-only or repository-marketing requests.
- Repository evidence can be incomplete or stale. Blocking unknowns may require maintainer input; relevant non-blocking optional values remain visible as configuration-required markers.
- Deterministic checks find structural defects, not factual truth, prose quality, accessibility beyond empty image alt text, or remote-link health.
- External verification depends on the network and permissions available to the running Codex session.

## Support and security

Read [SUPPORT.md](SUPPORT.md) before opening an issue. Report reproducible installer, migration, checker, or skill behavior through [GitHub Issues](https://github.com/montasim/write-project-readme/issues).

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
