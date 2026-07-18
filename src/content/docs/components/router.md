---
title: Router
description: The control plane that coordinates roles, policies, and durable state.
---

Router is the single implementation of the coordination domain. It is exposed
through MCP and a shared CLI without depending on a specific interface.

## Responsibilities

- turn an intent into a versioned workflow;
- pin providers, models, agents, and profiles for the entire session;
- coordinate planning, implementation, and review;
- enforce round, re-entry, and single-writer limits;
- persist attempts, leases, checkpoints, events, and decisions;
- project public progress without leaking private information;
- recover or reconcile interrupted executions.

## What it does not own

- storing external agent source code;
- compiling every language;
- executing third-party code inside its process;
- implementing VS Code- or Kiro-specific UX;
- silently changing participants during a session.

## Stable boundary

Facades express three intents: `setup`, `status`, and `run`. A continuation is
a new durable revision of the same work item, not a fourth public contract.

Next: [how Router maintains durable workflows](/baldr-site/concepts/durable-workflows/).
