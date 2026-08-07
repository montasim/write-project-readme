# Project README Quality Standard

Use this reference to route, prioritize, draft, and accept a root project README. It defines reader outcomes, not a universal section template.

## Quality benchmark boundary

Read `ramadan-clock-standard.md` in full before writing. It demonstrates the depth needed to orient, activate, and build trust across a substantial application.

The benchmark is never evidence about the target project. Do not transfer its facts, values, commands, headings, technologies, links, workflows, identities, or document length. A smaller project may need a much shorter README; it must still satisfy every applicable P0 outcome.

## Evidence precedence

Resolve each README statement in this order:

1. explicit user instructions and applicable repository instructions;
2. authoritative manifests and standard project files;
3. source code, public interfaces, tests, CI, release, deployment, and operations files;
4. externally verified endpoints;
5. the existing root README after verification;
6. qualified inference;
7. a configuration-required marker for a relevant missing optional value.

Never treat the installed skill, its npm package, benchmark, examples, publisher identity, local account, global Git config, or commit author as target-project evidence.

Useful repository-native sources include:

- npm `package.json` fields such as `description`, `engines`, `exports`, `bin`, `scripts`, `homepage`, `bugs`, `funding`, `author`, and `contributors`;
- Python `[project]` metadata and well-known `[project.urls]` labels in `pyproject.toml`;
- Rust package metadata in `Cargo.toml`, while recognizing deprecated or ecosystem-specific fields;
- Go modules, Ruby gems, Java build files, container metadata, workspace manifests, and their standard equivalents;
- `.github/FUNDING.yml`, root governance files, API specifications, release workflows, and safe environment templates.

A present field is evidence only for its defined meaning. For example, a homepage is not automatically a demo, and repository ownership is not automatically authorship.

## Classify the dominant project type

Classify from the repository's purpose, primary audience, public interface, entry points, distribution method, and examples. A manifest is a signal, not the decision.

| Type | Dominant artifact or job | Typical first success |
| --- | --- | --- |
| Application | A person uses a web, desktop, mobile, or installed product | Complete the primary interaction locally or in a verified live app |
| Library, package, or SDK | Code imported into another project | Install, import, and exercise the smallest useful API |
| CLI or developer tool | An executable performs a developer or operator task | Install and run one representative command |
| API or service | A network interface or background service provides behavior | Start or reach it, then make one authenticated or public request |
| Container or image | A packaged runtime is pulled and operated | Pull/build, run, and observe a health or functional signal |
| Template or starter | A repository is instantiated or customized | Create a derived project and run its initial workflow |
| Monorepo | Several coordinated packages or applications share tooling | Bootstrap the workspace and run a common or targeted task |
| Research, data, or model | Evidence, datasets, experiments, or model artifacts are consumed or reproduced | Obtain inputs and reproduce a representative result |
| AI skill | An agent loads instructions/resources to perform a bounded task | Install, invoke with a representative prompt, and observe the intended artifact |
| Hybrid | Multiple surfaces are essential to one product | Reach the primary audience's result first, then connect secondary surfaces |

For a hybrid, select one dominant flow. Explain package, CLI, API, UI, or workspace companions where they become relevant instead of repeating full setup for each.

## Apply content priorities

- **P0 — essential:** Without it, the primary reader cannot understand, evaluate, activate, use, or safely trust the project. Every applicable P0 outcome must be present.
- **P1 — conditional:** Include when repository evidence proves the capability, lifecycle, risk, or participation path.
- **P2 — optional:** Include only when it adds decision-making or operational value without displacing the first-use path.

Context limits do not authorize skipping P0 content. Inspect more evidence, write concisely, and link to existing deeper documentation where appropriate.

### Universal priorities

| Priority | Reader outcome |
| --- | --- |
| P0 | Project identity, intended audience, problem or job, current value, and a clear next action |
| P0 | Exact activation path: prerequisites, setup/install, first useful action, and verified success signal when available |
| P0 | Primary usage or public interface with realistic examples |
| P0 | Material status, compatibility, safety, privacy, accuracy, data, or operational constraints |
| P0 | Accurate license status; link the license when present or disclose that no license file grants reuse rights |
| P1 | CI/release/deployment proof, configuration, architecture, troubleshooting, support, security, contribution, funding, authorship, and maintenance paths when evidenced or relevant |
| P2 | Roadmap, acknowledgements, extended recipes, comparison tables, FAQs, diagrams, or cosmetic badges when genuinely useful |

### Type-specific order

| Type | Recommended progression after the opening |
| --- | --- |
| Application | Proof or live use → primary workflows → local activation → configuration → architecture/data → deployment → trust → participation |
| Library/package/SDK | Install → minimal API example → public surface → configuration/compatibility → recipes → versioning → trust → participation |
| CLI/tool | Install → first command → command patterns → inputs/outputs/exit behavior → configuration → automation → trust → participation |
| API/service | Base workflow → authentication → minimal request/response → endpoint reference → local activation → limits/operations → trust → participation |
| Container/image | Pull or build → run → ports/volumes/configuration → health signal → upgrades/persistence → security/operations → participation |
| Template/starter | Intended outcome → creation command → initial run → included choices → configuration/customization → deployment/upgrades → participation |
| Monorepo | Repository purpose → package map → shared prerequisites → bootstrap → common commands → package-specific paths → releases/operations → participation |
| Research/data/model | Research purpose → artifacts/provenance → acquisition → representative reproduction → evaluation → limitations/ethics/license → citation/contribution |
| AI skill | Scope → install → invocation → output contract → evidence/safety boundaries → bundled resources → verification → contribution/license |

These are flows, not required heading names.

## Build the activation block

Activation is one continuous reader path:

1. State verified platform, runtime, tool, service, and account prerequisites.
2. Give ordered install or setup commands derived from the repository.
3. Document only required configuration, using safe templates and never real secrets.
4. Show the first useful action through the actual public surface.
5. State the success signal only if a test, help output, response shape, UI state, health check, or maintained example supports it.

Do not invent command output. Avoid offering several package managers or installation methods unless they are officially supported and materially useful.

## Resolve missing information

Ask only when an unknown blocks a materially different README. Omit irrelevant optional content. When a relevant optional field must be configured by maintainers, use exactly this adjacent form:

```markdown
> **Configuration required:** Add the project's verified support URL.
<!-- write-project-readme:configure support -->
```

The prose must say what evidence is needed; the field identifier must be lowercase kebab-case. Do not substitute a sample URL. A document with any marker is a configuration-required draft and must be handed off as such.

A missing license is not a placeholder opportunity. State the verified legal status directly and do not imply permission.

## Use badges and proof conditionally

There is no required hero layout, centered block, emoji, banner, screenshot, badge count, table of contents, FAQ, Mermaid diagram, star history, or author footer.

Prefer proof in this order when verified and relevant:

1. a working primary example, package release, current live app, or reproducible result;
2. CI/test, release, deployment, coverage, documentation, or compatibility status;
3. license or funding discovery;
4. technology labels only when they help evaluation.

Verify a badge image source and destination. Confirm repository owner/name, workflow filename, default branch, package identity, provider project, and license before adding one. Never infer badges from directory names or the benchmark.

## Apply trust gates

Document a constraint when its omission could cause misuse or over-trust:

- pre-release, experimental, archived, incomplete, or unsupported status;
- runtime, platform, protocol, dependency, or version compatibility;
- authentication, authorization, secret handling, privileged access, or destructive commands;
- data provenance, retention, privacy, regulated domains, generated content, model limitations, or third-party availability;
- accuracy, reproducibility, benchmark methodology, safety, religious, medical, financial, or legal interpretation;
- rate limits, persistence, migrations, backups, upgrade behavior, observability, and operational ownership.

Separate current behavior from planned work. A dependency or planned test does not prove a capability.

## Accept the complete document

Evaluate the whole README, not the size of the edit. It passes only when every applicable P0 outcome is evidence-backed.

| Gate | Passing result |
| --- | --- |
| Orient | A new reader understands the project, audience, job, value, and next action quickly |
| Evaluate | Current capabilities and strongest available proof are clear without hype or decorative substitution |
| Activate | Ordered prerequisites, setup, first action, and supported success signal form a reproducible path |
| Use | The primary workflow or public interface has a realistic, copyable example |
| Understand | Configuration, architecture, package surface, data flow, workspace map, or lifecycle is explained to the useful depth |
| Trust | Material status, compatibility, security, privacy, accuracy, data, safety, and operational limits are explicit |
| Participate | Verified documentation, support, contribution, security, funding, authorship, and conduct paths are discoverable when present |
| License | The README exactly matches the repository's license status |
| Maintain | Claims minimize stale hard-coded facts and distinguish present behavior from plans |
| Hygiene | Markdown structure, code fences, local links, headings, and placeholders pass deterministic checks |

Hard-fail the result for false commands or URLs, broken primary setup, unsupported output, license misrepresentation, exposed secrets, unresolved template tokens, missing material limitations, or a shallow partial patch that leaves an applicable P0 outcome absent.

The bundled checker catches deterministic hygiene defects, not factual errors. Complete both checker validation and evidence review.
