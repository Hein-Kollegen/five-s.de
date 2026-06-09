/**
 * The motion gate: the single source of truth for "should this section animate?".
 *
 * Every animated section makes the same call — skip motion when the user has asked
 * for reduced motion, or when the viewport is below desktop. Previously that decision
 * was hand-written in ~15 files; it now lives here so the breakpoint and the rule are
 * defined once.
 *
 * The mobile breakpoint is unified with Tailwind's `lg` (1024px): `belowLg` and `lgUp`
 * are exact complements, so there is no width at which layout and motion disagree.
 */
export const MEDIA = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  /** Below Tailwind `lg` (1024px) — "mobile / tablet". */
  belowLg: "(max-width: 1023.98px)",
  /** Tailwind `lg` and up (1024px) — "desktop". */
  lgUp: "(min-width: 1024px)",
} as const;

export type MotionGate = {
  prefersReducedMotion: boolean;
  isMobile: boolean;
  /** True only when neither reduced-motion nor below-lg — the section may animate. */
  shouldAnimate: boolean;
};

/**
 * One-shot read of the motion gate. Call inside the GSAP setup callback (client only).
 * For reactive viewport splits inside a section, keep using `gsap.matchMedia()` with
 * the {@link MEDIA} constants rather than re-reading this.
 */
export function readMotionGate(): MotionGate {
  const prefersReducedMotion = window.matchMedia(MEDIA.reducedMotion).matches;
  const isMobile = window.matchMedia(MEDIA.belowLg).matches;
  return {
    prefersReducedMotion,
    isMobile,
    shouldAnimate: !(prefersReducedMotion || isMobile),
  };
}
