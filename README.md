# Multi-page creative portfolio clone

This project is a standalone learning clone inspired by the public structure and visual direction of Eduard Bodak's website. It is not a copy of the original Webflow project or its proprietary assets.

## Pages
- `index.html` — overview / service landing
- `service.html` — service details
- `experience.html` — 4-step process
- `skills.html` — pricing page
- `contact.html` — contact + FAQ

## Run locally

### Using NPM (Recommended)
Run both the frontend website and the backend server concurrently:
```bash
npm start
```
or
```bash
npm run dev
```

- **Frontend website:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

#### Individual services:
- Run only frontend: `npm run frontend`
- Run only backend: `npm run backend`

### Alternative
Open the folder in VS Code and use Live Server, or run `python -m http.server 8000` and visit `http://localhost:8000`.

## Main interactions
Page-load wipe, scroll reveal, custom cursor follower, magnetic links, mobile menu, scroll progress rail, FAQ accordion, copy-email card, price hover motion and back-to-top.
