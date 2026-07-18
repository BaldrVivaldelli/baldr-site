---
title: Agent Builder
description: A language-neutral toolchain for testing, building, publishing, and rolling back agents.
---

Agent Builder provides one consistent experience without trying to implement
every compiler inside Baldr.

```bash
baldr-agent test
baldr-agent build
baldr-agent publish
baldr-agent doctor
baldr-agent rollback 1.0.0
```

## Builder Protocol

Builder discovers a driver by exact identity and sends it versioned JSONL
operations. The driver understands the language; Builder owns the lifecycle.

| Builder decides | Driver decides |
| --- | --- |
| project identity | how to test sources |
| input inventory and digest | how to produce the artifact |
| idempotency and release | toolchain and output format |
| installation and publishing | language-specific metadata |

Conformance verifies the protocol, real tests, attestation, byte-identical
builds, and relocation outside the checkout.

Next: [create an agent](/baldr-site/guides/create-agent/).
