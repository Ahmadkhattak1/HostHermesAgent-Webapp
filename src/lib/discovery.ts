import { buildAbsoluteUrl } from "@/lib/site-config";

const DEFAULT_FIREBASE_PROJECT_ID = "hosthermesagent";

export function getFirebaseProjectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? DEFAULT_FIREBASE_PROJECT_ID;
}

export function getFirebaseIssuer() {
  return `https://securetoken.google.com/${getFirebaseProjectId()}`;
}

export function getFirebaseJwksUri() {
  return "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
}

export function getProtectedResourceIdentifier() {
  return buildAbsoluteUrl("/api/v1/");
}

export function getOpenApiDocumentUrl() {
  return buildAbsoluteUrl("/.well-known/openapi.json");
}

export function getApiDocumentationUrl() {
  return buildAbsoluteUrl("/docs/api");
}

export function getApiCatalogUrl() {
  return buildAbsoluteUrl("/.well-known/api-catalog");
}

export function getAgentSkillsIndexUrl() {
  return buildAbsoluteUrl("/.well-known/agent-skills/index.json");
}
