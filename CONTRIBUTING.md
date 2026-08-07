# Contributing

Issues and pull requests are welcome. Keep changes focused and explain any user-facing installer, migration, checker, or README-workflow behavior change.

## Development

Use Node.js 18 or newer, then run:

```sh
npm install
npm test
npm run pack:check
```

The test suite covers the installer transaction, legacy migration, deterministic README checker, portable skill boundary, and npm package contents.

Validate the bundled skill with Codex's `quick_validate.py` when that development utility is available:

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/write-project-readme
```

When changing the skill workflow, test it against representative disposable projects and confirm that it modifies only the root `README.md`, uses repository evidence, and reports unresolved markers. Do not add generated archives or `node_modules` to commits.
