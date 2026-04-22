import type { ControlPlaneErrorPayload } from "@/lib/control-plane/types";

export class ControlPlaneError extends Error {
  requestId?: string;
  status: number;

  constructor(
    message: string,
    options: {
      requestId?: string;
      status: number;
    },
  ) {
    super(message);
    this.name = "ControlPlaneError";
    this.requestId = options.requestId;
    this.status = options.status;
  }
}

export function getControlPlaneRequestError(
  response: Response,
  payload: ControlPlaneErrorPayload,
  fallbackMessage: string,
) {
  const suffix = payload.requestId ? ` (request ${payload.requestId})` : "";

  return new ControlPlaneError(`${payload.error ?? fallbackMessage}${suffix}`, {
    requestId: payload.requestId,
    status: response.status,
  });
}
