# Third-party notices

This repository vendors workflow skills under `.agents/skills` so its Codex
configuration remains reproducible without user-global installations.

## Matt Pocock engineering skills

- Source: <https://github.com/mattpocock/skills>
- Version: `v1.1.0`
- Vendored paths: Matt Pocock skill directories identified by `github-repo:
  https://github.com/mattpocock/skills` in their `SKILL.md` frontmatter
- Per-skill source tree hashes: recorded in each `SKILL.md` metadata block
- License: MIT

```text
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## OpenAI Build iOS Apps skills

- Source: <https://github.com/openai/plugins/tree/main/plugins/build-ios-apps>
- Plugin version: `0.1.2`
- Vendored paths: the nine `ios-*` and `swiftui-*` directories listed in
  `.agents/skills/BUILD_IOS_APPS.md`
- License: MIT, as declared by the plugin manifest
- Author identified by the plugin manifest: OpenAI

The cached plugin artifact did not contain a standalone license file. The MIT
license text corresponding to its declared license is reproduced here with the
author attribution from the manifest:

```text
MIT License

Copyright (c) OpenAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Web MVP agent skills

The following project-scoped skills were installed with `gh skill` at pinned
commits. Exact source paths and tree hashes are recorded in each `SKILL.md`
frontmatter.

| Vendored skill | Source | Pin | License |
| --- | --- | --- | --- |
| `react-admin` | <https://github.com/marmelab/react-admin> | `e1beaa2520de46e109236483876df50537c18294` | MIT |
| `cloudflare` | <https://github.com/cloudflare/skills> | `70215303d44a81a0db3219428f4825b604fc6061` | Apache-2.0 |
| `playwright-cli` | <https://github.com/microsoft/playwright-cli> | `eee5a185c98e6b04d88f580d45a854e9692ab50b` | Apache-2.0 |
| `frontend-testing-debugging`, `react-best-practices` | <https://github.com/openai/plugins/tree/main/plugins/build-web-apps> | `11c74d6ba24d3a6d48f54a194cd00ef3beea18f9` | MIT, as declared by the plugin manifest |

Upstream license files and notices control these dependencies. The repository
retains this inventory so updates can recheck attribution before accepting a
new pin.

## Research discovery skill

| Vendored skill | Source | Pin | License |
| --- | --- | --- | --- |
| `last30days` | <https://github.com/mvanhorn/last30days-skill> | `249c7a4c040558a903d6838dee31012980d4946d` (`3.16.0`) | MIT |

The installed skill includes a vendored MIT-licensed X-search client. Upstream
license files and notices remain authoritative; the exact source commit and
skill tree hash are recorded in the installed `SKILL.md` frontmatter.
