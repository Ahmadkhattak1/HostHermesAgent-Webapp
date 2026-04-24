"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/console.module.css";
import { useAnimatedPresence } from "@/components/use-animated-presence";
import { SUPPORT_EMAIL } from "@/lib/site-config";

type SupportContactButtonProps = {
  buttonClassName: string;
  children: ReactNode;
};

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 3.5L10.5 10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M10.5 3.5L3.5 10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const element = document.createElement("textarea");
  element.value = value;
  element.setAttribute("readonly", "true");
  element.style.position = "fixed";
  element.style.opacity = "0";
  document.body.append(element);
  element.focus();
  element.select();

  const wasCopied = document.execCommand("copy");
  element.remove();

  if (!wasCopied) {
    throw new Error("Clipboard copy is not available.");
  }
}

export function SupportContactButton({
  buttonClassName,
  children,
}: SupportContactButtonProps) {
  const copyResetTimerRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const { isMounted, state } = useAnimatedPresence(isOpen, 180);

  function resetCopyState() {
    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = null;
    }

    setIsCopied(false);
    setCopyError(null);
  }

  function closeDialog() {
    resetCopyState();
    setIsOpen(false);
  }

  function openDialog() {
    resetCopyState();
    setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        resetCopyState();
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          openDialog();
        }}
      >
        {children}
      </button>

      {isMounted ? (
        <div className={styles.supportDialogLayer} data-state={state}>
          <div
            className={styles.supportDialogBackdrop}
            aria-hidden="true"
            onClick={() => {
              closeDialog();
            }}
          />
          <div className={styles.supportDialogPositioner}>
            <div
              className={styles.supportDialog}
              data-state={state}
              role="dialog"
              aria-modal="true"
              aria-labelledby="support-dialog-title"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <div className={styles.supportDialogHeader}>
                <div className={styles.supportDialogIntro}>
                  <p className={styles.supportDialogEyebrow}>Support</p>
                  <h2 id="support-dialog-title" className={styles.supportDialogTitle}>
                    Reach us directly
                  </h2>
                </div>
                <button
                  type="button"
                  className={styles.supportDialogCloseButton}
                  aria-label="Close support modal"
                  onClick={() => {
                    closeDialog();
                  }}
                >
                  <CloseIcon />
                </button>
              </div>

              <p className={styles.supportDialogCopy}>
                Email support any time and we&apos;ll reply there.
              </p>

              <div className={styles.supportDialogRow}>
                <div className={styles.supportDialogEmail}>{SUPPORT_EMAIL}</div>
                <button
                  type="button"
                  className={styles.supportDialogCopyButton}
                  onClick={() => {
                    void (async () => {
                      try {
                        await copyToClipboard(SUPPORT_EMAIL);
                        setCopyError(null);
                        setIsCopied(true);

                        if (copyResetTimerRef.current !== null) {
                          window.clearTimeout(copyResetTimerRef.current);
                        }

                        copyResetTimerRef.current = window.setTimeout(() => {
                          setIsCopied(false);
                          copyResetTimerRef.current = null;
                        }, 1800);
                      } catch (error) {
                        setCopyError(
                          error instanceof Error
                            ? error.message
                            : "Could not copy the email address.",
                        );
                      }
                    })();
                  }}
                >
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>

              {copyError ? (
                <p className={styles.supportDialogError}>{copyError}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
