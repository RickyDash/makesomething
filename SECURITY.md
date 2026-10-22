# Dependency checks

`npm run audit:security` checks all dependencies and rejects high and critical
advisories, with one narrowly scoped exception below. The exception is checked
against the lockfile and cannot apply to a production dependency or a new advisory.

## Temporary development-tool exception (reviewed 2026-10-22)

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
affects `braces` through 3.0.3; there is currently no patched release. It arrives
only through `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` →
`micromatch`. Excessively nested glob patterns can exhaust the stack.

This app does not expose ESLint to website input. Its ESLint configuration does
not set a Next.js `rootDir` glob, the path through which that plugin calls
`fast-glob`. The check runs on repository files in CI. Production dependencies
remain subject to the advisory without any exception.

Remove this exception when the dependency has a fixed release or the upstream
plugin removes it. Reassess it before adding user-supplied glob patterns or
using this dependency in runtime code. Do not downgrade Next.js to satisfy an
automated suggestion to install an older ESLint configuration.
