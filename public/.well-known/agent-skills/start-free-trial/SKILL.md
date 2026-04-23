# Start Free Trial

Use this skill when an agent needs to help a user begin the Host Hermes Agent free trial or continue to billing.

## Workflow

1. Open the website in a real browser session.
2. Navigate to `/dashboard/settings/subscription?required=1&next=%2Fdashboard`.
3. If the user is not signed in, complete the sign-in flow first.
4. Continue to Stripe Checkout if the user confirms the purchase or trial start.

## Constraints

- Billing and payment must stay inside the browser experience.
- Respect any user confirmation step before redirecting to checkout.
- Do not attempt to recreate the checkout flow with raw backend API requests.
