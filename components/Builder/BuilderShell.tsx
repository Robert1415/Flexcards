"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BackFields,
  BackFieldKey,
  FrontFields,
  FrontFieldKey,
  TextOverlay,
} from "@/lib/types";
import { templates } from "@/lib/templates";
import { buildSnapshotFileName } from "@/lib/utils";
import TemplatePicker from "@/components/Builder/TemplatePicker";
import TextFields, { type FieldConfig } from "@/components/Builder/TextFields";
import CardPreview from "@/components/Builder/CardPreview";
import CardBackPreview from "@/components/Builder/CardBackPreview";
import ExportButton from "@/components/Builder/ExportButton";
import type Konva from "konva";

const defaultFrontFields: FrontFields = {
  name: "Avery Anderson",
  team: "Henderson Wildcats",
  position: "SS",
  number: "02",
  statsLine1: "AVG .328 | HR 9 | RBI 31",
  statsLine2: "Speed 88 | Fielding 92",
  description: "Steady shortstop with quick hands and a big bat.",
};

const defaultBackFields: BackFields = {
  bio: "Shortstop with a quick first step, known for clean fielding and smart reads.",
  seasonSummary: "2024 Highlights: 28 games, 9 HR, 31 RBI, Gold Glove nominee.",
  footerNote: "Flex Trading Cards · 2025 Season",
};

const frontFieldConfig: Array<FieldConfig<FrontFieldKey>> = [
  { key: "name", label: "Name", placeholder: "Player name", maxLength: 24 },
  { key: "team", label: "Team", placeholder: "Team name", maxLength: 24 },
  {
    key: "position",
    label: "Position",
    placeholder: "Position",
    maxLength: 18,
  },
  { key: "number", label: "Number", placeholder: "00", maxLength: 4 },
  {
    key: "statsLine1",
    label: "Stats line 1",
    placeholder: "2024: 18 G | 11 A",
    maxLength: 28,
  },
  {
    key: "statsLine2",
    label: "Stats line 2",
    placeholder: "Speed 92 | Control 88",
    maxLength: 28,
  },
  {
    key: "description",
    label: "Description",
    placeholder: "Short highlight sentence",
    maxLength: 90,
    multiline: true,
  },
];

const backFieldConfig: Array<FieldConfig<BackFieldKey>> = [
  {
    key: "bio",
    label: "Bio",
    placeholder: "Short player bio",
    maxLength: 180,
    multiline: true,
  },
  {
    key: "seasonSummary",
    label: "Season summary",
    placeholder: "2024 Highlights: 28 games, 9 HR, 31 RBI",
    maxLength: 140,
    multiline: true,
  },
  {
    key: "footerNote",
    label: "Footer note",
    placeholder: "Flex Trading Cards · 2025 Season",
    maxLength: 60,
  },
];

type TextPositionOverrides<Key extends string> = Partial<
  Record<Key, Pick<TextOverlay, "x" | "y">>
>;

type SubjectStyle = "classic" | "stylized" | "neon" | "fire";

type BackSource =
  | { type: "file"; value: File }
  | { type: "cutout"; value: string };

const BACK_AI_SIZE = "512x512";

const parseImageSize = (value: string) => {
  const parsed = Number.parseInt(value.split("x")[0] ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1024;
};

export default function BuilderShell() {
  const [selectedId, setSelectedId] = useState(templates[0].id);
  const [frontFields, setFrontFields] = useState<FrontFields>(
    defaultFrontFields
  );
  const [backFields, setBackFields] = useState<BackFields>(defaultBackFields);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [subjectStyle, setSubjectStyle] = useState<SubjectStyle>("classic");
  const [autoFitPhoto, setAutoFitPhoto] = useState(true);
  const [photoOffsetByTemplate, setPhotoOffsetByTemplate] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [layoutMode, setLayoutMode] = useState<"off" | "text" | "photo">("off");
  const [frontOverridesByTemplate, setFrontOverridesByTemplate] = useState<
    Record<string, TextPositionOverrides<FrontFieldKey>>
  >({});
  const [backOverridesByTemplate, setBackOverridesByTemplate] = useState<
    Record<string, TextPositionOverrides<BackFieldKey>>
  >({});
  const [backAiUrl, setBackAiUrl] = useState<string | null>(null);
  const [isGeneratingBack, setIsGeneratingBack] = useState(false);
  const [backAiStatus, setBackAiStatus] = useState<string | null>(null);
  const [backAiError, setBackAiError] = useState<string | null>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [removeBackgroundError, setRemoveBackgroundError] =
    useState<string | null>(null);
  const [removeBackgroundStatus, setRemoveBackgroundStatus] = useState<
    string | null
  >(null);
  const removeRequestRef = useRef(0);
  const backRequestRef = useRef(0);
  const backSourceKeyRef = useRef<string | null>(null);
  const backAbortRef = useRef<AbortController | null>(null);

  const frontPreviewRef = useRef<Konva.Stage | null>(null);
  const backPreviewRef = useRef<Konva.Stage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [selectedId]
  );
  const frontTextOverrides = frontOverridesByTemplate[selectedId] ?? {};
  const backTextOverrides = backOverridesByTemplate[selectedId] ?? {};
  const photoOffset = photoOffsetByTemplate[selectedId] ?? { x: 0, y: 0 };
  const isTextEditing = layoutMode === "text";
  const isPhotoEditing = layoutMode === "photo";

  useEffect(() => {
    if (autoFitPhoto) {
      setPhotoOffsetByTemplate((prev) => ({
        ...prev,
        [selectedId]: { x: 0, y: 0 },
      }));
    }
  }, [autoFitPhoto, selectedId]);

  useEffect(() => {
    if (layoutMode === "photo") {
      setAutoFitPhoto(false);
    }
  }, [layoutMode]);

  useEffect(() => {
    return () => {
      if (backAbortRef.current) {
        backAbortRef.current.abort();
        backAbortRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  useEffect(() => {
    return () => {
      if (cutoutUrl) {
        URL.revokeObjectURL(cutoutUrl);
      }
    };
  }, [cutoutUrl]);

  const runBackgroundRemoval = async (file: File) => {
    setIsRemovingBackground(true);
    setRemoveBackgroundError(null);
    setRemoveBackgroundStatus("Removing background...");
    const requestId = ++removeRequestRef.current;

    try {
      const bgModule = await import("@imgly/background-removal");
      const fallbackRemove =
        typeof bgModule.default === "function"
          ? bgModule.default
          : (bgModule.default as { removeBackground?: unknown })?.removeBackground;
      const removeBackgroundFn = bgModule.removeBackground ?? fallbackRemove;

      if (typeof removeBackgroundFn !== "function") {
        throw new Error("Background removal module failed to load.");
      }

      const result = await removeBackgroundFn(file, {
        model: "isnet_quint8",
        device: "cpu",
        output: { type: "foreground", format: "image/png" },
        progress: (key: string, current: number, total: number) => {
          if (requestId !== removeRequestRef.current) return;
          if (key.startsWith("compute:")) {
            setRemoveBackgroundStatus("Removing background...");
            return;
          }
          const friendlyKey = key.replace("/models/", "").replace(".onnx", "");
          if (!total) {
            setRemoveBackgroundStatus(`Downloading ${friendlyKey}...`);
            return;
          }
          const percent = Math.round((current / total) * 100);
          setRemoveBackgroundStatus(`Downloading ${friendlyKey} ${percent}%`);
        },
      });

      if (requestId !== removeRequestRef.current) return;
      const nextUrl = URL.createObjectURL(result);
      setCutoutUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextUrl;
      });
      setRemoveBackgroundStatus("Ready");
    } catch (error) {
      if (requestId !== removeRequestRef.current) return;
      const message =
        error instanceof Error ? error.message : "Background removal failed.";
      setRemoveBackgroundError(message);
      setRemoveBackgroundStatus("Failed");
      console.error(error);
    } finally {
      if (requestId === removeRequestRef.current) {
        setIsRemovingBackground(false);
      }
    }
  };

  const createScaledDataUrl = useCallback(
    async (source: File | Blob | string, maxSize: number) => {
      const blob =
        typeof source === "string"
          ? await fetch(source).then((response) => response.blob())
          : source;
      const bitmap = await createImageBitmap(blob);
      const scale = Math.min(
        1,
        maxSize / Math.max(bitmap.width, bitmap.height)
      );
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas is not available for image processing.");
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const offsetX = Math.round((maxSize - width) / 2);
      const offsetY = Math.round((maxSize - height) / 2);
      ctx.drawImage(bitmap, offsetX, offsetY, width, height);
      if ("close" in bitmap) {
        bitmap.close();
      }
      return canvas.toDataURL("image/png");
    },
    []
  );

  const createMaskDataUrl = useCallback((size: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    return canvas.toDataURL("image/png");
  }, []);

  const generateBackArt = useCallback(async (source: BackSource) => {
    const requestId = ++backRequestRef.current;
    if (backAbortRef.current) {
      backAbortRef.current.abort();
    }
    const controller = new AbortController();
    backAbortRef.current = controller;
    setIsGeneratingBack(true);
    setBackAiError(null);
    setBackAiStatus("Generating back art...");

    try {
      const targetSize = parseImageSize(BACK_AI_SIZE);
      const imageDataUrl = await createScaledDataUrl(source.value, targetSize);
      const maskDataUrl = createMaskDataUrl(targetSize);
      const response = await fetch("/api/generate-back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          maskDataUrl,
          style: subjectStyle,
          size: BACK_AI_SIZE,
        }),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to generate back art.");
      }
      if (requestId !== backRequestRef.current) return;
      setBackAiUrl(payload?.imageDataUrl ?? null);
      setBackAiStatus("Ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (requestId !== backRequestRef.current) return;
      const message =
        error instanceof Error ? error.message : "Back art generation failed.";
      setBackAiError(message);
      setBackAiStatus("Failed");
      console.error(error);
    } finally {
      if (requestId === backRequestRef.current) {
        setIsGeneratingBack(false);
      }
      if (backAbortRef.current === controller) {
        backAbortRef.current = null;
      }
    }
  }, [createScaledDataUrl, createMaskDataUrl, subjectStyle]);

  const getBackSource = useCallback((): BackSource | null => {
    if (!photoFile) return null;
    if (removeBackground && cutoutUrl) {
      return { type: "cutout", value: cutoutUrl };
    }
    if (!removeBackground) {
      return { type: "file", value: photoFile };
    }
    return null;
  }, [photoFile, removeBackground, cutoutUrl]);

  const requestBackGeneration = useCallback((force = false) => {
    if (!photoFile) return;
    const source = getBackSource();
    if (!source) {
      setBackAiStatus("Waiting for background removal...");
      return;
    }
    const key =
      source.type === "cutout"
        ? source.value
        : `${photoFile.name}-${photoFile.size}-${photoFile.lastModified}`;
    const compositeKey = `${key}:${subjectStyle}`;
    if (!force && compositeKey === backSourceKeyRef.current) return;
    backSourceKeyRef.current = compositeKey;
    void generateBackArt(source);
  }, [photoFile, getBackSource, subjectStyle, generateBackArt]);

  const resetBackArt = useCallback((nextStatus: string | null) => {
    backRequestRef.current += 1;
    backSourceKeyRef.current = null;
    if (backAbortRef.current) {
      backAbortRef.current.abort();
      backAbortRef.current = null;
    }
    setBackAiUrl(null);
    setBackAiError(null);
    setBackAiStatus(nextStatus);
    setIsGeneratingBack(false);
  }, []);

  const handlePhotoChange = (file?: File) => {
    if (!file) return;
    removeRequestRef.current += 1;
    resetBackArt(removeBackground ? "Waiting for background removal..." : null);
    setPhotoFile(file);
    setRemoveBackgroundError(null);
    setRemoveBackgroundStatus(removeBackground ? "Removing background..." : null);
    setCutoutUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    const nextUrl = URL.createObjectURL(file);
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextUrl;
    });
    setPhotoOffsetByTemplate({ [selectedId]: { x: 0, y: 0 } });

    if (removeBackground) {
      void runBackgroundRemoval(file);
    }
  };

  const handleToggleRemoveBackground = (nextValue: boolean) => {
    setRemoveBackground(nextValue);
    setRemoveBackgroundStatus(nextValue ? "Removing background..." : null);
    if (nextValue && photoFile && !cutoutUrl && !isRemovingBackground) {
      void runBackgroundRemoval(photoFile);
      resetBackArt("Waiting for background removal...");
      return;
    }
    resetBackArt(nextValue ? "Waiting for background removal..." : null);
  };

  const handleToggleAutoFit = (nextValue: boolean) => {
    setAutoFitPhoto(nextValue);
    if (nextValue) {
      setPhotoOffsetByTemplate((prev) => ({
        ...prev,
        [selectedId]: { x: 0, y: 0 },
      }));
      if (layoutMode === "photo") {
        setLayoutMode("off");
      }
    }
  };

  const handleLayoutModeChange = (mode: "off" | "text" | "photo") => {
    setLayoutMode(mode);
    if (mode === "photo") {
      setAutoFitPhoto(false);
    }
  };

  const handleClearPhoto = () => {
    removeRequestRef.current += 1;
    resetBackArt(null);
    setPhotoFile(null);
    setRemoveBackgroundError(null);
    setIsRemovingBackground(false);
    setRemoveBackgroundStatus(null);
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCutoutUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhotoOffsetByTemplate({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFrontFieldChange = (key: FrontFieldKey, value: string) => {
    setFrontFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleBackFieldChange = (key: BackFieldKey, value: string) => {
    setBackFields((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoOffsetChange = (next: { x: number; y: number }) => {
    setPhotoOffsetByTemplate((prev) => ({
      ...prev,
      [selectedId]: next,
    }));
  };

  const handleFrontTextPositionChange = (
    key: FrontFieldKey,
    next: { x: number; y: number }
  ) => {
    setFrontOverridesByTemplate((prev) => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        [key]: { ...(prev[selectedId]?.[key] ?? {}), ...next },
      },
    }));
  };

  const handleBackTextPositionChange = (
    key: BackFieldKey,
    next: { x: number; y: number }
  ) => {
    setBackOverridesByTemplate((prev) => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        [key]: { ...(prev[selectedId]?.[key] ?? {}), ...next },
      },
    }));
  };

  const handleResetLayout = () => {
    setFrontOverridesByTemplate((prev) => ({ ...prev, [selectedId]: {} }));
    setBackOverridesByTemplate((prev) => ({ ...prev, [selectedId]: {} }));
  };

  const activePhotoUrl = removeBackground ? cutoutUrl ?? photoUrl : photoUrl;

  useEffect(() => {
    if (!photoFile || isGeneratingBack) return;
    if (backAiUrl) {
      setBackAiStatus("Ready");
      return;
    }
    if (removeBackground && !cutoutUrl) {
      setBackAiStatus("Waiting for background removal...");
      return;
    }
    setBackAiStatus("Ready to generate");
  }, [photoFile, cutoutUrl, removeBackground, isGeneratingBack, backAiUrl]);

  const getFrontDataUrl = () =>
    frontPreviewRef.current?.toDataURL({ pixelRatio: 2 }) ?? null;

  const getBackDataUrl = () =>
    backPreviewRef.current?.toDataURL({ pixelRatio: 2 }) ?? null;

  return (
    <div className="min-h-screen text-[var(--ink)]">
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <div className="mb-10 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[var(--muted-ink)]">
            Flex Trading Cards Builder
          </p>
          <h1 className="font-heading text-3xl font-semibold md:text-4xl">
            Snapshot Builder
          </h1>
          <p className="max-w-2xl text-sm text-[var(--muted-ink)]">
            Upload a portrait, remove the background, and export matching front
            and back cards in minutes.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="flex flex-col items-center justify-start gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="w-full rounded-[36px] border border-white/10 bg-[rgba(46,68,58,0.85)] p-6 shadow-[0_40px_120px_-80px_rgba(52,255,90,0.22)]">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                    <span>Front</span>
                    {removeBackground && isRemovingBackground ? (
                      <span className="text-[var(--brand-neon)]">
                        Processing
                      </span>
                    ) : null}
                  </div>
                  <CardPreview
                    stageRef={frontPreviewRef}
                    template={selectedTemplate}
                    fields={frontFields}
                    photoUrl={activePhotoUrl}
                    isCutout={removeBackground && Boolean(cutoutUrl)}
                    subjectStyle={subjectStyle}
                    isAutoFit={autoFitPhoto}
                    isEditingPhoto={isPhotoEditing}
                    photoOffset={photoOffset}
                    onPhotoOffsetChange={handlePhotoOffsetChange}
                    isEditingLayout={isTextEditing}
                    textOverrides={frontTextOverrides}
                    onTextPositionChange={handleFrontTextPositionChange}
                  />
                </div>
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                    Back
                  </div>
                  <CardBackPreview
                    stageRef={backPreviewRef}
                    template={selectedTemplate}
                    fields={backFields}
                    photoUrl={backAiUrl}
                    isEditingLayout={isTextEditing}
                    textOverrides={backTextOverrides}
                    onTextPositionChange={handleBackTextPositionChange}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-ink)]">
              Preview updates instantly. Export at 2x resolution.
            </p>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.8)] p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                    Upload photo
                  </h2>
                  <p className="text-sm text-[var(--muted-ink)]">
                    JPG, PNG, or WebP. Portraits work best.
                  </p>
                </div>
                {photoUrl ? (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-neon)]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                aria-label="Upload photo"
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                className="mt-4 w-full rounded-2xl border border-dashed border-white/20 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--muted-ink)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-neon)] file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.2em] file:text-[var(--paper)]"
              />
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.6)] px-4 py-3">
                <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  <input
                    type="checkbox"
                    checked={removeBackground}
                    onChange={(event) =>
                      handleToggleRemoveBackground(event.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--brand-neon)]"
                  />
                  Remove background
                </label>
                {photoFile && removeBackground ? (
                  <span className="text-xs text-[var(--muted-ink)]">
                    {removeBackgroundStatus ??
                      (isRemovingBackground ? "Processing..." : "Ready")}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.6)] px-4 py-3">
                <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  <input
                    type="checkbox"
                    checked={autoFitPhoto}
                    onChange={(event) =>
                      handleToggleAutoFit(event.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--brand-neon)]"
                  />
                  Auto-fit photo
                </label>
                {!autoFitPhoto ? (
                  <span className="text-xs text-[var(--muted-ink)]">
                    Drag in preview
                  </span>
                ) : null}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.6)] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  Subject style
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubjectStyle("classic")}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      subjectStyle === "classic"
                        ? "bg-[var(--brand-neon)] text-[var(--paper)] shadow-[0_0_20px_var(--glow)]"
                        : "border border-white/15 text-[var(--muted-ink)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectStyle("stylized")}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      subjectStyle === "stylized"
                        ? "bg-[var(--brand-neon)] text-[var(--paper)] shadow-[0_0_20px_var(--glow)]"
                        : "border border-white/15 text-[var(--muted-ink)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Stylized
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectStyle("neon")}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      subjectStyle === "neon"
                        ? "bg-[var(--brand-neon)] text-[var(--paper)] shadow-[0_0_20px_var(--glow)]"
                        : "border border-white/15 text-[var(--muted-ink)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Neon
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectStyle("fire")}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      subjectStyle === "fire"
                        ? "bg-[var(--brand-neon)] text-[var(--paper)] shadow-[0_0_20px_var(--glow)]"
                        : "border border-white/15 text-[var(--muted-ink)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Fire
                  </button>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-ink)]">
                  Stylized adds an outline. Neon adds a glow. Fire adds a warm edge.
                </p>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.6)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                    Back AI art
                  </p>
                  {photoFile ? (
                    <button
                      type="button"
                      onClick={() => requestBackGeneration(true)}
                      className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-neon)] disabled:opacity-60"
                      disabled={
                        isGeneratingBack ||
                        (removeBackground && !cutoutUrl)
                      }
                    >
                      {backAiUrl ? "Regenerate" : "Generate"}
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-[var(--muted-ink)]">
                  Creates a Dragon Ball Z-inspired sports portrait on the back
                  using the selected subject style.
                </p>
                <p className="mt-2 text-xs text-[var(--muted-ink)]">
                  Generate only when needed (512px preview to save cost).
                </p>
                {photoFile ? (
                  <p className="mt-2 text-xs text-[var(--muted-ink)]">
                    {backAiStatus ??
                      (isGeneratingBack ? "Generating back art..." : "Ready")}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-[var(--muted-ink)]">
                    Upload a photo to generate the back art.
                  </p>
                )}
                {backAiError ? (
                  <p className="mt-2 text-xs text-[var(--accent)]">
                    {backAiError}
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-[var(--muted-ink)]">
                Isolates the player cutout. First run downloads the model.
              </p>
              {removeBackgroundError ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-[var(--accent)]">
                    {removeBackgroundError}
                  </p>
                  {photoFile ? (
                    <button
                      type="button"
                      onClick={() => void runBackgroundRemoval(photoFile)}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-neon)]"
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.8)] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                Template
              </h2>
              <TemplatePicker
                templates={templates}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </section>

            <section className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.8)] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  Layout editor
                </h2>
                <button
                  type="button"
                  onClick={handleResetLayout}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-neon)]"
                >
                  Reset
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {([
                  { id: "off", label: "Off" },
                  { id: "text", label: "Edit text" },
                  { id: "photo", label: "Edit photo" },
                ] as const).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleLayoutModeChange(option.id)}
                    className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      layoutMode === option.id
                        ? "bg-[var(--brand-neon)] text-[var(--paper)] shadow-[0_0_20px_var(--glow)]"
                        : "border border-white/15 text-[var(--muted-ink)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--muted-ink)]">
                {layoutMode === "text"
                  ? "Drag text blocks on the preview to fine-tune placement."
                  : layoutMode === "photo"
                  ? "Auto-fit is off. Drag the photo inside the frame."
                  : "Choose an edit mode to unlock drag controls."}
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.8)] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                Card details
              </h2>
              <div className="mt-4 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                    Front
                  </p>
                  <TextFields
                    fields={frontFields}
                    onChange={handleFrontFieldChange}
                    fieldConfig={frontFieldConfig}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                    Back
                  </p>
                  <TextFields
                    fields={backFields}
                    onChange={handleBackFieldChange}
                    fieldConfig={backFieldConfig}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.85)] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                Export
              </h2>
              <ExportButton
                getDataUrl={getFrontDataUrl}
                fileName={buildSnapshotFileName(selectedTemplate.id, "front")}
                label="Download front PNG"
              />
              <ExportButton
                getDataUrl={getBackDataUrl}
                fileName={buildSnapshotFileName(selectedTemplate.id, "back")}
                label="Download back PNG"
              />
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
