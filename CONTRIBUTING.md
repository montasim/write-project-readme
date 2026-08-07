# Contributing

Issues and pull requests are welcome. Keep changes focused and explain every user-facing detection, target, scope, installation, migration, checker, or README-workflow behavior change.

## Development

Use Node.js 18 or newer, then run:

```sh
npm install
npm test
npm run pack:check
```

The test suite covers installer transactions, legacy migration, deterministic README checks, the portable skill boundary, and npm package contents.

When changing the installer, cover the relevant v0.3.0 matrix:

- explicit `codex`, `claude`, and `both` targets;
- strict `auto` detection with exactly one, zero, and two detected hosts;
- `user` and `project` scopes, including Git-root and current-directory resolution;
- `CLAUDE_CONFIG_DIR` and the standard `~/.agents`, `~/.claude`, `.agents`, and `.claude` roots;
- `--path` as an exact one-host root, including rejection with `both` or an explicit scope;
- isolated `--path --migrate` behavior that scans only old names in the exact custom root;
- preserved current destinations without `--force`;
- old skill names and Codex `CODEX_HOME/skills`, `~/.codex/skills`, and project `.codex/skills` migration only with `--migrate`;
- cross-target staging, backup, cleanup, and rollback when either side of a `both` operation fails;
- symlink, non-directory, overlapping-path, and incomplete-rollback safety cases.

Automatic detection is a destination heuristic, not caller identity. Tests must control environment variables, agent directories, and `PATH` explicitly rather than depending on the developer machine.

The installed `SKILL.md`, references, and checker are shared by Codex and Claude Code. Its frontmatter description is the portable discovery and trigger contract for natural-language activation on both hosts; `$write-project-readme` and `/write-project-readme` are explicit host syntax. Keep host-specific behavior out of the portable skill contract. `skills/write-project-readme/agents/openai.yaml` is Codex UI metadata and must remain optional for Claude Code.

Validate the bundled skill with Codex's `quick_validate.py` when that development utility is available:

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/write-project-readme
```

When changing the skill workflow, test both `$write-project-readme` and `/write-project-readme` expectations against representative disposable projects. Confirm that one shared skill modifies only the root `README.md`, uses repository evidence, runs the bundled checker from its installed location, and reports unresolved markers.

Update `README.md`, `SECURITY.md`, and `SUPPORT.md` when an installer or host boundary changes. Do not imply that a local Claude Code install reaches claude.ai or Anthropic API integrations; those require separate skill uploads. Do not add generated archives, transaction directories, or `node_modules` to commits.
