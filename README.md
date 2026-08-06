# README Craft

> Install an evidence-driven Codex skill for creating, auditing, and improving complete project READMEs.

[![CI](https://github.com/montasim/readme-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/readme-craft/actions/workflows/ci.yml)
[![GitHub release](https://img.shields.io/github/v/release/montasim/readme-craft)](https://github.com/montasim/readme-craft/releases/latest)

README Craft gives Codex a repeatable workflow for turning repository evidence into useful documentation. It checks the whole reading experience—not only badges or setup—and covers value, first use, normal use, contributor activation, trust, support, stewardship, and licensing without inventing unsupported claims.

```sh
npx readme-craft
# or
pnpx readme-craft
```

Until the first npm release is published, run the installer directly from GitHub:

```sh
npx --yes --package=github:montasim/readme-craft readme-craft
# or
pnpx github:montasim/readme-craft
```

## Why README Craft?

Generic README generators often produce attractive structure without proving that commands, compatibility claims, links, screenshots, or license statements are true. README Craft is intended for maintainers who want Codex to inspect the repository first, distinguish verified facts from assumptions, and produce documentation a new user can actually follow.

The skill supports three operations:

- **Create:** build a complete README from repository evidence.
- **Improve:** preserve correct project knowledge while repairing weak structure and missing reader paths.
- **Audit:** report prioritized, evidence-backed findings without changing files.

Its bundled Ramadan Clock reference acts as a concrete quality benchmark. Project-type guidance adapts that benchmark for applications, packages, CLIs, APIs, developer tools, templates, and monorepos.

## Install

### Prerequisites

- Node.js 18 or newer for the installer
- Codex with filesystem-backed skills support

Run either package executor:

```sh
npx readme-craft
pnpx readme-craft
```

By default, the installer writes to:

- `$CODEX_HOME/skills/readme-craft` when `CODEX_HOME` is set
- `~/.codex/skills/readme-craft` otherwise

Restart Codex or start a new session after installation so the skill catalog refreshes.

### Install to a custom skills directory

```sh
npx readme-craft --path /absolute/path/to/skills
```

### Preview the destination

```sh
npx readme-craft --dry-run
```

### Update an existing installation

The installer preserves an existing copy by default. Replace it explicitly:

```sh
npx readme-craft --force
```

`--force` replaces only the resolved `readme-craft` skill directory. If replacement fails, the installer attempts to restore the previous copy.

## Use the skill

Invoke it explicitly in Codex:

```text
Use $readme-craft to audit this repository's README and fix every verified high-impact gap.
```

Other useful prompts include:

```text
Use $readme-craft to create a complete README for this CLI from repository evidence.
```

```text
Use $readme-craft to audit README.md without editing any files.
```

The skill instructs Codex to inspect applicable repository instructions and supporting files, build a fact inventory, choose sections for the project type, verify the completed document, and disclose unresolved uncertainty.

## What gets installed

```text
readme-craft/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── assets/
│   └── project-readme-template.md
└── references/
    ├── quality-standard.md
    └── ramadan-clock-standard.md
```

The npm package contains a small dependency-free Node.js installer and the complete skill directory. Package retrieval may use npm or GitHub; the installer itself performs no network requests and does not collect telemetry.

## CLI reference

| Option | Behavior |
| --- | --- |
| `--path <directory>` | Install beneath a custom skills directory |
| `--force` | Replace an existing `readme-craft` installation |
| `--dry-run` | Print the resolved destination without writing |
| `--help`, `-h` | Show command help |
| `--version`, `-v` | Print the package version |

## Development

Clone and verify the package:

```sh
git clone https://github.com/montasim/readme-craft.git
cd readme-craft
npm install
npm test
npm run pack:check
```

| Command | Purpose |
| --- | --- |
| `npm test` | Exercise help, install, overwrite protection, forced replacement, and dry-run behavior |
| `npm run pack:check` | Preview the exact files included in the npm package |

The GitHub Actions workflow runs both checks on pull requests and pushes to `main` using Node.js 22.

### Validate the bundled skill

Codex contributors with the `skill-creator` utilities installed can run:

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/readme-craft
```

This validates the skill name, frontmatter, and folder structure. The command depends on a local Codex installation and is therefore not part of the portable npm test suite.

## Release and distribution

GitHub installs work from the latest repository commit. Use the tagged form below when reproducibility matters.

To pin the GitHub installer to the initial release:

```sh
npx --yes --package=github:montasim/readme-craft#v0.1.0 readme-craft
pnpx github:montasim/readme-craft#v0.1.0
```

npm distribution additionally requires maintainer authentication:

```sh
npm login
npm publish
```

Before the first publish, run the test and package checks and review the archive contents. For later releases, increment the package version and tag the matching commit. The unscoped npm name `readme-craft` was available when this repository was prepared, but availability is not reserved until the first successful publish.

## Status and limitations

- GitHub release `v0.1.0` is available; the first npm release is pending maintainer authentication.
- The installer targets the Codex filesystem convention; it does not configure unrelated agent products.
- Installation tests currently run locally and in the configured Linux CI environment. Other Node.js 18+ platforms are expected to work but are not yet claimed as verified.
- The skill can only document facts available from repository evidence and accessible verification; it must qualify or omit unknown information.
- README quality still depends on the repository containing accurate manifests, commands, governance files, and other supporting evidence.

## Support and security

Read [SUPPORT.md](SUPPORT.md) before opening an issue. Report reproducible bugs and skill feedback through [GitHub Issues](https://github.com/montasim/readme-craft/issues).

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Do not publish tokens, private paths, or repository secrets in an issue.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the local verification workflow and submission expectations.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

This repository does not currently include an open-source license. Until the maintainer adds one, the code and skill content are not granted open-source reuse rights beyond the installation and use permitted by the package distribution. Choose and add a license before presenting the project as open source.
