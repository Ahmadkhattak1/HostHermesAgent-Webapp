import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import httpProxy from "http-proxy";
import selfsigned from "selfsigned";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = dirname(CURRENT_DIR);
const CERT_DIR = join(APP_ROOT, ".cert");
const CERT_KEY_PATH = join(CERT_DIR, "localhost-key.pem");
const CERT_PATH = join(CERT_DIR, "localhost-cert.pem");

const PUBLIC_HTTP_PORT = Number(process.env.PORT ?? "3000");
const PUBLIC_HTTPS_PORT = Number(process.env.HTTPS_PORT ?? "3443");
const NEXT_INTERNAL_PORT = Number(process.env.NEXT_INTERNAL_PORT ?? "3001");
const BACKEND_PORT = Number(process.env.CONTROL_PLANE_PORT ?? "4000");

const FIREBASE_AUTH_HOST =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  "hosthermesagent.firebaseapp.com";

function ensureLocalCertificate() {
  if (existsSync(CERT_KEY_PATH) && existsSync(CERT_PATH)) {
    return {
      cert: readFileSync(CERT_PATH),
      key: readFileSync(CERT_KEY_PATH),
    };
  }

  mkdirSync(CERT_DIR, { recursive: true });

  const pems = selfsigned.generate(
    [{ name: "commonName", value: "localhost" }],
    {
      algorithm: "sha256",
      days: 30,
      extensions: [
        {
          altNames: [
            { type: 2, value: "localhost" },
            { ip: "127.0.0.1", type: 7 },
            { ip: "::1", type: 7 },
          ],
          name: "subjectAltName",
        },
      ],
      keySize: 2048,
    },
  );

  writeFileSync(CERT_KEY_PATH, pems.private, "utf8");
  writeFileSync(CERT_PATH, pems.cert, "utf8");

  return {
    cert: Buffer.from(pems.cert),
    key: Buffer.from(pems.private),
  };
}

function createProxy(label, target, options = {}) {
  const proxy = httpProxy.createProxyServer({
    changeOrigin: false,
    target,
    ws: true,
    xfwd: true,
    ...options,
  });

  proxy.on("error", (error, request, response) => {
    const path = request?.url ?? "/";
    console.error(`[proxy:${label}] ${path} failed:`, error.message);

    if (!response || response.headersSent) {
      return;
    }

    response.writeHead(502, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end(`Could not reach ${label}.`);
  });

  return proxy;
}

const appProxy = createProxy("next", `http://127.0.0.1:${NEXT_INTERNAL_PORT}`);
const backendProxy = createProxy(
  "control-plane",
  `http://127.0.0.1:${BACKEND_PORT}`,
);
const firebaseProxy = createProxy(
  "firebase-auth",
  `https://${FIREBASE_AUTH_HOST}`,
  {
    changeOrigin: true,
    secure: true,
  },
);

function routeRequest(request, response) {
  const requestUrl = new URL(
    request.url ?? "/",
    `https://${request.headers.host ?? `localhost:${PUBLIC_HTTPS_PORT}`}`,
  );

  if (
    requestUrl.pathname.startsWith("/__/auth/") ||
    requestUrl.pathname.startsWith("/__/firebase/")
  ) {
    firebaseProxy.web(request, response);
    return;
  }

  if (
    requestUrl.pathname === "/health" ||
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.startsWith("/ws/")
  ) {
    backendProxy.web(request, response);
    return;
  }

  appProxy.web(request, response);
}

function routeUpgrade(request, socket, head) {
  const requestUrl = new URL(
    request.url ?? "/",
    `https://${request.headers.host ?? `localhost:${PUBLIC_HTTPS_PORT}`}`,
  );

  if (requestUrl.pathname.startsWith("/ws/")) {
    backendProxy.ws(request, socket, head);
    return;
  }

  appProxy.ws(request, socket, head);
}

const nextBinary = process.platform === "win32" ? "npx.cmd" : "npx";
const nextProcess = spawn(
  nextBinary,
  ["next", "dev", "--port", String(NEXT_INTERNAL_PORT)],
  {
    cwd: APP_ROOT,
    env: {
      ...process.env,
      PORT: String(NEXT_INTERNAL_PORT),
    },
    stdio: "inherit",
  },
);

const httpRedirectServer = createHttpServer((request, response) => {
  const host = request.headers.host ?? `localhost:${PUBLIC_HTTP_PORT}`;
  const [, hostname = "localhost"] = host.match(/^\[?([^\]]+)\]?(?::\d+)?$/) ?? [];
  const target = new URL(
    request.url ?? "/",
    `https://${hostname}:${PUBLIC_HTTPS_PORT}`,
  );

  response.writeHead(307, {
    Location: target.toString(),
  });
  response.end();
});

const httpsServer = createHttpsServer(ensureLocalCertificate(), routeRequest);

httpsServer.on("upgrade", routeUpgrade);

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  httpRedirectServer.close();
  httpsServer.close();

  if (!nextProcess.killed) {
    nextProcess.kill("SIGINT");
  }

  process.exit(exitCode);
}

nextProcess.on("exit", (code) => {
  shutdown(code ?? 0);
});

process.on("SIGINT", () => {
  shutdown(0);
});

process.on("SIGTERM", () => {
  shutdown(0);
});

httpRedirectServer.listen(PUBLIC_HTTP_PORT, () => {
  console.info(
    `[dev-proxy] Redirecting http://localhost:${PUBLIC_HTTP_PORT} -> https://localhost:${PUBLIC_HTTPS_PORT}`,
  );
});

httpsServer.listen(PUBLIC_HTTPS_PORT, () => {
  console.info(
    `[dev-proxy] Secure app origin ready at https://localhost:${PUBLIC_HTTPS_PORT}`,
  );
  console.info(
    `[dev-proxy] Internal Next.js dev server expected on http://localhost:${NEXT_INTERNAL_PORT}`,
  );
  console.info(
    `[dev-proxy] Control plane expected on http://localhost:${BACKEND_PORT}`,
  );
});
