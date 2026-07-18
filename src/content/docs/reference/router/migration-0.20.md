---
title: "Migrating Baldr from 0.19 to 0.20"
description: "Baldr technical reference synchronized from v0.20.0."
editUrl: false
---

:::note[Canonical source · v0.20.0]
This page is generated from [`migration-0.20.md`](https://github.com/BaldrVivaldelli/baldr-router/blob/v0.20.0/docs/migration-0.20.md). Do not edit it in this repository.
Source digest: `31f24d7ca3c772dd6a647c77be364e5abc443a34ba8703ea1fa68170b97ac4ae`.
:::
Baldr 0.20 preserves the public `setup`, `status`, and `run` intents, standard
Codex/Kiro profiles, and Python agent projects with `schema_version = 1`. The
migration coordinates Router, Kiro, Runner, Agent Builder, and SDK versions; it
does not require moving agent code into the monorepo.

## Update the runtime

Install the `0.20.0` wheels for Router, Agent Builder, Agent Runner, and the
Python SDK together. The VS Code extension installs its private wheel into a
separate versioned runtime, so it can return to `0.19.0` if the update does not
complete.

For TypeScript, the driver requires exactly the same SDK version:

```bash
npm install --global \
  ./baldr-agent-sdk-0.20.0.tgz \
  ./baldr-agent-builder-typescript-0.20.0.tgz

baldr-agent driver doctor baldr.typescript
```

Do not reuse a `0.19.x` driver with the `0.20.x` SDK. Discovery pins
`id + version + digest` and fails when more than one compatible identity exists
without an explicit selection.

## Verify an agent repository

From the external repository:

```bash
baldr-agent test
baldr-agent driver conformance baldr.typescript --driver-version 0.20.0
baldr-agent build
baldr-agent publish
baldr-agent doctor
```

For Python, replace the id with `baldr.python`. During an update,
`--driver-version` can verify 0.20 even if the 0.19 executable remains in
another `PATH` entry; `--driver-digest` can also be pinned. Conformance uses the
real project as its fixture and does not modify its published version.

## Test before publishing

`baldr-agent run` creates an ephemeral development release, executes the exact
role through Agent Runner, and discards the temporary installation when done:

```bash
baldr-agent run \
  --role implementer \
  --workspace /path/to/workspace \
  --request "Generate the report" \
  --driver-version 0.20.0
```

The workspace is required. Planner and reviewer receive read-only snapshots;
implementer receives only the explicit root and requires the `workspace.read`
and `workspace.write` capabilities in the manifest.

## Rollback

Published references remain immutable. An update must change the agent
version; changing content under an existing `AgentRef` is rejected. To
reactivate an earlier version:

```bash
baldr-agent rollback 1.0.0
```

Before promoting 0.20, run `python scripts/dev.py build` and
`python scripts/dev.py verify-release`. TypeScript distribution evidence records
conformance, direct execution, execution through the shared VS Code/Kiro
facade, update, and rollback. Publishing to PyPI or npm occurs only through
`workflow_dispatch` and the explicit selector for the corresponding registry.
