"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";
import { usePageBoot } from "@/components/providers/PageBootProvider";

const CURSOR_MEDIA_QUERY = "(min-width: 1024px) and (pointer: fine)";
const CURSOR_IDLE_TIMEOUT = 1000;
const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, [data-cursor='interactive']";

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const interactiveRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const fullscreenElRef = useRef<HTMLElement | null>(null);
  const { isLoaderVisible } = usePageBoot();

  useEffect(() => {
    const media = window.matchMedia(CURSOR_MEDIA_QUERY);
    const root = document.documentElement;

    const sync = () => {
      const nextEnabled = media.matches && !isLoaderVisible;
      setEnabled(nextEnabled);
      root.classList.toggle("custom-cursor", nextEnabled);
    };

    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
      root.classList.remove("custom-cursor");
    };
  }, [isLoaderVisible]);

  useEffect(() => {
    const doc = document as FullscreenDocument;

    if (!enabled) {
      if (fullscreenElRef.current) {
        fullscreenElRef.current.classList.remove("custom-cursor-fs");
        fullscreenElRef.current = null;
      }
      setPortalTarget(null);
      return;
    }

    const getFullscreenTarget = () => {
      const fullEl =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;
      return fullEl instanceof HTMLElement ? fullEl : null;
    };

    const syncFullscreenTarget = () => {
      if (fullscreenElRef.current) {
        fullscreenElRef.current.classList.remove("custom-cursor-fs");
      }

      const fullscreenTarget = getFullscreenTarget();
      fullscreenElRef.current = fullscreenTarget;

      if (fullscreenTarget) {
        fullscreenTarget.classList.add("custom-cursor-fs");
      }

      setPortalTarget(fullscreenTarget ?? document.body);
    };

    syncFullscreenTarget();
    document.addEventListener("fullscreenchange", syncFullscreenTarget);
    document.addEventListener("webkitfullscreenchange", syncFullscreenTarget);
    document.addEventListener("mozfullscreenchange", syncFullscreenTarget);
    document.addEventListener("MSFullscreenChange", syncFullscreenTarget);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenTarget);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenTarget);
      document.removeEventListener("mozfullscreenchange", syncFullscreenTarget);
      document.removeEventListener("MSFullscreenChange", syncFullscreenTarget);
      if (fullscreenElRef.current) {
        fullscreenElRef.current.classList.remove("custom-cursor-fs");
        fullscreenElRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !portalTarget || !dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(ring, { xPercent: -50, yPercent: -50, opacity: 0, scale: 1 });
    visibleRef.current = false;
    interactiveRef.current = false;

    const ringXTo = gsap.quickTo(ring, "x", { duration: 0.2, ease: "power3.out" });
    const ringYTo = gsap.quickTo(ring, "y", { duration: 0.2, ease: "power3.out" });
    const ringOpacityTo = gsap.quickTo(ring, "opacity", { duration: 0.18, ease: "power2.out" });

    const showCursor = () => {
      if (visibleRef.current) return;
      visibleRef.current = true;
      gsap.to(dot, { opacity: 1, duration: 0.14, overwrite: true, ease: "power2.out" });
      ringOpacityTo(1);
    };

    const hideCursor = () => {
      if (!visibleRef.current) return;
      visibleRef.current = false;
      gsap.to(dot, { opacity: 0, duration: 0.16, overwrite: true, ease: "power2.out" });
      ringOpacityTo(0);
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        hideCursor();
      }, CURSOR_IDLE_TIMEOUT);
    };

    const onPointerMove = (event: PointerEvent) => {
      const { clientX, clientY } = event;
      gsap.set(dot, { x: clientX, y: clientY });
      ringXTo(clientX);
      ringYTo(clientY);
      showCursor();
      resetIdleTimer();
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(INTERACTIVE_SELECTOR)) {
        return;
      }
      interactiveRef.current = true;
      ringOpacityTo(1);
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(INTERACTIVE_SELECTOR)) {
        return;
      }
      interactiveRef.current = false;
      if (!visibleRef.current) {
        ringOpacityTo(0);
        return;
      }
      ringOpacityTo(1);
    };

    const onPointerLeaveWindow = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      hideCursor();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeaveWindow);
    document.addEventListener("mouseleave", onPointerLeaveWindow);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeaveWindow);
      document.removeEventListener("mouseleave", onPointerLeaveWindow);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      gsap.killTweensOf(ring);
      gsap.killTweensOf(dot);
    };
  }, [enabled, portalTarget]);

  if (!enabled || !portalTarget) return null;

  return createPortal(
    <div className="custom-cursor-layer" aria-hidden="true">
      <div ref={ringRef} className="custom-cursor-ring" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>,
    portalTarget
  );
}
