# `.github/` — workflows for this template

Reusable workflows are called from any dryvist Cribl pack with a `uses:` ref:
`dryvist/cc-edge-pack-template/.github/workflows/<file>@<sha>`.
Pins use a 40-hex commit and a version comment such as `# vX.Y.Z`.

Caller workflows in this repo (`test.yml`, `release.yml`) wire them up to
GitHub events.

## Installation

These workflows install themselves implicitly when a new pack scaffolds from
`dryvist/cc-edge-pack-template` (`gh repo create --template`). The caller
workflows under `.github/workflows/` are copied verbatim; the reusable
workflows they reference resolve at runtime against
`dryvist/cc-edge-pack-template/.github/workflows/<file>@<40-hex-sha> # vX.Y.Z`.

If you're adding a workflow to a non-template repo manually, copy the relevant
caller from this directory into your repo's `.github/workflows/` and adjust
the `uses:` ref to pin a different template release. Pack-local reusable
workflows are pinned to their commit SHA; the shared workflow homes use `@v1`.

## Usage

Once installed, the workflows trigger automatically:

- Open a PR touching `default/`, `data/samples/`, `tests/`, `scripts/`, or
  `package.json` → `test.yml` runs validate + Vitest.
- Push to `main` → `release.yml` calls central `_release.yml` to open or update
  the release PR.
- Repository-specific asset and publish jobs remain in `release.yml` and call
  the pack release workflow as needed.

No manual invocation is needed. Override defaults by editing the caller
workflow's `with:` block (e.g., pass a custom `cribl_versions` JSON array to
test specific upstream Cribl releases).

## Reusable workflows

### `cribl-pack-test.yml`

Validates pack structure + runs the TypeScript Vitest suite against one
`cribl/cribl` service container per entry in the `cribl_versions` matrix.

- `pack_type` (required): `edge` or `stream`; selects the validator naming
  convention and required-field checks.
- `cribl_versions` (optional): defaults to `latest` and the last patches for
  N-1 and N-2. Supply JSON `{version, required}` entries, one per matrix leg.
  Set `required: false` for a best-effort leg.
- `node_version` (optional): defaults to `lts/*`; sets the Node.js version.
- `yq_version` (optional): defaults to `4.44.5`; pins the `mikefarah/yq`
  version.

Jobs:

1. **validate** — installs `yq` (pinned via `dcarbone/install-yq-action`),
   lints YAML (`frenck/action-yamllint`, config from `.yamllint.yml`), runs
   `scripts/validate-pack-structure.sh`.
2. **test** (matrix) — per Cribl version: sets up Node + pnpm (cached),
   installs deps, runs Biome lint, typechecks, waits for Cribl health
   endpoint (`iFaxity/wait-on-action`), runs `pnpm run test`. Each leg posts
   its own status check (`Test pack pipelines (Cribl <version>)`).

### `cribl-pack-release.yml`

Builds a `.crbl` tarball via `scripts/build-crbl.sh` and publishes it to
GitHub Releases (`softprops/action-gh-release`).

- `additional_files` (optional): defaults to `''`; lists space-separated extra
  files for the tarball. `LICENSE` is added if present.

Triggered by tag push in the calling workflow (typically by release-please
when a release PR merges).

## Caller workflows in this repo

- `workflows/test.yml` — PRs and paths-filtered pushes to `main`; calls
  `cribl-pack-test.yml` in this repo.
- `workflows/release.yml` — pushes to `main` and pull requests; calls
  `_release.yml` (central) and the pack asset workflow.

## Updating reusable workflow inputs

Adding/renaming an input is a breaking change for every consumer pack. Use the
`workflow_call.inputs.<name>.default` field to keep the change backward
compatible whenever possible. Bump major version of the workflow only if you
absolutely cannot.

## Pinning external actions

Per [`SECURITY.md`](https://github.com/JacobPEvans/.github/blob/main/SECURITY.md):

- Trusted (`actions/*`, `pnpm/action-setup`, `softprops/action-gh-release`):
  semver tag pins (`@v4`, etc.)
- Untrusted (everything else): SHA pins. Renovate (per the org's
  `renovate.json`) auto-converts version tags to SHA on first run.
