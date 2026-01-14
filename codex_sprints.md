# CODEX_SPRINTS.md — Trading Card Builder (Agile Plan for Codex)

## Working agreements (must follow)
- Small commits per sprint, keep changes scoped.
- Each sprint ends with:
  1) `npm run dev` works
  2) no console errors
  3) acceptance checklist completed
- Keep dependencies minimal. Add only what the sprint needs.
- TypeScript: no `any`.
- Prefer Server Components by default. Builder is Client Component.
- No API keys or secrets in client code.

---

# Sprint 0 — Project scaffold + UI shell
## Goal
Get a clean Next.js repo running with a branded UI baseline.

## Tasks
1) Create Next.js app (App Router, TS, Tailwind).
2) Create routes:
   - `/` landing page with CTA button to `/builder`
   - `/builder` placeholder layout (2 columns)
3) Add base layout:
   - header + footer
   - content container with max width
4) Add linting + formatting defaults (whatever Next gives + keep consistent)

## Acceptance
- `npm install && npm run dev` works.
- `/builder` shows 2-column layout:
  - left: preview area
  - right: controls area
- Header/footer render on all pages.

---

# Sprint 1 — Templates + design state model
## Goal
Define the data model that powers front and back cards.

## Tasks
1) Create `lib/types.ts`:
   - Template types (front/back)
   - Field types for front + back
2) Create `lib/templates.ts`:
   - 2 templates (light + dark)
   - consistent coordinate system (percent)
   - front + back layout configs
3) Create Builder components scaffold:
   - `components/Builder/BuilderShell.tsx` (client)
   - `TemplatePicker.tsx`
   - `TextFields.tsx`
4) Implement state in `BuilderShell`:
   - selected template
   - front + back text fields with defaults

## Acceptance
- Switching templates updates state correctly.
- Front/back text fields update state correctly.

---

# Sprint 2 — Card preview rendering (front/back) with Konva
## Goal
Get a real live preview working with background + text overlays.

## Tasks
1) Install and wire:
   - `react-konva`, `konva`
2) Implement `CardPreview.tsx` and `CardBackPreview.tsx`:
   - Render template background image
   - Render text overlays based on template config
3) Show front + back side-by-side in the preview column.
4) Ensure responsive sizing:
   - preview container scales but maintains aspect ratio

## Acceptance
- Preview updates instantly when template or text changes.
- Front/back render together and stay in sync.
- No canvas errors.

---

# Sprint 3 — Image upload + placement + background removal
## Goal
Allow user to upload an image, clip it to the photo frame, and optionally remove the background.

## Tasks
1) Add image upload input with object URL.
2) Load image into Konva preview as an Image node.
3) Implement a basic "photo frame" clipping:
   - Use template photoFrame rect
   - Clip the user image to the frame
4) Add background removal toggle:
   - client-side @imgly/background-removal
   - status + retry messaging
5) Manual adjustments (future):
   - drag image to reposition
   - zoom slider (scale)
   - reset button (reset transform)

## Acceptance
- Upload works reliably, and object URL is revoked on change/unmount.
- User image renders inside the frame without squashing.
- Background removal can be toggled on/off.

---

# Sprint 4 — Export (front/back PNG)
## Goal
Export front and back previews as PNGs.

## Tasks
1) Export images from Konva at 2x pixel ratio:
   - export front PNG
   - export back PNG
2) Name files consistently:
   - `snapshot-card-<templateId>.png`
   - `snapshot-card-<templateId>-back.png`

## Acceptance
- Front/back PNGs download without errors.
- Exports match the on-screen previews.

---

# Sprint 5 — Print package (future)
## Goal
Export print-ready assets and bundle into a production zip.

## Tasks
1) Use `lib/printSpec.ts` for sizing.
2) Convert PNGs to PDF using `pdf-lib`.
3) Bundle a zip using `jszip`:
   - `/print/front.pdf`
   - `/print/back.pdf`
   - `/preview/front.png` `/preview/back.png`
   - `/job.json`
4) Add "Download Print Package" button.

## Acceptance
- Downloaded zip contains expected files every time.
- PDFs open and have correct dimensions.

---

# Sprint 6 — Order completion flow + Orders page (future)
## Goal
Complete an order and keep a record for production (only if requested).

## Tasks
1) Create `/api/order`:
   - Accept design state
   - Generate print package on server (or client for MVP if needed)
   - Save order metadata to disk (dev) or stub storage interface
2) Implement `/orders`:
   - List orders (id, createdAt, template, status)
   - Download link to print package
3) Add status states:
   - draft → completed → exported
4) Basic validation:
   - required fields, max lengths, image present

## Acceptance
- Completing order creates a record visible in `/orders`.
- Print package downloadable from `/orders`.
- Flow is reliable, errors are actionable.

---

# Sprint 7 — Hardening + QA (future)
## Goal
Make it stable and production-ready enough for real use.

## Tasks
1) Add Playwright E2E:
   - upload → background remove → edit text → export zip
2) Add guardrails:
   - file size limits
   - mime checks
   - error boundaries in builder
3) Performance:
   - compress preview assets
   - avoid re-render loops
4) UX polish:
   - keyboard focus states
   - toasts for long operations
   - inline helper text for controls

## Acceptance
- E2E passes locally.
- No console noise.
- Handles failure cases gracefully.
