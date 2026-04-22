"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedPresenceState = "open" | "closed";

export function useAnimatedPresence(
  isOpen: boolean,
  durationMs = 180,
) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [state, setState] = useState<AnimatedPresenceState>(
    isOpen ? "open" : "closed",
  );
  const mountFrameRef = useRef<number | null>(null);
  const stateFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (mountFrameRef.current !== null) {
      window.cancelAnimationFrame(mountFrameRef.current);
      mountFrameRef.current = null;
    }

    if (stateFrameRef.current !== null) {
      window.cancelAnimationFrame(stateFrameRef.current);
      stateFrameRef.current = null;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isOpen) {
      mountFrameRef.current = window.requestAnimationFrame(() => {
        setIsMounted(true);
        setState("closed");
        mountFrameRef.current = null;

        stateFrameRef.current = window.requestAnimationFrame(() => {
          setState("open");
          stateFrameRef.current = null;
        });
      });
      return;
    }

    stateFrameRef.current = window.requestAnimationFrame(() => {
      setState("closed");
      stateFrameRef.current = null;
    });

    timeoutRef.current = window.setTimeout(() => {
      setIsMounted(false);
      timeoutRef.current = null;
    }, durationMs);
  }, [durationMs, isOpen]);

  useEffect(() => {
    return () => {
      if (mountFrameRef.current !== null) {
        window.cancelAnimationFrame(mountFrameRef.current);
      }

      if (stateFrameRef.current !== null) {
        window.cancelAnimationFrame(stateFrameRef.current);
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isMounted,
    state,
  };
}
