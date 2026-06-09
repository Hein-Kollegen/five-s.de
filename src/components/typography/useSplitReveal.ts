"use client";

import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { readMotionGate } from "@/lib/motion";
import { scheduleScrollTriggerRefresh } from "@/lib/scrollTriggerRefresh";

/**
 * Scroll-in reveal for elements inside `scope`, in one of two variants:
 *
 * - `"lines"` — targets marked `.split-lines`; each is split into masked lines
 *   (via SplitText) that ease in staggered. Re-splits on resize.
 * - `"scale"` — targets marked `.split-scale`; each element scales/fades in as a
 *   whole, no text splitting.
 *
 * Both share the gate, the easing, and the once-per-element ScrollTrigger; they
 * differ only in what they reveal and the from-values below.
 */
type SplitRevealVariant = "lines" | "scale";

type UseSplitRevealOptions = {
  scope: RefObject<HTMLElement | null>;
  variant: SplitRevealVariant;
};

const REVEAL_EASE = "elastic.out(1, 0.8)";

const revealScrollTrigger = (trigger: HTMLElement) => ({
  trigger,
  start: "top 80%",
  toggleActions: "play none none none" as const,
  once: true
});

const SELECTOR: Record<SplitRevealVariant, string> = {
  lines: ".split-lines",
  scale: ".split-scale"
};

export function useSplitReveal({ scope, variant }: UseSplitRevealOptions) {
  useGSAP(
    () => {
      if (!scope.current) return;

      const targets = gsap.utils.toArray<HTMLElement>(SELECTOR[variant], scope.current);
      if (!targets.length) return;

      if (!readMotionGate().shouldAnimate) {
        // Resting state: snap everything visible, no motion.
        gsap.set(targets, { opacity: 1, scale: 1 });
        return;
      }

      if (variant === "scale") {
        const tweens = targets.map((target) =>
          gsap.fromTo(
            target,
            { scale: 0.6, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 1,
              ease: REVEAL_EASE,
              scrollTrigger: revealScrollTrigger(target)
            }
          )
        );

        return () => tweens.forEach((tween) => tween.kill());
      }

      // variant === "lines": split each target into masked lines, reveal per line.
      const tweens: gsap.core.Tween[] = [];
      const splits: SplitText[] = [];

      targets.forEach((target) => {
        const split = SplitText.create(target, {
          type: "words, lines",
          linesClass: "line++",
          mask: "lines"
        });
        splits.push(split);

        const lines = split.lines as HTMLElement[];
        if (!lines.length) return;

        gsap.set(lines, { transformOrigin: "center center" });

        tweens.push(
          gsap.fromTo(
            lines,
            { scale: 0.9, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 2,
              stagger: 0.1,
              ease: REVEAL_EASE,
              scrollTrigger: revealScrollTrigger(target)
            }
          )
        );
      });

      const onResize = () => {
        tweens.forEach((tween) => tween.kill());
        splits.forEach((split) => split.revert());
        scheduleScrollTriggerRefresh();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        tweens.forEach((tween) => tween.kill());
        splits.forEach((split) => split.revert());
      };
    },
    { scope }
  );
}
