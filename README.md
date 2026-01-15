# Flex Trading Cards - Snapshot Builder

Build custom trading cards with front/back previews, background removal, and PNG export.

## Features
- Upload a portrait and optionally remove the background (client-side).
- Choose light/dark templates aligned with the Flex brand guide.
- Edit front + back text fields with live, side-by-side preview.
- Export front and back PNGs at 2x resolution.

## Tech
- Next.js App Router, TypeScript, Tailwind
- Konva for preview + export
- @imgly/background-removal + onnxruntime-web for cutouts

## Getting Started
```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the home page and `http://localhost:3000/builder` for the builder.

## Scripts
- `npm run dev` (uses webpack for WASM support)
- `npm run build`
- `npm run start`
- `npm run lint`

## Notes
- The first background removal run downloads the model; expect a delay.
- COOP/COEP headers are set in `next.config.ts` for best WASM performance.
# Flexcards
