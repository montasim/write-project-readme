# Security policy

Please report suspected vulnerabilities privately through GitHub's security advisory feature. Do not include secrets or sensitive local paths in a public issue.

## Installer boundaries

The installer writes only to the destinations shown in its plan:

- Codex user: `~/.agents/skills/write-project-readme`
- Codex project: `<repo>/.agents/skills/write-project-readme`
- Claude Code user: `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/write-project-readme`
- Claude Code project: `<repo>/.claude/skills/write-project-readme`
- Custom: `<exact-root>/write-project-readme` for one target selected with `--path`

`--target auto` uses read-only environment, directory, and `PATH` signals. It never executes Codex or Claude Code. Detection selects a destination; it is not caller identity, authentication, or authorization. An explicit `--target` takes precedence, and automatic mode refuses when it detects both hosts or neither host.

`--path` cannot be combined with `--target both` or an explicit `--scope`. Existing current destinations are preserved unless `--force` is explicit. The installer rejects symlink and non-directory targets, overlapping roots, and destinations that overlap the packaged skill source.

## Replacement, migration, and rollback

Legacy installations are changed only with `--migrate`. For standard destinations, these include the old `readme-craft` and `craft-project-readme` names, plus Codex installations in `$CODEX_HOME/skills`, `~/.codex/skills`, and project `.codex/skills`. An explicit `--path` is isolated and migration checks only the two old names beneath that exact root. A current destination that participates in migration additionally requires `--force --migrate`. `--force` alone never authorizes a legacy move.

Install and migration operations stage the packaged skill and back up affected directories before publishing. A `--target both` operation spans both destinations: if either publish fails, the installer attempts to remove new copies and restore every current and legacy directory moved for either host. Rollback is best effort; if it cannot complete, the error reports retained transaction paths for manual recovery. `--dry-run` performs no writes.

## Host and data boundaries

The dependency-free installer and README checker perform no network requests, analytics, or telemetry after the package has been retrieved. `agents/openai.yaml` is Codex UI metadata; the shared `SKILL.md`, references, and checker define portable behavior for both supported hosts.

Installing into Claude Code does not upload the skill to claude.ai or an Anthropic API integration. Those surfaces require separate skill uploads and have their own access controls.

The checker is local, read-only, and does not fetch external links. The skill tells the running agent to inspect safe templates and schemas rather than real secret files, but users remain responsible for repository permissions, host-agent approvals, external verification, and reviewing generated documentation before publication.
