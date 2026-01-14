# CODEX_UI_STACK.md — UI/UX + Repo/Lib Choices (Current + Future)

## Goal
Deliver a clean builder UX aligned with Flex brand:
- Left column: preview (sticky on desktop)
- Right column: controls
- Front/back previews shown side-by-side

## Current stack (implemented)
- Tailwind CSS with custom components (no shadcn dependency yet)
- react-konva + konva for preview and exports
- @imgly/background-removal + onnxruntime-web for client-side cutout
- next/font for Bebas Neue (headings) + Barlow (body)

## Brand guide (Flex Trading Cards)
- Primary: Dark Green #1D4E3F, Black #000000, White #FFFFFF
- Accent: Red #E63946
- Secondary: Light Gray #F7F7F7, Off White #FAF9F6
- Typography: Bebas Neue (headings), Barlow (body)
- Style: high contrast portraits, clean borders, minimal backgrounds

## Optional additions (future)
- shadcn/ui if we need a UI component system
- lucide-react for icons
- pdf-lib + jszip for print package exports
- server-side rembg service if client-side bg removal is insufficient

## Libraries in use (minimal set)
- react-konva + konva
- @imgly/background-removal + onnxruntime-web

## Commands (only when needed)
Install core builder libs:
```
npm i react-konva konva @imgly/background-removal onnxruntime-web
```

Optional print package tooling:
```
npm i pdf-lib jszip
```

## Folder structure (target)
app/
  page.tsx
  builder/
    page.tsx
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
  templates.ts
  printSpec.ts
  types.ts
  utils.ts

## How to adapt the UI shell
- Builder page uses a responsive 2-col layout:
  - Desktop: preview left (sticky), controls right
  - Mobile: stacked (preview above controls)
- Use simple Tailwind cards for each control section:
  - Upload
  - Template
  - Text fields
  - Export

## Preview UX requirements
- Show front + back side-by-side by default.
- Keep aspect ratio and center the previews.
- Manual adjustments (zoom/drag) are future additions.
- Keep text editing simple (inputs/textarea), with max lengths.

## Guardrails
- Do NOT add lots of theme dependencies. Keep it lean.
- Do NOT add Polaris unless the project becomes a Shopify Admin app.
- Do NOT expose any API keys to the client.
- Prefer accessible labels and keyboard navigation.

## Acceptance checks (UI)
- /builder loads instantly and matches the Flex brand styling
- Upload -> preview updates
- Text edits update preview
- Front/back previews render together
- Export buttons work (even before bg removal)
