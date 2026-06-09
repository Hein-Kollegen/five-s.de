# CONTEXT.md

What this project is and where it sits. Domain + state, not build instructions (those live in [`AGENTS.md`](AGENTS.md)).

## Origin

- **Fork** of [`Nor1ck/five-s.de`](https://github.com/Nor1ck/five-s.de).
- Our repo: [`Hein-Kollegen/five-s.de`](https://github.com/Hein-Kollegen/five-s.de).
- Git remotes: `origin` → our fork, `upstream` → Nor1ck original. Work happens on the **`relaunch`** branch; `main` mirrors the fork's main.
- `package.json` name is still `hk-pitch-template` (legacy from the template origin).

## What it is

A single-page **pitch / landing template** ("5-S — Wachstum mit System") built as a vertically scrolling sequence of GSAP-animated sections. One route (`/`) composes ~12 sections (see [`AGENTS.md`](AGENTS.md) for the registry). Heavy on scroll-triggered motion, a custom cursor, a page loader, and a ProvenExpert widget.

- **Section** — one full-height composed unit of the page (Hero, Modell, …); the unit of motion authorship.
- **Motion gate** — the single rule every section consults before animating: skip motion under reduced-motion or below the desktop breakpoint. Lives in `src/lib/motion.ts`; the breakpoint is unified with Tailwind `lg` (1024px). See [`AGENTS.md`](AGENTS.md#motion).

## Language

**Five-S property**:
The dedicated `five-s.de` experience for the 5-S Wachstumssystem, owned as part of the HK website ecosystem while implemented in this separate Next.js repository.
_Avoid_: detached microsite, visual-only alignment

**5-S model**:
The primary strategic consulting model from Hein & Kollegen, presented through the Five-S property for external prospects and internal sales conversations.
_Avoid_: generic method, side offer

**Customer information use**:
The public-facing use case where prospects visit the Five-S property to understand the 5-S model, consulting value, proof, and next steps.
_Avoid_: brochure-only content

**Sales presentation use**:
The internal use case where HK sales staff use the Five-S property in video calls to present consulting services.
_Avoid_: separate slide deck requirement

**Pitch presentation**:
The old page model that treated the site like a scroll-driven sales presentation with high-friction motion patterns.
_Avoid_: final user experience

**HK standards**:
The shared product, design, accessibility, performance, SEO, and motion quality bar established by `hk-website`, adapted to this repo's architecture and the 5-S use case.
_Avoid_: copying Astro implementation conventions into this Next.js repo

**User barrier**:
Any interaction pattern, motion mechanic, section structure, or content flow that makes the Five-S property harder to understand, navigate, or convert on.
_Avoid_: treating scroll pins as default spectacle

## Relationships

- The **Five-S property** presents the **5-S model** as a primary offer of HK's strategic consulting.
- The **Five-S property** serves both **Customer information use** and **Sales presentation use**.
- **Customer information use** requires intuitive navigation and comprehension without prior instruction.
- **Sales presentation use** requires presenter-friendly flow without blocking broader public usability.
- Existing **Pitch presentation** mechanics become **User barriers** when they require prior knowledge or behave unlike users expect.

## Relationship to hein-kollegen.de

- `five-s.de` is a **Five-S property**, kept externally linked from the main HK site (`hk-website`, a separate Astro repo at [`Hein-Kollegen/h-k-website`](https://github.com/Hein-Kollegen/h-k-website); local sibling path usually `../hk-website`) while still belonging to the same HK website ecosystem.
- It follows **HK standards** for design quality, accessibility, performance, SEO, and motion intent, but as its own repo with its own agent context. Do not assume hk-website's conventions (Astro, port 4321, its layout system) apply here; this is Next.js.
- The relaunch is not only a visual alignment. Existing sections may be rethought, removed, or rebuilt; new sections may be added; old pitch-first motion should give way to user-friendly page flow.
- Scroll pins and other high-friction **Pitch presentation** mechanics must be justified by user value, not preserved by default.

## Current state (2026-06-09)

- Stabilised: dependencies pinned (were all `latest`), `npm ci` + `npm run build` reproducible, stray `devserver.*.log` / `tsconfig.tsbuildinfo` removed from tracking and gitignored.
- Not yet started: relaunch concept for the **Five-S property**: section strategy, HK-aligned visual system, HK-style motion adaptation, user-barrier removal, and performance pass.

## Deployment intent

Later via **Dokploy**, analogous to hk-website. A staging/relaunch deploy comes at a later point — for now: local dev server + the `relaunch` branch only. `nixpacks.toml` is present for the eventual build.
