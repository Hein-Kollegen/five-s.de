# AGENTS.md

How to build in this repo. Read this before touching any component. For *what the project is*, see [`CONTEXT.md`](CONTEXT.md).

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 5.9**
- **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`; tokens defined as CSS custom properties there). A legacy `tailwind.config.js` also exists and mirrors the core colors/fonts — keep the two in sync if you touch tokens.
- **GSAP 3** + `@gsap/react` for all motion · **Swiper** for sliders.
- Output is a fully **static** export (3 prerendered routes: `/`, `/_not-found`).

## Scripts (npm)

- `npm run dev` — dev server (sets `NEXT_WEBPACK_HMR_SOCKET_*` env, Windows `set` syntax).
- `npm run build` — production build. **Primary quality gate** (runs TS typecheck).
- `npm start` — serve the build.
- `npm run lint` — `next lint`.
- Use `npm ci` for reproducible installs from the lockfile.

## Layout & token system

- **`src/components/layout/Section.tsx`** — the layout primitive. Wraps content in `.content-wrap`, gives `min-h-[100svh]` per section on `lg`, optional `centerY`. Compose pages from `<Section>`, don't hand-roll section shells.
- **Colors** (Tailwind + CSS vars): `midnight #080716` (page bg), `deepsea #092B42`, `gold #DBC18D`, `white`. Use the named tokens (`bg-midnight`, `text-gold`, …), not raw hex.
- **Type**: font is **Raleway** via `next/font` (`--font-display` / `--font-body`). Headings are uppercase; fluid `clamp()` sizes live in `globals.css` (`--fs-h1/h2/h3/body`) and `tailwind.config.js` (`text-h1` … `text-body`). A `--font-scale-desktop` var scales the whole desktop type ramp.
- Typography helpers: `src/components/typography/` — `SplitText`, `useSplitLines`, `useSplitScale` for line/char splitting used by GSAP reveals.

## Motion

- **`src/lib/gsap.ts` is the single import point for `gsap` and every plugin.** Import `{ gsap, ScrollTrigger, … }` from `@/lib/gsap` — never from `gsap` / `gsap/ScrollTrigger` directly, and never call `gsap.registerPlugin` in a component. The registry registers every plugin once at module load; importing anything from it runs that side-effect.
- **The motion gate lives in `src/lib/motion.ts`.** Call `readMotionGate()` inside the GSAP setup callback for the one-shot "should this section animate?" decision (`{ prefersReducedMotion, isMobile, shouldAnimate }`) — don't hand-write `window.matchMedia` gates. For reactive viewport splits inside a section use `gsap.matchMedia()` with the **`MEDIA`** constants (`MEDIA.lgUp` / `MEDIA.belowLg` / `MEDIA.reducedMotion`). The mobile breakpoint is unified with Tailwind `lg` (1024px); never reintroduce the raw `1023px` string.
- Reusable animations in `src/lib/gsap/animations.ts` (currently unused), and `src/lib/scrollTriggerRefresh.ts`.
- Two providers in `src/app/layout.tsx` guard motion: **`PageBootProvider`** (boot/FOUC gating) and **`ScrollTriggerStabilityProvider`** (keeps ScrollTrigger measurements stable across reflows). Respect them — new scroll-driven sections should refresh ScrollTrigger via the existing helper, not ad-hoc.

## Component registry

- **Sections** (`src/components/sections/`), rendered in this order by `src/app/page.tsx`:
  `HeroSection → PartnersSection → TodayTomorrowSection → ModellSection → ModellDetailSection → OverviewSection → TestimonialSlider → CaseStudiesSection → TeamVideo → WorksSection → RoadmapSection → OutroSection`.
  (`CaseStudiesSection`, `ModellSection`+`ModellDetailSection`, `TestimonialSlider` are the slider/detail-heavy ones.)
- **UI** (`src/components/ui/`): `CustomCursor`, `PageLoader`.
- **Providers** (`src/components/providers/`): boot + ScrollTrigger stability (above).

## Conventions

- Path alias **`@/`** → `src/`.
- Client components that use GSAP/hooks need `"use client"` (Section already declares it).
- No `console.*` in committed `src/` code (currently clean — keep it that way).
- Assets in `public/`. Images: prefer AVIF/WebP (configured in `next.config.js`).

## Quality gates

1. `npm run build` is green (typecheck + static generation pass).
2. No new untracked log/build artifacts committed (see `.gitignore`).
3. Tokens used via names, not raw values.
