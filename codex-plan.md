CODEX_PLAN.md — Trading Card Builder (Web → ONYX → Canon UV)
0) Product goal

Build a web app that lets customers create a custom trading card with:

Upload photo → background removal (toggleable)

Front + back card design preview (side-by-side)

Light/dark templates that match the Flex brand guide

Export front/back PNGs (print package is a later phase)

1) Constraints and non-goals

MVP must include

Background removal

Front/back preview

Front/back PNG export

Out of scope unless explicitly requested

Full customer accounts

Full ecommerce (Shopify checkout etc.) if not needed immediately

Full admin CMS

Print package export (PDF/ZIP) and order completion flow

Advanced print features (white ink layers, spot channels, dielines) unless required by printer setup

2) Key technical decisions (make these early)
2.1 Rendering approach (important for export quality)

Choose one:

Option A (fastest to ship): DOM → PNG

Use html-to-image (OSS) to export preview DOM at 2x scale.

Pros: simple, minimal infra

Cons: font loading, edge cases, print-grade consistency

Option B (recommended for print reliability): Canvas compositor

Use Konva (or similar) so the same scene graph powers preview + export, and export via pixelRatio for high DPI.

Pros: consistent exports, fewer DOM quirks

Cons: slightly more dev effort

Decision: default to Option B (Canvas compositor) for print workflows.

2.2 Output format for ONYX

ONYX accepts common raster + PDF formats like PDF, PNG, TIFF etc.
ONYX docs recommend using modern PDFs (PDF 1.7 if possible).
ONYX Thrive is built on Adobe PDF Print Engine.

Decision:

Export print package as (future):

front.pdf + back.pdf (preferred)

fallback: front.tif + back.tif (if production requests raster-only)

3) Architecture overview
3.1 Frontend (Next.js)

Next.js App Router + TS + Tailwind

Builder UI:

Upload

Background removal toggle/status

Template picker

Text fields (front/back fields)

Smart frame adjust (optional manual override)

Layout: preview left (sticky), controls right

Preview: Front + back side-by-side

Export buttons (front/back)

3.2 Backend services (Next.js API routes) [future]

/api/bg-remove (optional server-side alternative to client removal)

Takes uploaded image (or URL), returns PNG with transparency + mask/bbox metadata.

/api/order

Accepts design JSON + assets, generates print files, returns order id + download link.

Storage: local dev disk; production: S3/R2 (later)

3.3 “AI keys” policy

If using third-party AI APIs, keys live server-side only in env vars.

Never expose keys to client JS.

Provide a switch to use self-hosted background removal first.

4) OSS / existing tools to use
Background removal (choose primary + fallback)

Primary (MVP): @imgly/background-removal (client-side)

- Runs in the browser (no API route required).
- First run downloads the model; show progress/status.
- Requires COOP/COEP headers for best performance.

Future (server-side): rembg

- Can run as CLI, python lib, or HTTP server/container.
- Use it behind /api/bg-remove when needed for quality or scale.

Fallback (optional external API)

- Add pluggable provider interface (Remove.bg/ClipDrop/etc.) only if needed.
- Store provider keys in env, gated behind feature flag.

Smart sizing / "subject in viewport" (future)

Use a 2-step heuristic:

Compute foreground bounding box from mask returned by bg removal

Fit bbox into the template “photo frame” with padding + safe headroom
Optional enhancement:

Use smartcrop.js as a fallback when mask is weak.

Exporting preview

If canvas compositor: Konva export with pixelRatio 2–4 for print.

If DOM export fallback: html-to-image.

5) Print workflow requirements (ONYX → Canon UV) [future]
5.1 What ONYX needs from us

“Print-ready file” formats supported include PDF/PNG/TIF (among others).

Prefer modern PDF output where possible.

5.2 Define a print spec (must be explicit)

Codex must implement a single source of truth in lib/printSpec.ts:

Card size (inches/mm) e.g. 2.5" x 3.5" (final) + bleed (e.g. 0.125")

DPI target (e.g. 300 DPI)

Output pixel dimensions computed from size + DPI

Safe area margins

Front and back file naming convention:

order-<id>-front.pdf

order-<id>-back.pdf

5.3 Print package structure

When order is completed, generate a zip:

/print/

front.pdf

back.pdf

job.json (template id, text, placement, timestamps)

source/ (original upload, bg-removed PNG)

preview/ (low-res PNG previews)

6) Template system (front/back)
6.1 Data model

lib/templates.ts should define:

templateId, name (light/dark themes)

front: background asset, photo frame rect, text fields layout

back: matching background asset, text fields layout (and optional photo frame if needed)

All positions in percent to avoid responsive drift, then resolved to pixels at export time.

6.2 Fields

Front:

name, team, position, number, statsLine1, statsLine2, description

Back:

bio, seasonSummary, footerNote, optional QR code placeholder (future)

7) Step-by-step delivery plan (Agile sprints)

See `codex_sprints.md` for the detailed breakdown. Current sequencing:

- Sprint 0: scaffold + header/footer + home page (done)
- Sprint 1: templates + front/back field state (done)
- Sprint 2: Konva front/back previews (done)
- Sprint 3: upload + background removal toggle (done; manual controls pending)
- Sprint 4: PNG export (done)
- Sprint 5+: print package + orders (future)

8) Testing strategy (prevent bug loops)
Unit tests

Template position resolver

Fit algorithm (mask bbox → transform)

Filename + package builder

E2E tests (Playwright)

Upload image

Remove background

Verify preview renders both sides

Export package exists and contains expected files

Golden file tests (optional but strong)

Use 3–5 fixed sample images

Generate export

Compare output dimensions + checksum tolerance (or metadata)

9) Security + operational guardrails

No API keys in the client

Rate limit bg removal route

File upload limits (size + mime)

Strip EXIF on output if needed

Store only what’s required for production

10) Open questions (Codex should implement as config)

Final card size + bleed + DPI (must be defined in printSpec.ts)

Exact Canon UV workflow expectations:

Does production want PDF or TIFF?

Are white/spot channels required?

Any cut paths / registration marks required?

Which ONYX product/version is in use (Thrive/RIPCenter/etc.)

(If unknown, implement PDF + TIFF export options and make it a toggle.)

Implementation note for Codex (do this first)

Before writing features, Codex must create:

lib/printSpec.ts (single source of truth)

lib/templates.ts (front/back layouts)

lib/types.ts (DesignState, Template, ExportJob)

A working /builder preview harness

This prevents rework later.
