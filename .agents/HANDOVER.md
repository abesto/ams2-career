## Handover

Repo: `/home/abesto/Projects/ams2-career`

Current HEAD: `478ef21` (`chore: upgrade cra-compatible tooling`)

### What is already done

#### Yarn -> pnpm migration

- Completed and committed as `b43bcb0 chore: migrate from yarn to pnpm`
- Key changes:
  - `package.json` scripts/lint-staged switched from `yarn` to `pnpm`
  - added `packageManager: "pnpm@10.13.1"`
  - added `pnpm-lock.yaml`
  - removed `yarn.lock` and `.yarnrc.yml`
  - `.husky/pre-commit` updated to `pnpm`
  - added direct deps needed under pnpm strictness:
    - `redux`
    - `@types/testing-library__jest-dom`

#### Coverage work completed earlier

- Added focused tests and committed them area by area:
  - `f2dbf93 test: cover save loading and migrations`
  - `9f98ac1 test: cover career progression logic`
  - `e34d200 test: cover achievement rules`
  - `e28a607 test: cover race generation state`
  - `82e9c70 test: cover settings and analytics flows`
- Bug fix discovered by tests:
  - `src/store/saveload.ts` `deserialize()` now accepts legacy plain JSON saves before attempting decompression.
- Supporting export added:
  - `mainPageReducer` exported from `src/app/pages/MainPage/slice/index.ts`

#### Dependency upgrade work already committed

- `d1397ed chore: upgrade non-react runtime dependencies`
- `478ef21 chore: upgrade cra-compatible tooling`

### Important current package state

`package.json` now already contains:

- React stack still held at `18`
- upgraded runtime/tooling in places, including:
  - `@reduxjs/toolkit` `2.12.0`
  - `redux` `5.0.1`
  - `redux-injectors` `2.1.0`
  - `redux-saga` `1.5.0`
  - `react-redux` `8.1.3`
  - `react-helmet-async` `3.0.0`
  - `typescript` `4.9.5`
  - `eslint` `8.57.1`
  - `vite`, `vitest`, `jsdom`, `@vitejs/plugin-react`, `vite-tsconfig-paths`
- scripts currently point to Vite/Vitest:
  - `"start": "vite"`
  - `"build": "vite build"`
  - `"test": "vitest run"`

### Critical observation

The repo appears to be in a **partial CRA -> Vite migration state**:

- `package.json` points to Vite/Vitest
- `src/index.tsx` already uses `createRoot`
- but there is **no** `vite.config.*`
- there is **no** root `index.html`
- `src/setupTests.ts` still exists
- `public/` still exists

Do **not** assume the app currently runs or tests currently pass under Vite. The migration is not obviously complete from the file layout.

### Other repo state

- Worktree was clean when this handover was written.
- `pnpm` commands inside the sandbox can fail with:
  - `[ERROR] unable to open database file`
- `pnpm outdated` succeeded only with escalated permissions earlier.

### Recommended plan from here

1. Verify the actual current state before editing further:
   - `git status --short`
   - inspect `package.json`
   - inspect whether any local uncommitted Vite files were created later
2. Finish or roll back the partial CRA -> Vite migration as a coherent step.
   - Preferred direction discussed with user: **migrate to Vite**, do **not** `eject`.
3. Once build/test infrastructure is coherent again:
   - run install
   - run typecheck
   - run tests
   - fix breakage from the already-committed non-React/tooling upgrades
4. After Vite is stable, upgrade React and related packages together:
   - `react`
   - `react-dom`
   - `react-is`
   - `react-test-renderer`
   - `@types/react`
   - `@types/react-dom`
   - `@types/react-test-renderer`
   - `@testing-library/react`
   - `@testing-library/jest-dom`
5. Remove obsolete CRA-era and test-typing dependencies once no longer needed.
   - likely `react-scripts`
   - likely `@types/testing-library__jest-dom`
   - possibly other CRA-specific transitive support packages

### React upgrade guidance already established with user

Best migration order agreed in-thread:

1. Upgrade non-React deps first
2. Fix code/tests
3. Migrate from CRA to Vite
4. Drop CRA-era dependencies
5. Upgrade React and React-adjacent packages
6. Fix code/tests again

Reasoning:

- `eject` is not the right modernization path
- Vite is a better target than exposed CRA internals
- React 19 is cleaner after the build/test platform is modernized

### Likely follow-up checks

- inspect `src/index.tsx`, `src/setupTests.ts`, `public/index.html`, and `package.json`
- confirm whether Vitest shims/setup were added anywhere
- check if Jest-specific tests/mocks need conversion
- check whether `README.md` and developer scripts still mention CRA behavior
