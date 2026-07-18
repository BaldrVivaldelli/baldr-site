---
title: What is Baldr
description: An introduction to the local control plane and the platform's boundaries.
---

Baldr is a **local control plane for coordinating agent work**. It can use
Codex or Kiro directly and discover external agents written in different
languages without absorbing their code into Router.

## The problem it solves

Building an agent demo is straightforward. Operating that agent requires
answers to harder questions:

- Which exact version ran?
- Which capabilities did it declare, and which effects did it receive?
- Does the executed artifact match the published one?
- How does work continue after a restart?
- How is an update rolled back?
- How can VS Code, Kiro, a CLI, or any MCP client use the same agent?

Baldr turns those questions into contracts, identities, and durable state.

## What Baldr owns

- role and phase coordination;
- resolution of exact participants;
- capability and effect policies;
- execution through Runner;
- retries, cancellation, and reconciliation;
- evidence and bounded public progress;
- a common surface for different clients.

## What remains outside

- each agent's private code and prompts;
- tests and dependencies owned by its team;
- internal language and framework choices;
- the product's release schedule;
- secrets the agent did not declare it needs.

:::tip[One sentence to remember]
Baldr owns coordination. Each team owns behavior.
:::

## Two ways to use it

### Standard providers

Codex and Kiro can continue to fill planning, implementation, and review
roles. You do not need an external agent to use durable workflows.

### External agents

A team develops with its language SDK, builds with Agent Builder, and publishes
a release. Agent Manager resolves its `AgentRef + digest`; Runner executes it
when Router selects that participant.

The [architecture explorer](/baldr-site/explore/) shows both paths.
