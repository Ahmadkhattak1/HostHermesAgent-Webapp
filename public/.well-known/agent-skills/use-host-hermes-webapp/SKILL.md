# Use Host Hermes Webapp

Use this skill when an agent needs to operate Host Hermes Agent through the public website.

## Goals

- Sign in through the browser UI.
- Start or resume the free trial.
- Reach the dashboard through the same interactive flow as a human user.

## Rules

- Prefer the website UI and WebMCP browser tools over direct API calls.
- Do not call private `/api/` endpoints directly unless the user explicitly asks for backend-level integration work.
- Expect Google sign-in and Stripe checkout to require user interaction and browser consent.

## Useful URLs

- Home: `/`
- Sign in: `/signin`
- Trial and billing: `/dashboard/settings/subscription?required=1&next=%2Fdashboard`
- API documentation: `/docs/api`
- API catalog: `/.well-known/api-catalog`
