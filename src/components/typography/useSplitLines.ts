"use client";

import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { readMotionGate } from "@/lib/motion";
import { scheduleScrollTriggerRefresh } from "@/lib/scrollTriggerRefresh";

type UseSplitLinesOptions = {
  scope: RefObject<HTMLElement | null>;
};

export function useSplitLines({ scope }: UseSplitLinesOptions) {
  useGSAP(
    () => {
      if (!scope.current) return;

      const { prefersReducedMotion, isMobile } = readMotionGate();

      const targets = gsap.utils.toArray<HTMLElement>(".split-lines", scope.current);

      if (prefersReducedMotion || isMobile) {
        targets.forEach((target) => {
          gsap.set(target, { opacity: 1 });
        });
        return;
      }

      const animations: gsap.core.Tween[] = [];
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

        const tween = gsap.fromTo(
          lines,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 2,
            stagger: 0.1,
            ease: "elastic.out(1, 0.8)",
            scrollTrigger: {
              trigger: target,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true
            }
          }
        );

        animations.push(tween);
      });

      const onResize = () => {
        animations.forEach((t) => t.kill());
        splits.forEach((s) => s.revert());
        scheduleScrollTriggerRefresh();
      };

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        animations.forEach((t) => t.kill());
        splits.forEach((s) => s.revert());
      };
    },
    { scope }
  );
}
