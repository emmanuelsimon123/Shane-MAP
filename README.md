# Shane-MAP: Interactive Europe Map (476 AD)

This project turns the historical map **"Europe at the fall of the Western Roman Empire in 476 AD"** into an interactive classroom site.

Students can:
- click/tap kingdoms and realms on the map
- read short, age-appropriate historical summaries
- use a legend list to jump to regions
- zoom and pan the high-resolution map
- enable a quiz-style **Hide labels** mode

## Project structure

- `index.html` — page layout
- `styles.css` — responsive styles
- `script.js` — interactivity (hotspots, info panel, zoom/pan)
- `data/regions.json` — editable region content and hotspot polygons
- `assets/europe-fall-rome-476.jpg` — map image asset

## Run locally

Because this site fetches JSON data, serve it with a local static server (do not open `index.html` directly as a file URL):

```bash
cd /home/runner/work/Shane-MAP/Shane-MAP
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Deploy with GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (root)
4. Save, then wait for GitHub Pages to publish.
5. Open the published URL shown in the Pages settings.

## Editing content as a teacher

Open `data/regions.json` and edit any region fields:
- `name`
- `origin`
- `keyRulers`
- `capital`
- `summary`
- `eventualFate`
- `points` (polygon coordinates)

## Attribution and license

Map source: **Droysen/Andrée, rev. G. Kossina**

- Commons file page: https://commons.wikimedia.org/wiki/File:Europe_at_the_fall_of_the_Western_Roman_Empire_in_476.jpg
- License: CC BY-SA 3.0 — https://creativecommons.org/licenses/by-sa/3.0/deed.en
- Also dual-licensed under GFDL 1.2+
