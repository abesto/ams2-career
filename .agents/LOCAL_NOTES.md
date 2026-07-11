## Local Notes

- In this repo, always run `pnpm` commands outside the sandbox.
  - Sandbox runs fail with `unable to open database file`.
  - For `pnpm install`, `pnpm run ...`, `pnpm up`, `pnpm outdated`, and similar commands, request escalated execution immediately instead of retrying in-sandbox first.
- In this repo, use conventional commit messages.
