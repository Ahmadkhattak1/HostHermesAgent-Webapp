export type AuthenticatedUser = {
  displayName: string | null;
  email: string | null;
  id: string;
  photoUrl: string | null;
};

export type AuthSessionEnvelope = {
  requestId?: string;
  user: AuthenticatedUser;
};

export type BillingProfile = {
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  currentPeriodEnd: string | null;
  deprovisionReason: string | null;
  deprovisionScheduledAt: string | null;
  deprovisionedAt: string | null;
  email: string | null;
  fullName: string | null;
  paymentFailureStartedAt: string | null;
  paymentGraceEndsAt: string | null;
  planPriceId: string | null;
  stripeCheckoutSessionId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  tenantId: string;
  updatedAt: string;
  userId: string;
};

export type BillingState = {
  canManageBilling: boolean;
  hasActiveSubscription: boolean;
  profile: BillingProfile;
  requestId?: string;
};

export type PublicInstanceRecord = {
  bootstrapLogPath: string;
  bootstrapSessionName: string;
  createdAt: string;
  destroyedAt: string | null;
  destroyReason: string | null;
  digitalOceanStatus: string | null;
  dropletId: number | null;
  dropletName: string;
  errorMessage: string | null;
  host: string | null;
  hermesInstallTriggeredAt: string | null;
  id: string;
  image: string;
  latencyMs: number | null;
  publicIpv4: string | null;
  region: string;
  size: string;
  sshPort: number;
  sshUser: string;
  status: "queued" | "creating" | "booting" | "ready" | "failed" | "destroyed";
  tenantId: string;
  updatedAt: string;
};

export type InstanceEnvelope = {
  instance: PublicInstanceRecord | null;
  requestId?: string;
};

export type CheckoutSessionEnvelope = {
  requestId?: string;
  sessionId: string;
  url: string;
};

export type CheckoutConfirmEnvelope = {
  active: boolean;
  nextPath: string;
  requestId?: string;
  subscriptionStatus: string | null;
};

export type PortalSessionEnvelope = {
  requestId?: string;
  url: string;
};

export type TerminalSessionEnvelope = {
  autoInstallStarted?: boolean;
  cursor: number;
  requestId?: string;
  sessionId: string;
  socketToken: string;
};

export type TerminalOutputEnvelope = {
  cursor: number;
  output: string;
  requestId?: string;
  reset: boolean;
};

export type TerminalMutationEnvelope = {
  ok: true;
  requestId?: string;
};

export type ControlPlaneErrorPayload = {
  error?: string;
  requestId?: string;
};
