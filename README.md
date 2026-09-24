# Photo Gallery

A personal, editable memory site — **React + Vite**. Warm, minimal, premium, purple.
No backend, no database, no accounts. Everything you add is saved **in your own browser**.

---

## Run it

```bash
npm install     # once
npm run dev     # start the local dev server (prints a http://localhost link)
npm run build   # production build → dist/
npm run preview # preview the production build locally
```

Open the printed local URL (usually http://localhost:5173/).

---

## Make it yours — the Edit button  ← start here

Tap the **Edit** button (bottom-right of the page). While editing you can:

- **Add sections** — “＋ Trip” or “＋ Occasion” at the bottom of the gallery.
- **Name a section** and give it a short note (tap the title / note to type).
- **Add photos** — “＋ Add photos” inside a section; pick many phone photos at once.
- **Name any photo** — the box under each photo.
- On each photo: **⟳ replace** (swap the image), **× delete**, and **‹ ›** reorder.
- **Reorder / remove** sections (↑ ↓ and Delete); switch **Trip / Occasion**.
- **Set the hero photo** — “Change hero photo”, and edit the big title + tagline.
- **Edit the closing** message and photo at the very bottom.

Tap the **✓** button when finished. Everything is saved automatically on this device.

- Your photos are **automatically resized** on the way in, so large phone photos
  fit and load fast. Nothing is ever uploaded to a server.

> Because content is saved in the browser, it lives on the device/browser you edit
> in. Use **Export** if you want a backup.

---

## Music — an editable playlist, right on the home photo

- The player sits **over the home photo**. Music **never autoplays**.
- In **Edit** mode: tap the round **album art** to set your own cover image; open the list
  (☰ icon) and use **＋ Add songs** to upload your own audio files; rename each song and
  remove any you don't want. Uploaded songs are stored in your browser (IndexedDB) and
  persist across reloads.
- The 20 starting tracks are gentle **placeholder tones** (`public/music/track-01.wav …`).
- Turn music off: set `features.music.enabled = false` in `src/data/site.js`.

---

## The trip timeline

Built **automatically** from your “Trip” sections (name + first photo). Add or edit
trips and it updates itself. Turn it off with `features.timeline = false` in `src/data/site.js`.

---

## Project structure

```
public/
  images/   starting placeholder photos (you can ignore these once you add your own)
  music/    the playlist audio files
src/
  data/
    defaults.js   the starting content (used on first load / Reset)
    playlist.js   the songs
    site.js       small labels + feature toggles (music, timeline, edit)
  hooks/
    useContent.js   the editable content saved in your browser (localStorage)
    useReveal.js    scroll-in animation
  lib/
    resizeImage.js  shrinks big photos before saving
    gradient.js     placeholder gradient helper
  components/
    Hero, Section, Gallery, PhotoCard, Lightbox, Timeline, Footer
    edit/   EditContext, EditToggle, EditableText, GroupEditBar, AddGroup
    music/  MusicProvider, FeaturedPlayer, FloatingPlayer, PlayIcon
  App.jsx
  main.jsx
  index.css   design system (colors, type, spacing) — edit the purple here
```

---

## Premium touches (toggle in `src/data/site.js` → `features`)

- **`intro`** — an elegant "Open" welcome screen that gently gives way to the site
  (shows once per visit). Set to `false` to skip it.
- **`scrollProgress`** — a thin purple bar along the top showing how far you've scrolled.
- **Lightbox slideshow** — open any photo and press **Slideshow** to auto-advance
  through all your photos (press **Pause** to stop). Captions show under each photo.

## Editing the live site (owner password + auto server-sync)

Edits made on the **deployed** site can save to a small backend (Netlify Functions +
Netlify Blobs) so the live site updates for **every device/visitor** automatically.

**One-time setup on Netlify:**
1. In the Netlify dashboard → Site settings → Environment variables, add
   **`EDIT_PASSWORD`** = a password of your choice.
2. Redeploy (or it applies on the next deploy).

**How it works:**
- Unlock editing by tapping the **song track 4 times**, then enter your password.
- Your edits (text, emojis, photos) **auto-save to the server** (debounced) and load on
  any device. Visitors without the password can only view.
- **Songs stay local** to each device (not uploaded — avoids large/copyright audio on a
  public server). Add songs per device in Edit mode.
- Photos you upload while signed in are stored on the server (`srv:` refs); offline/local
  edits fall back to your browser (IndexedDB) and the "Edit on this device only" option.

**Local development:** run `npx netlify dev` (serves Vite + Functions + Blobs on
`http://localhost:8888`). Plain `npm run dev` still works but without server sync (falls
back to local-only editing).

## Fonts

Self-hosted (offline) via `@fontsource`: **Fraunces Variable** (display serif) +
**Inter Variable** (body), imported in `src/main.jsx`. To change them, swap those two
imports and update `--font-display` / `--font-body` in `src/index.css`.

## Photos: zoom & fit

In Edit mode, under each photo there's a **Fill/Fit** toggle and a **zoom slider** —
nudge a photo's zoom or switch between filling the tile (cropped) and fitting the whole
image in. The timeline trip names/notes are editable too (they mirror the trip sections).

## Change the colors

Open **`src/index.css`** and edit the tokens under `:root`. The three purple lines
drive the whole theme:

```css
--accent: #7c53b8;        /* main purple */
--accent-strong: #5f3b98; /* deeper (hover / gradients) */
--accent-soft: #b79bd6;   /* light (highlights) */
```
