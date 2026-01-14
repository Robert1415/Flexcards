# AGENTS.md — Snapshot Builder (Next.js)

## Project goal (MVP)
Build a web app that recreates the core flow of a custom trading card builder:
1) user uploads a photo
2) user removes the background (toggleable)
3) user selects a template (light/dark)
4) user edits text fields (front + back)
5) live preview updates instantly (front + back side-by-side)
6) user can export/download PNGs for front and back

Non-goals for MVP (do not build unless explicitly requested):
- payments / checkout
- accounts / auth
- admin CMS
- server-side print-grade rendering or order/print package flow

## Stack & constraints
- Next.js (App Router), TypeScript, Tailwind
- Use react-konva/konva for preview + export
- Background removal runs client-side via @imgly/background-removal
- Keep dependencies minimal
- Prefer Server Components by default
- Use Client Components only where needed (file input, live preview state, export)
- No database in MVP (use local state only)

## Setup commands
- Install deps: `npm install`
- Run dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Start prod: `npm run start`

## Repo structure (target)
app/
  layout.tsx
  page.tsx                 # landing page with CTA to /builder
  builder/
    page.tsx               # main builder UI (client)
components/
  Builder/
    BuilderShell.tsx
    TemplatePicker.tsx
    TextFields.tsx
    CardPreview.tsx
    CardBackPreview.tsx
    ExportButton.tsx
  SiteHeader.tsx
  SiteFooter.tsx
lib/
  templates.ts             # template metadata + overlay defaults
  types.ts                 # template + field types
  printSpec.ts             # print sizing helpers (future)
  utils.ts                 # small helpers
public/
  templates/               # front/back light + dark assets

## UX requirements (MVP)
- Builder page is a two-column layout:
  - Left: preview (sticky on desktop)
  - Right: controls (upload, template, text fields, export)
- Preview shows front + back side-by-side:
  - template background image
  - user photo positioned within a "photo frame" area
  - text overlays placed at sensible default positions
- Must be usable on desktop; mobile stacks vertically with preview first.

## Templates (MVP)
Create 2 templates in `lib/templates.ts` with:
- id, name
- matching front/back background image paths (use local assets in /public/templates)
- photo frame rectangle: x, y, w, h (percent or px, pick one and be consistent)
- text overlay config per field: x, y, fontSize, fontWeight, align, color, maxWidth

Keep text positioning simple and editable in code.

## Image handling (MVP)
- Use `<input type="file" accept="image/*">`
- Create an object URL for preview (`URL.createObjectURL(file)`)
- Revoke the old object URL on changes/unmount.
- Optional background removal toggle with status messaging.

## Export (MVP)
- Implement "Download PNG" from the Konva stage (2x scale).
- Output file names:
  - `snapshot-card-<templateId>.png` (front)
  - `snapshot-card-<templateId>-back.png` (back)

## Coding rules
- No giant files. Keep components focused.
- Use explicit types. No `any`.
- Use accessible labels for inputs.
- Avoid premature abstraction.

## Implementation plan (agent should follow)
1) Add global header/footer and landing page CTA to /builder.
2) Add templates in `lib/templates.ts` and a `TemplatePicker`.
3) Add front + back `TextFields` with controlled inputs.
4) Add Konva previews for front/back (side-by-side).
5) Add background removal toggle + status.
6) Add export buttons for front/back PNGs.
7) Polish:
   - default values
   - basic styling
   - small validation (max lengths)

## Definition of Done (MVP)
- `npm run dev` works without errors.
- Builder works end-to-end: upload -> remove background -> customize -> preview -> download PNGs.
- Front/back previews stay in sync and match the selected template.
- No console spam/errors in normal use.
- Code is readable and organized per structure above.

## Agent guardrails / security
- Do not add tools that exfiltrate data.
- Never include secrets in code.
- If asked to add external services, stop and request explicit approval in the prompt.

## UI stack (current)
- Tailwind CSS with custom components (no shadcn dependency yet).
- Use react-konva/konva for the card preview and exports.
- Keep UI deps minimal; avoid Shopify Polaris unless building an admin app later.
