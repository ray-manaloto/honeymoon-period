# Date Ideas

Date Ideas is a product investigation for a shared iPhone workflow that turns links into ranked, actionable plans. The target experience accepts links from the iOS Share Sheet, lets two people vote or score them, stores notes and structured metadata, prioritizes time-sensitive ideas, and helps schedule them.

The project is currently running an **existing-product-first bake-off**. A working Apple Reminders + Beli + Shortcut workflow is retained as the baseline prototype and evidence source, not assumed to be the final architecture.

## Start here

- [Product context](CONTEXT.md)
- [Stable requirements](docs/product/requirements.md)
- [Research index](docs/research/README.md)
- [Architecture decisions](docs/adr/README.md)
- [Prototype setup](docs/SETUP.md)
- [Prototype trial](docs/TWO_WEEK_TRIAL.md)
- [Repository conventions](docs/conventions/README.md)

## Current prototype

- Apple Reminders is the shared inbox and decision history.
- Beli holds mutually wanted restaurants and post-visit rankings.
- **Save Date Idea** captures shared URLs without a backend, analytics, paid API, or account token.

Install and usage details remain in [docs/SETUP.md](docs/SETUP.md). The canonical Shortcut source is `shortcut/Save Date Idea.cherri`; `dist/Save Date Idea.shortcut` is the generated, signed deliverable.

## Build and verify

Requirements: macOS, Apple Shortcuts, Git, Go, and Python 3.

```sh
./scripts/verify.sh
```

The build pins Cherri to a specific commit, compiles the version-controlled source, verifies the generated workflow structure, and signs the importable artifact.

## Privacy and cost

Keep real relationship, calendar, location, and private Notes content out of this public repository. No paid service, physical-device action, distribution action, or production credential may be introduced without explicit approval.

Vendored workflow attribution and licenses are recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
