# e2e

System-wide end-to-end tests through the web UI (`@playwright/test` **1.63.0**).

## Layout

```text
tests/e2e/
├── package.json          # workspace @helloworld/e2e
├── playwright.config.ts  # Chromium project; baseURL from E2E_BASE_URL
├── smoke.spec.ts         # Minimal shell smoke (no VRT upload yet)
├── tsconfig.json
└── README.md
```

## Run

Prerequisites: `web` (+ `api` / Postgres when flows need auth or data).

```bash
pnpm --filter @helloworld/e2e test:smoke
# or
pnpm --filter @helloworld/e2e test
```

Optional: `E2E_BASE_URL` (default `http://localhost:5173`).

Visual Regression Tracker agent wiring stays deferred — see [`openspec/tech-stack.md` § Visual regression](../../openspec/tech-stack.md#visual-regression-playwright--vrt).
