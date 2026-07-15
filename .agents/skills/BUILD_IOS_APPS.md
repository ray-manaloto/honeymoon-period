# Vendored Build iOS Apps skills

The nine `ios-*` and `swiftui-*` skill directories in this folder were copied
from OpenAI's **Build iOS Apps** plugin version `0.1.2` on 2026-07-15.

- Upstream: <https://github.com/openai/plugins>
- Plugin: `build-ios-apps`
- License declared by the plugin: MIT
- Original installed artifact:
  `~/.codex/plugins/cache/openai-curated-remote/build-ios-apps/0.1.2`
- License and attribution notice: [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md)

They are vendored so this repository declares its own Codex workflows without
requiring globally enabled user plugins. When upgrading, replace all nine
directories together, review the upstream plugin manifest and MCP definition,
then rerun the prompt-isolation and project verification checks.

The upstream plugin requests `xcodebuildmcp@latest`; this repository pins
`xcodebuildmcp@2.6.2` in `.codex/config.toml` for reproducibility.
