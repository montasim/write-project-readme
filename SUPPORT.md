# Support

Use [GitHub Issues](https://github.com/montasim/write-project-readme/issues) for reproducible installer, migration, checker, and project-README behavior.

For installer reports, include:

- package version and the complete command, including `--target`, `--scope`, `--path`, `--force`, `--migrate`, and `--dry-run` options that matter;
- whether Codex, Claude Code, or both were intended;
- Node.js version, operating system, expected result, exit status, and actual output;
- for automatic-detection problems, which relevant environment variables, agent directories, or executable names were present, with sensitive path details removed;
- for rollback problems, the sanitized transaction paths and which original installations remain.

For skill behavior, say whether the host matched a natural-language request through the shared `SKILL.md` description or you used the explicit invocation (`$write-project-readme` for Codex or `/write-project-readme` for Claude Code). Include the project type, expected README outcome, checker diagnostics, and a minimal public reproduction when possible.

Installer automatic detection is not caller identity or host skill activation; selecting the wrong destination is best reproduced with the detection signals above. The local Claude Code installer does not make a skill available in claude.ai or an Anthropic API integration, which requires a separate skill upload.

Remove tokens, private repository content, generated README secrets, and sensitive filesystem details before posting. Follow the [security policy](SECURITY.md) to report suspected vulnerabilities privately, not through a public issue.
