# Security policy

Please report suspected vulnerabilities privately through GitHub's security advisory feature. Do not include secrets or sensitive local paths in a public issue.

The installer writes only below the displayed Codex skills directory. Existing `write-project-readme` installations are preserved unless the user explicitly passes `--force`. Legacy `readme-craft` or `craft-project-readme` installations are changed only with `--migrate`; if a new-name installation also exists, migration additionally requires `--force`.

Install and migration operations reject symlink and non-directory targets, stage the packaged skill before replacement, and attempt to restore all affected directories if the transaction fails. `--dry-run` performs no writes.

The README checker is local, read-only, and performs no network requests. The skill instructs Codex to inspect safe templates and schemas rather than real secret files, but users remain responsible for reviewing repository permissions and generated documentation before publishing it.
