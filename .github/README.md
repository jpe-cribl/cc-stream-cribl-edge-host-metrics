# `.github/` — workflows for this pack

The caller workflows in this repository (`test.yml`, `release.yml`, and
`e2e.yml`) call the shared Cribl pack workflows in `jpe-cribl/.github`, pinned
to a commit SHA. The shared workflows check out their scripts from that
repository's `scripts/` directory into `.gh-shared/` in CI.

## Triggers

- A PR touching `default/`, `data/samples/`, `tests/`, `scripts/`, or
  `package.json` runs `test.yml`, which calls the shared validate and test
  workflow.
- A push to `main` runs `release.yml`, which calls the shared release-please
  workflow and the shared pack release workflow when a release is created.
- `e2e.yml` calls the shared E2E workflow on dispatch and on PRs touching
  `e2e/**`.

## Shared workflow inputs

- Test: `pack_type` is required. `cribl_versions`, `node_version`, and
  `yq_version` are optional.
- Release: `tag` and `additional_files` (requirements are defined by the shared
  workflow).
- E2E: no inputs.

Edit the caller workflows' `with:` blocks to override shared workflow inputs.
