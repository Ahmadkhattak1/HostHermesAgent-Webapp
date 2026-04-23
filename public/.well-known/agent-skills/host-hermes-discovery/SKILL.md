# Host Hermes Discovery

Use this skill when an agent needs machine-readable discovery documents for Host Hermes Agent.

## Discovery endpoints

- API catalog: `/.well-known/api-catalog`
- OpenAPI description: `/.well-known/openapi.json`
- OAuth protected resource metadata: `/.well-known/oauth-protected-resource`
- Agent skills index: `/.well-known/agent-skills/index.json`
- Human API docs: `/docs/api`

## Notes

- These discovery documents describe the protected first-party control plane used by the web application.
- Direct access to private backend APIs is not the preferred path for general agents; browser-based flows and WebMCP tools are preferred.
