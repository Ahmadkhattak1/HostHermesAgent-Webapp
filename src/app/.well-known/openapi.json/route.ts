import { NextResponse } from "next/server";
import {
  getApiDocumentationUrl,
  getProtectedResourceIdentifier,
} from "@/lib/discovery";

function getOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Host Hermes Agent Control Plane API",
      version: "1.0.0",
      description:
        "Protected first-party control plane endpoints used by the Host Hermes Agent webapp.",
    },
    servers: [
      {
        url: getProtectedResourceIdentifier().replace(/\/$/, ""),
      },
    ],
    externalDocs: {
      description: "Human-readable API documentation",
      url: getApiDocumentationUrl(),
    },
    security: [
      {
        firebaseIdToken: [],
      },
    ],
    components: {
      securitySchemes: {
        firebaseIdToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Firebase ID token obtained through the Host Hermes Agent browser sign-in flow.",
        },
      },
      schemas: {
        AuthenticatedUser: {
          type: "object",
          required: ["id", "displayName", "email", "photoUrl"],
          properties: {
            id: { type: "string" },
            displayName: { type: ["string", "null"] },
            email: { type: ["string", "null"], format: "email" },
            photoUrl: { type: ["string", "null"], format: "uri" },
          },
        },
        AuthSessionEnvelope: {
          type: "object",
          required: ["user"],
          properties: {
            requestId: { type: "string" },
            user: { $ref: "#/components/schemas/AuthenticatedUser" },
          },
        },
        BillingState: {
          type: "object",
          required: ["canManageBilling", "hasActiveSubscription", "profile"],
          properties: {
            canManageBilling: { type: "boolean" },
            hasActiveSubscription: { type: "boolean" },
            requestId: { type: "string" },
            profile: {
              type: "object",
              required: ["tenantId", "userId", "createdAt", "updatedAt"],
              properties: {
                tenantId: { type: "string" },
                userId: { type: "string" },
                email: { type: ["string", "null"], format: "email" },
                fullName: { type: ["string", "null"] },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        PublicInstanceRecord: {
          type: "object",
          required: ["id", "createdAt", "dropletName", "image", "region", "size", "sshPort", "sshUser", "status", "tenantId", "updatedAt", "bootstrapLogPath", "bootstrapSessionName"],
          properties: {
            id: { type: "string" },
            bootstrapLogPath: { type: "string" },
            bootstrapSessionName: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            destroyedAt: { type: ["string", "null"], format: "date-time" },
            destroyReason: { type: ["string", "null"] },
            digitalOceanStatus: { type: ["string", "null"] },
            dropletId: { type: ["integer", "null"] },
            dropletName: { type: "string" },
            errorMessage: { type: ["string", "null"] },
            host: { type: ["string", "null"] },
            hermesInstallTriggeredAt: {
              type: ["string", "null"],
              format: "date-time",
            },
            image: { type: "string" },
            latencyMs: { type: ["integer", "null"] },
            publicIpv4: { type: ["string", "null"] },
            region: { type: "string" },
            size: { type: "string" },
            sshPort: { type: "integer" },
            sshUser: { type: "string" },
            status: {
              type: "string",
              enum: ["queued", "creating", "booting", "ready", "failed", "destroyed"],
            },
            tenantId: { type: "string" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        InstanceEnvelope: {
          type: "object",
          required: ["instance"],
          properties: {
            requestId: { type: "string" },
            instance: {
              oneOf: [
                { $ref: "#/components/schemas/PublicInstanceRecord" },
                { type: "null" },
              ],
            },
          },
        },
        CheckoutSessionEnvelope: {
          type: "object",
          required: ["sessionId", "url"],
          properties: {
            requestId: { type: "string" },
            sessionId: { type: "string" },
            url: { type: "string", format: "uri" },
          },
        },
        CheckoutConfirmEnvelope: {
          type: "object",
          required: ["active", "nextPath", "subscriptionStatus"],
          properties: {
            active: { type: "boolean" },
            nextPath: { type: "string" },
            requestId: { type: "string" },
            subscriptionStatus: { type: ["string", "null"] },
          },
        },
        TerminalSessionEnvelope: {
          type: "object",
          required: ["cursor", "sessionId", "socketToken"],
          properties: {
            autoInstallStarted: { type: "boolean" },
            cursor: { type: "integer" },
            requestId: { type: "string" },
            sessionId: { type: "string" },
            socketToken: { type: "string" },
          },
        },
        TerminalMutationEnvelope: {
          type: "object",
          required: ["ok"],
          properties: {
            ok: { type: "boolean", const: true },
            requestId: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/auth/session": {
        get: {
          summary: "Resolve the authenticated session",
          responses: {
            "200": {
              description: "Authenticated session",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSessionEnvelope" },
                },
              },
            },
          },
        },
      },
      "/billing/state": {
        get: {
          summary: "Fetch subscription and billing state",
          responses: {
            "200": {
              description: "Billing state",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/BillingState" },
                },
              },
            },
          },
        },
      },
      "/billing/stripe/checkout/session": {
        post: {
          summary: "Create a Stripe Checkout session for the current user",
          responses: {
            "200": {
              description: "Checkout session",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckoutSessionEnvelope" },
                },
              },
            },
          },
        },
      },
      "/billing/stripe/checkout/confirm": {
        post: {
          summary: "Confirm a Stripe Checkout completion for the current user",
          responses: {
            "200": {
              description: "Checkout confirmation",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CheckoutConfirmEnvelope" },
                },
              },
            },
          },
        },
      },
      "/instances": {
        get: {
          summary: "Fetch the latest instance for the current tenant",
          responses: {
            "200": {
              description: "Instance envelope",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InstanceEnvelope" },
                },
              },
            },
          },
        },
        post: {
          summary: "Provision a new instance",
          responses: {
            "200": {
              description: "Instance envelope",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InstanceEnvelope" },
                },
              },
            },
          },
        },
      },
      "/instances/{instanceId}": {
        get: {
          summary: "Fetch a specific instance",
          parameters: [
            {
              in: "path",
              name: "instanceId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Instance envelope",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InstanceEnvelope" },
                },
              },
            },
          },
        },
      },
      "/instances/{instanceId}/terminal/session": {
        get: {
          summary: "Resume a terminal session",
          parameters: [
            {
              in: "path",
              name: "instanceId",
              required: true,
              schema: { type: "string" },
            },
            {
              in: "query",
              name: "sessionId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Terminal session",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TerminalSessionEnvelope" },
                },
              },
            },
          },
        },
        post: {
          summary: "Start a terminal session",
          parameters: [
            {
              in: "path",
              name: "instanceId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Terminal session",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TerminalSessionEnvelope" },
                },
              },
            },
          },
        },
      },
      "/instances/{instanceId}/terminal/action": {
        post: {
          summary: "Trigger a terminal action on the instance",
          parameters: [
            {
              in: "path",
              name: "instanceId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Action accepted",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/TerminalMutationEnvelope" },
                },
              },
            },
          },
        },
      },
    },
  };
}

export function GET() {
  return NextResponse.json(getOpenApiDocument(), {
    headers: {
      "Content-Type": "application/vnd.oai.openapi+json;version=3.1",
    },
  });
}

export function HEAD() {
  return new NextResponse(null, {
    headers: {
      "Content-Type": "application/vnd.oai.openapi+json;version=3.1",
    },
  });
}
