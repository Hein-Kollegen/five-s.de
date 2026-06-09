# CONTEXT.md

What this project is and where it sits. Domain + state, not build instructions (those live in [`AGENTS.md`](AGENTS.md)).

## Origin

- **Fork** of [`Nor1ck/five-s.de`](https://github.com/Nor1ck/five-s.de).
- Our repo: [`Hein-Kollegen/five-s.de`](https://github.com/Hein-Kollegen/five-s.de).
- Git remotes: `origin` → our fork, `upstream` → Nor1ck original. Work happens on the **`relaunch`** branch; `main` mirrors the fork's main.
- `package.json` name is still `hk-pitch-template` (legacy from the template origin).

## What it is

A single-page **pitch / landing template** ("5-S — Wachstum mit System") built as a vertically scrolling sequence of GSAP-animated sections. One route (`/`) composes ~12 sections (see [`AGENTS.md`](AGENTS.md) for the registry). Heavy on scroll-triggered motion, a custom cursor, a page loader, and a ProvenExpert widget.

## Relationship to hein-kollegen.de

- `five-s.de` is a **separate property**, kept **externally linked** from the main HK site (`hk-website`, a separate Astro repo at `../hk-website`). That separation is intentional.
- It will be **reworked and visually aligned to the HK design** — but as its own repo with its own agent context. Do not assume hk-website's conventions (Astro, port 4321, its layout system) apply here; this is Next.js.

## Current state (2026-06-09)

- Stabilised: dependencies pinned (were all `latest`), `npm ci` + `npm run build` reproducible, stray `devserver.*.log` / `tsconfig.tsbuildinfo` removed from tracking and gitignored.
- Not yet started: visual alignment to HK design.

## Deployment intent

Later via **Dokploy**, analogous to hk-website. A staging/relaunch deploy comes at a later point — for now: local dev server + the `relaunch` branch only. `nixpacks.toml` is present for the eventual build.
