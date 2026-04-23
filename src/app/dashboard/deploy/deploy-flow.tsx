"use client";

import Image from "next/image";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/console.module.css";
import { SupportContactButton } from "@/components/support-contact-button";
import { controlPlaneJsonRequest } from "@/lib/control-plane/client";
import type { InstanceEnvelope, PublicInstanceRecord } from "@/lib/control-plane/types";
import { logClientError, logClientInfo } from "@/lib/logging/client";
import { sanitizeUserFacingErrorMessage } from "@/lib/user-facing-errors";

type DeployFlowProps = {
  initialInstance: PublicInstanceRecord | null;
};

async function requestInstance(url: string, method: "GET" | "POST") {
  const payload = await controlPlaneJsonRequest<InstanceEnvelope>(url, method);
  return payload.instance;
}

function shouldAutoProvision(instance: PublicInstanceRecord | null) {
  return instance === null || instance.status === "failed" || instance.status === "destroyed";
}

function getInstanceNotice(instance: PublicInstanceRecord | null) {
  if (!instance) {
    return null;
  }

  if (instance.status === "destroyed" && instance.destroyReason === "instance_missing") {
    return "Your previous Hermes instance is no longer available. Deploy a new one to continue.";
  }

  if (instance.status === "destroyed") {
    return "This Hermes instance is no longer active. Deploy a new one to continue.";
  }

  return null;
}

function getActiveStepIndex(instance: PublicInstanceRecord | null) {
  if (!instance || instance.status === "queued" || instance.status === "destroyed") {
    return 0;
  }

  switch (instance.status) {
    case "creating":
      return 1;
    case "booting":
      return 2;
    case "ready":
      return 3;
    case "failed":
      return 1;
    default:
      return 0;
  }
}

type StepState = "active" | "completed" | "pending";
type StepKind = "provision" | "ready" | "install" | "terminal";
type StatusStep = {
  description: string | null;
  key: StepKind;
  label: string;
  state: StepState;
};

function getStepDescription(step: StepKind, state: StepState) {
  switch (step) {
    case "provision":
      return state === "active"
        ? "Allocating your hosted environment..."
        : "Instance allocated successfully.";
    case "ready":
      if (state === "active") {
        return "Configuring base dependencies...";
      }

      if (state === "completed") {
        return "Base dependencies configured.";
      }

      return null;
    case "install":
      if (state === "active") {
        return "Installing Hermes Agent...";
      }

      if (state === "completed") {
        return "Hermes Agent installed.";
      }

      return null;
    case "terminal":
      return state === "active" ? "Opening your browser terminal..." : null;
    default:
      return null;
  }
}

function getStepState(index: number, activeIndex: number): StepState {
  if (index < activeIndex) {
    return "completed";
  }

  if (index === activeIndex) {
    return "active";
  }

  return "pending";
}

const STEP_LABELS: Array<{ key: StepKind; label: string }> = [
  {
    key: "provision",
    label: "Provisioning instance",
  },
  {
    key: "ready",
    label: "Getting your instance ready",
  },
  {
    key: "install",
    label: "Installing Hermes Agent",
  },
  {
    key: "terminal",
    label: "Launching terminal",
  },
];

function buildStatusSteps(instance: PublicInstanceRecord | null): StatusStep[] {
  const activeIndex = getActiveStepIndex(instance);

  return STEP_LABELS.map((step, index) => {
    const state = getStepState(index, activeIndex);

    return {
      description: getStepDescription(step.key, state),
      key: step.key,
      label: step.label,
      state,
    };
  });
}

function StatusStepIcon({ state, stepKey }: { state: StepState; stepKey: StepKind }) {
  if (state === "completed") {
    return <span className={styles.statusCheckmark}>&#10003;</span>;
  }

  if (state === "active") {
    return <span className={styles.statusActiveDot} />;
  }

  if (stepKey === "terminal") {
    return (
      <span className={styles.statusTerminalGlyph} aria-hidden="true">
        <span className={styles.statusTerminalCursor} />
      </span>
    );
  }

  return (
    <span className={styles.statusEllipsis} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function DeployFlow({ initialInstance }: DeployFlowProps) {
  const router = useRouter();
  const autoProvisionRef = useRef(false);
  const autoOpenTerminalRef = useRef(false);
  const [instance, setInstance] = useState(initialInstance);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const instanceNotice = useMemo(() => getInstanceNotice(instance), [instance]);
  const statusSteps = useMemo(() => buildStatusSteps(instance), [instance]);
  const terminalHref = instance ? `/dashboard/instances/${instance.id}/terminal` : null;
  const shouldPoll =
    instance !== null &&
    instance.status !== "failed" &&
    instance.status !== "ready" &&
    instance.status !== "destroyed";

  async function provisionInstance() {
    setError(null);
    setIsWorking(true);
    logClientInfo("deploy", "instance.provision_started");

    try {
      const nextInstance = await requestInstance("/api/v1/instances", "POST");
      setInstance(nextInstance);
      logClientInfo("deploy", "instance.provision_completed", {
        instanceId: nextInstance?.id,
        status: nextInstance?.status,
      });
    } catch (caughtError: unknown) {
      logClientError("deploy", "instance.provision_failed", caughtError);
      setError(
        caughtError instanceof Error
          ? sanitizeUserFacingErrorMessage(caughtError.message)
          : "Could not provision the Hermes instance.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  useEffect(() => {
    logClientInfo("deploy", "view.loaded", {
      initialStatus: initialInstance?.status ?? null,
      instanceId: initialInstance?.id ?? null,
    });
  }, [initialInstance]);

  useEffect(() => {
    if (autoProvisionRef.current || isWorking || !shouldAutoProvision(instance)) {
      return;
    }

    autoProvisionRef.current = true;
    queueMicrotask(() => {
      void provisionInstance();
    });
  }, [instance, isWorking]);

  useEffect(() => {
    if (!instance || instance.status !== "ready" || !terminalHref) {
      autoOpenTerminalRef.current = false;
      return;
    }

    if (autoOpenTerminalRef.current) {
      return;
    }

    autoOpenTerminalRef.current = true;
    logClientInfo("deploy", "instance.ready_redirecting", {
      instanceId: instance.id,
      terminalHref,
    });
    startTransition(() => {
      router.replace(terminalHref);
    });
  }, [instance, router, terminalHref]);

  useEffect(() => {
    if (!shouldPoll) {
      return;
    }

    let cancelled = false;
    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const nextInstance = instance
            ? await requestInstance(`/api/v1/instances/${instance.id}`, "GET")
            : await requestInstance("/api/v1/instances", "GET");

          setInstance(nextInstance);

          if (cancelled || !nextInstance || nextInstance.status !== "ready") {
            return;
          }

          logClientInfo("deploy", "instance.ready", {
            instanceId: nextInstance.id,
          });
        } catch (caughtError: unknown) {
          if (!cancelled) {
            logClientError("deploy", "instance.refresh_failed", caughtError, {
              instanceId: instance?.id ?? null,
            });
            setError(
              caughtError instanceof Error
                ? sanitizeUserFacingErrorMessage(caughtError.message)
                : "Could not refresh the instance state.",
            );
          }
        }
      })();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [router, shouldPoll, instance]);

  return (
    <div className={styles.statusShell}>
      <header className={styles.statusTopBar}>
        <div className={styles.statusBrand}>
          <div className={styles.statusBrandMark}>
            <Image
              src="/assets/figma/hero-badge.png"
              alt=""
              width={40}
              height={40}
              priority
            />
          </div>
          <span className={styles.statusBrandName}>Hermes Agent</span>
        </div>
        <SupportContactButton buttonClassName={styles.statusSupportButton}>
          <span className={styles.statusSupport}>Support</span>
        </SupportContactButton>
      </header>

      <section className={styles.statusCanvas}>
        <div className={styles.statusLayout}>
          <div className={styles.statusPanel}>
            <div className={styles.statusIntro}>
              <h1 className={styles.statusTitle}>HostHermesAgent Setup</h1>
              <p className={styles.statusCopy}>
                Please wait while we prepare your environment.
              </p>
            </div>

            <div className={styles.statusStepper}>
              {statusSteps.map((step, index) => {
                const hasConnector = index < statusSteps.length - 1;
                const connectorDone = step.state === "completed";

                return (
                  <div key={step.key} className={styles.statusStep}>
                    <div className={styles.statusMarkerColumn}>
                      <div
                        className={`${styles.statusMarker} ${
                          step.state === "completed"
                            ? styles.statusMarkerCompleted
                            : step.state === "active"
                              ? styles.statusMarkerActive
                              : styles.statusMarkerPending
                        }`}
                      >
                        <StatusStepIcon state={step.state} stepKey={step.key} />
                      </div>
                      {hasConnector ? (
                        <div
                          className={`${styles.statusConnector} ${
                            connectorDone
                              ? styles.statusConnectorCompleted
                              : styles.statusConnectorPending
                          }`}
                        />
                      ) : null}
                    </div>

                    <div className={styles.statusStepCopy}>
                      <p
                        className={`${styles.statusStepLabel} ${
                          step.state === "pending" ? styles.statusStepLabelPending : ""
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.description ? (
                        <p
                          className={`${styles.statusStepDescription} ${
                            step.state === "completed"
                              ? styles.statusStepDescriptionCompleted
                              : ""
                          }`}
                        >
                          {step.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {error ? <p className={`${styles.error} ${styles.statusError}`}>{error}</p> : null}
            {instanceNotice ? (
              <p className={`${styles.note} ${styles.statusNotice}`}>{instanceNotice}</p>
            ) : null}
            {instance?.errorMessage ? (
              <p className={`${styles.error} ${styles.statusError}`}>
                {sanitizeUserFacingErrorMessage(instance.errorMessage)}
              </p>
            ) : null}
            {isWorking && !instance ? (
              <p className={`${styles.note} ${styles.statusNotice}`}>
                Starting your Hermes environment now.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
