# Studybuddy

A single-user flashcard study app. Installable PWA built for an 8th grader drilling for finals on iPhone. Decks are JSON files bundled at build time — no backend, no auth, no runtime AI.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS v4
- `react-markdown` + KaTeX for Markdown/LaTeX card rendering
- `vite-plugin-pwa` (Workbox) for offline + Add-to-Home-Screen
- Deployed as a static site to GitHub Pages

## Develop

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/studybuddy/ (note the base path). Hot-reloads on deck JSON edits.

To test on a phone on the same Wi-Fi: `npm run dev -- --host` and open the LAN URL in mobile Safari.

Production smoke test (service worker active): `npm run build && npm run preview`.

## Deploy to GitHub Pages

Pushing to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which builds and publishes to Pages. Live at https://ytsaig.github.io/studybuddy/.

First-time setup: in repo Settings → Pages, set Source to **GitHub Actions**.

## Install on iPhone

1. Open https://ytsaig.github.io/studybuddy/ in Safari.
2. Share → **Add to Home Screen**.
3. Launch from the home-screen icon — runs standalone, works offline after first load.

## Add a deck

Drop a JSON file matching the [`Deck` type](src/types.ts) into [src/decks/](src/decks/):

```json
{
  "id": "unit-8-radicals",
  "name": "Unit 8: Radicals",
  "createdAt": "2026-05-15",
  "cards": [
    { "front": "Simplify $\\sqrt{50}$", "back": "$5\\sqrt{2}$" }
  ]
}
```

Decks are auto-discovered via `import.meta.glob` in [src/decks/loader.ts](src/decks/loader.ts) — no registration needed. They sort newest-first by `createdAt`.

### Generate decks from study guides

The [create-deck skill](.claude/skills/create-deck/SKILL.md) converts source material (PDFs, images, or URLs like Blooket sets) into deck JSON. In Claude Code, invoke `/create-deck` and point it at the source.
