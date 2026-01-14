"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";
import Konva from "konva";
import "konva/lib/filters/Brighten";
import "konva/lib/filters/Contrast";
import "konva/lib/filters/HSL";
import type { FrontFields, Template, TextOverlay } from "@/lib/types";
import { frontFieldOrder } from "@/lib/templates";
import useLoadedImage from "@/lib/useLoadedImage";

type CardPreviewProps = {
  template: Template;
  photoUrl: string | null;
  fields: FrontFields;
  stageRef: RefObject<Konva.Stage | null>;
  isCutout?: boolean;
  subjectStyle?: "classic" | "stylized" | "neon" | "fire";
  isAutoFit?: boolean;
  isEditingPhoto?: boolean;
  photoOffset?: { x: number; y: number };
  onPhotoOffsetChange?: (offset: { x: number; y: number }) => void;
  isEditingLayout?: boolean;
  textOverrides?: Partial<Record<keyof FrontFields, Pick<TextOverlay, "x" | "y">>>;
  onTextPositionChange?: (key: keyof FrontFields, next: { x: number; y: number }) => void;
};

const CARD_RATIO = 7 / 5;
const AUTO_FIT_HEADROOM = 0.06;

export default function CardPreview({
  template,
  photoUrl,
  fields,
  stageRef,
  isCutout = false,
  subjectStyle = "classic",
  isAutoFit = true,
  isEditingPhoto = false,
  photoOffset = { x: 0, y: 0 },
  onPhotoOffsetChange,
  isEditingLayout = false,
  textOverrides,
  onTextPositionChange,
}: CardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Konva.Image | null>(null);
  const photoDragFrameRef = useRef<number | null>(null);
  const dragPointerRef = useRef<{ x: number; y: number } | null>(null);
  const photoOffsetRef = useRef(photoOffset);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    photoOffsetRef.current = photoOffset;
  }, [photoOffset]);

  useEffect(() => {
    return () => {
      if (photoDragFrameRef.current) {
        cancelAnimationFrame(photoDragFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      setSize({ width, height: width * CARD_RATIO });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const backgroundImage = useLoadedImage(template.front.background);
  const playerImage = useLoadedImage(photoUrl);
  const isStylized = subjectStyle === "stylized";
  const isNeon = subjectStyle === "neon";
  const isFire = subjectStyle === "fire";
  const shouldOutline = (isStylized || isNeon || isFire) && isCutout;

  const cutoutBounds = useMemo(() => {
    if (!playerImage || !isCutout) {
      return null;
    }

    const imageWidth = playerImage.naturalWidth || playerImage.width;
    const imageHeight = playerImage.naturalHeight || playerImage.height;
    if (!imageWidth || !imageHeight) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return null;
    }

    ctx.drawImage(playerImage, 0, 0);
    const { data } = ctx.getImageData(0, 0, imageWidth, imageHeight);

    let minX = imageWidth;
    let minY = imageHeight;
    let maxX = -1;
    let maxY = -1;
    const alphaThreshold = 12;
    const sampleStep = imageWidth * imageHeight > 2_000_000 ? 2 : 1;

    for (let y = 0; y < imageHeight; y += sampleStep) {
      for (let x = 0; x < imageWidth; x += sampleStep) {
        const index = (y * imageWidth + x) * 4 + 3;
        if (data[index] > alphaThreshold) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0 || maxY < 0) {
      return null;
    }

    const expand = sampleStep * 2;
    const padding = Math.round(Math.min(imageWidth, imageHeight) * 0.05);
    const paddedMinX = minX - expand - padding;
    const paddedMinY = minY - expand - padding;
    const paddedMaxX = maxX + expand + padding;
    const paddedMaxY = maxY + expand + padding;
    return {
      x: paddedMinX,
      y: paddedMinY,
      width: paddedMaxX - paddedMinX + 1,
      height: paddedMaxY - paddedMinY + 1,
    };
  }, [playerImage, isCutout]);

  const frame = template.front.photoFrame;
  const frameX = (frame.x / 100) * size.width;
  const frameY = (frame.y / 100) * size.height;
  const frameW = (frame.w / 100) * size.width;
  const frameH = (frame.h / 100) * size.height;

  const clipConfig = useMemo(
    () => ({ x: frameX, y: frameY, w: frameW, h: frameH, r: frame.radius }),
    [frameX, frameY, frameW, frameH, frame.radius]
  );

  const playerLayout = useMemo(() => {
    if (!playerImage) return null;
    const imageWidth = playerImage.naturalWidth || playerImage.width;
    const imageHeight = playerImage.naturalHeight || playerImage.height;
    if (!imageWidth || !imageHeight || !frameW || !frameH) return null;

    const contentBounds = cutoutBounds ?? {
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    };
    if (!contentBounds.width || !contentBounds.height) return null;

    const scale = Math.max(
      frameW / contentBounds.width,
      frameH / contentBounds.height
    );
    const width = imageWidth * scale;
    const height = imageHeight * scale;
    const contentOffsetX = contentBounds.x * scale;
    const contentOffsetY = contentBounds.y * scale;
    const contentWidth = contentBounds.width * scale;
    const contentHeight = contentBounds.height * scale;
    const minX = frameW - (contentOffsetX + contentWidth);
    const maxX = -contentOffsetX;
    const minY = frameH - (contentOffsetY + contentHeight);
    const maxY = -contentOffsetY;
    const boundMinX = Math.min(minX, maxX);
    const boundMaxX = Math.max(minX, maxX);
    const boundMinY = Math.min(minY, maxY);
    const boundMaxY = Math.max(minY, maxY);
    const baseX = (frameW - contentWidth) / 2 - contentOffsetX;
    const baseY = (frameH - contentHeight) / 2 - contentOffsetY;
    const headroom = isCutout ? frameH * AUTO_FIT_HEADROOM : 0;
    const x = Math.min(boundMaxX, Math.max(boundMinX, baseX));
    const y = Math.min(boundMaxY, Math.max(boundMinY, baseY + headroom));

    return {
      x,
      y,
      width,
      height,
      contentOffsetX,
      contentOffsetY,
      contentWidth,
      contentHeight,
      minX: boundMinX,
      maxX: boundMaxX,
      minY: boundMinY,
      maxY: boundMaxY,
    };
  }, [playerImage, frameW, frameH, cutoutBounds, isCutout]);

  useEffect(() => {
    const node = playerRef.current;
    if (!node) return;
    if (isStylized || isNeon || isFire) {
      node.cache();
    } else {
      node.clearCache();
    }
    node.getLayer()?.batchDraw();
  }, [isStylized, isNeon, isFire, playerImage]);

  const textMetrics = useMemo(() => {
    if (!size.width || !size.height) return {};
    const metrics: Partial<
      Record<
        keyof FrontFields,
        {
          width: number;
          height: number;
          fontSize: number;
          lineHeight: number;
          text: string;
          fontFamily: string;
          fontStyle: string;
        }
      >
    > = {};

    frontFieldOrder.forEach((key) => {
      const value = fields[key];
      if (!value.trim()) return;
      const overlay = { ...template.front.text[key], ...(textOverrides?.[key] ?? {}) };
      const fontSize = (overlay.fontSize / 100) * size.width;
      const lineHeight = key === "description" ? 1.25 : 1.05;
      const fontStyle = overlay.fontWeight >= 700 ? "bold" : "normal";
      const fontFamily =
        key === "name" || key === "number" || key === "position"
          ? "Bebas Neue, sans-serif"
          : "Barlow, sans-serif";
      const displayValue = key === "position" ? value.toUpperCase() : value;
      const maxWidth = (overlay.maxWidth / 100) * size.width;

      const textNode = new Konva.Text({
        text: displayValue,
        fontSize,
        fontFamily,
        fontStyle,
        lineHeight,
        width: maxWidth,
        wrap: "word",
      });

      metrics[key] = {
        width: Math.min(textNode.getTextWidth(), maxWidth),
        height: textNode.height(),
        fontSize,
        lineHeight,
        text: displayValue,
        fontFamily,
        fontStyle,
      };
    });

    return metrics;
  }, [fields, size.width, size.height, template.front.text, textOverrides]);

  const outlineBlur = Math.max(6, size.width * (isNeon ? 0.025 : isFire ? 0.03 : 0.015));
  const neonColor = "#34FF5A";
  const neonCool = "#47B5FF";
  const fireCore = "#FF4B1F";
  const fireGlow = "#FF9F1C";
  const fireHalo = "#FFD166";

  const dragBounds = useMemo(() => {
    if (!playerLayout || !frameW || !frameH) return null;
    const rangeX = playerLayout.maxX - playerLayout.minX;
    const rangeY = playerLayout.maxY - playerLayout.minY;
    const slackX = Math.max(frameW * 0.12, 16);
    const slackY = Math.max(frameH * 0.1, 16);
    return {
      minX:
        rangeX < slackX
          ? playerLayout.minX - slackX
          : playerLayout.minX,
      maxX:
        rangeX < slackX
          ? playerLayout.maxX + slackX
          : playerLayout.maxX,
      minY:
        rangeY < slackY
          ? playerLayout.minY - slackY
          : playerLayout.minY,
      maxY:
        rangeY < slackY
          ? playerLayout.maxY + slackY
          : playerLayout.maxY,
    };
  }, [playerLayout, frameW, frameH]);

  return (
    <div ref={containerRef} className="w-full">
      {size.width > 0 ? (
        <Stage width={size.width} height={size.height} ref={stageRef}>
          <Layer>
            {backgroundImage ? (
              <KonvaImage
                image={backgroundImage}
                width={size.width}
                height={size.height}
              />
            ) : null}

            <Group
              x={clipConfig.x}
              y={clipConfig.y}
              clipFunc={(ctx) => {
                const radius = clipConfig.r;
                const width = clipConfig.w;
                const height = clipConfig.h;
                ctx.beginPath();
                ctx.moveTo(radius, 0);
                ctx.arcTo(width, 0, width, height, radius);
                ctx.arcTo(width, height, 0, height, radius);
                ctx.arcTo(0, height, 0, 0, radius);
                ctx.arcTo(0, 0, width, 0, radius);
                ctx.closePath();
              }}
            >
              {photoUrl && playerImage && playerLayout ? (
                <Group
                  x={playerLayout.x + (photoOffset.x / 100) * frameW}
                  y={playerLayout.y + (photoOffset.y / 100) * frameH}
                  draggable={!isAutoFit && isEditingPhoto}
                  dragBoundFunc={(pos) => {
                    if (!dragBounds) return pos;
                    return {
                      x: Math.min(dragBounds.maxX, Math.max(dragBounds.minX, pos.x)),
                      y: Math.min(dragBounds.maxY, Math.max(dragBounds.minY, pos.y)),
                    };
                  }}
                  onDragMove={(event) => {
                    if (isAutoFit || !isEditingPhoto || !onPhotoOffsetChange) return;
                    if (!playerLayout || !dragBounds) return;
                    if (photoDragFrameRef.current) {
                      cancelAnimationFrame(photoDragFrameRef.current);
                    }
                    const node = event.target;
                    photoDragFrameRef.current = requestAnimationFrame(() => {
                      const nextX = ((node.x() - playerLayout.x) / frameW) * 100;
                      const nextY = ((node.y() - playerLayout.y) / frameH) * 100;
                      const nextOffset = {
                        x: Number.isFinite(nextX) ? nextX : 0,
                        y: Number.isFinite(nextY) ? nextY : 0,
                      };
                      photoOffsetRef.current = nextOffset;
                      onPhotoOffsetChange(nextOffset);
                    });
                  }}
                  onDragEnd={(event) => {
                    if (isAutoFit || !isEditingPhoto || !onPhotoOffsetChange) return;
                    if (!playerLayout || !dragBounds) return;
                    const node = event.target;
                    const nextX = ((node.x() - playerLayout.x) / frameW) * 100;
                    const nextY = ((node.y() - playerLayout.y) / frameH) * 100;
                    const nextOffset = { x: nextX, y: nextY };
                    photoOffsetRef.current = nextOffset;
                    onPhotoOffsetChange(nextOffset);
                  }}
                >
                  {shouldOutline ? (
                    <KonvaImage
                      image={playerImage}
                      width={playerLayout.width}
                      height={playerLayout.height}
                      shadowColor={
                        isNeon ? neonColor : isFire ? fireGlow : "#F7FBF9"
                      }
                      shadowBlur={outlineBlur}
                      shadowOpacity={isNeon ? 0.95 : isFire ? 0.9 : 0.9}
                      shadowOffsetX={0}
                      shadowOffsetY={0}
                      listening={false}
                    />
                  ) : null}
                  {isNeon ? (
                    <KonvaImage
                      image={playerImage}
                      width={playerLayout.width}
                      height={playerLayout.height}
                      shadowColor={neonCool}
                      shadowBlur={outlineBlur * 0.7}
                      shadowOpacity={0.8}
                      shadowOffsetX={0}
                      shadowOffsetY={0}
                      listening={false}
                    />
                  ) : null}
                  {isFire ? (
                    <>
                      <KonvaImage
                        image={playerImage}
                        width={playerLayout.width}
                        height={playerLayout.height}
                        shadowColor={fireCore}
                        shadowBlur={outlineBlur * 1.1}
                        shadowOpacity={0.85}
                        shadowOffsetX={0}
                        shadowOffsetY={outlineBlur * 0.2}
                        listening={false}
                      />
                      <KonvaImage
                        image={playerImage}
                        width={playerLayout.width}
                        height={playerLayout.height}
                        shadowColor={fireHalo}
                        shadowBlur={outlineBlur * 0.7}
                        shadowOpacity={0.7}
                        shadowOffsetX={0}
                        shadowOffsetY={outlineBlur * 0.1}
                        listening={false}
                      />
                    </>
                  ) : null}
                  <KonvaImage
                    ref={playerRef}
                    image={playerImage}
                    width={playerLayout.width}
                    height={playerLayout.height}
                    shadowColor={
                      isNeon
                        ? "rgba(10,20,18,0.65)"
                        : isFire
                        ? "rgba(40,10,0,0.55)"
                        : isStylized
                        ? "rgba(0,0,0,0.65)"
                        : undefined
                    }
                    shadowBlur={
                      isNeon
                        ? outlineBlur
                        : isFire
                        ? outlineBlur * 0.8
                        : isStylized
                        ? outlineBlur * 0.6
                        : 0
                    }
                    shadowOpacity={isNeon ? 0.85 : isFire ? 0.75 : isStylized ? 0.7 : 0}
                    shadowOffsetX={0}
                    shadowOffsetY={
                      isNeon ? outlineBlur * 0.2 : isFire ? outlineBlur * 0.2 : isStylized ? outlineBlur * 0.15 : 0
                    }
                    filters={
                      isStylized || isNeon || isFire
                        ? [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]
                        : []
                    }
                    brightness={isNeon ? 0.12 : isFire ? 0.1 : isStylized ? 0.08 : 0}
                    contrast={isNeon ? 20 : isFire ? 18 : isStylized ? 12 : 0}
                    saturation={isNeon ? 0.28 : isFire ? 0.2 : isStylized ? 0.12 : 0}
                  />
                </Group>
              ) : (
                <Rect
                  width={clipConfig.w}
                  height={clipConfig.h}
                  fill="rgba(255,255,255,0.12)"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={2}
                  dash={[10, 8]}
                />
              )}
            </Group>

            {!isCutout ? (
              <Rect
                  x={clipConfig.x}
                  y={clipConfig.y}
                  width={clipConfig.w}
                  height={clipConfig.h}
                  cornerRadius={frame.radius}
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth={2}
                  listening={false}
                />
            ) : null}

            {isEditingPhoto && !isAutoFit && playerLayout && dragBounds && photoUrl ? (
              <Rect
                x={0}
                y={0}
                width={size.width}
                height={size.height}
                fill="rgba(0,0,0,0)"
                draggable
                dragBoundFunc={() => ({ x: 0, y: 0 })}
                onDragStart={(event) => {
                  const stage = event.target.getStage();
                  dragPointerRef.current = stage?.getPointerPosition() ?? null;
                }}
                onDragMove={(event) => {
                  if (!onPhotoOffsetChange || !playerLayout) return;
                  const stage = event.target.getStage();
                  const current = stage?.getPointerPosition();
                  const previous = dragPointerRef.current;
                  if (!current || !previous) return;
                  const deltaX = current.x - previous.x;
                  const deltaY = current.y - previous.y;
                  dragPointerRef.current = current;
                  const nextX =
                    photoOffsetRef.current.x + (deltaX / frameW) * 100;
                  const nextY =
                    photoOffsetRef.current.y + (deltaY / frameH) * 100;
                  const clampX = Math.min(
                    dragBounds.maxX,
                    Math.max(dragBounds.minX, playerLayout.x + (nextX / 100) * frameW)
                  );
                  const clampY = Math.min(
                    dragBounds.maxY,
                    Math.max(dragBounds.minY, playerLayout.y + (nextY / 100) * frameH)
                  );
                  const nextOffset = {
                    x: ((clampX - playerLayout.x) / frameW) * 100,
                    y: ((clampY - playerLayout.y) / frameH) * 100,
                  };
                  photoOffsetRef.current = nextOffset;
                  onPhotoOffsetChange(nextOffset);
                }}
                onDragEnd={() => {
                  dragPointerRef.current = null;
                }}
              />
            ) : null}

            {(() => {
              let lastTextBottom = 0;

              return frontFieldOrder.map((key) => {
                const value = fields[key];
                if (!value.trim()) return null;
                const overlay = {
                  ...template.front.text[key],
                  ...(textOverrides?.[key] ?? {}),
                };
                const metrics = textMetrics[key];
                const fontSize = metrics?.fontSize ?? (overlay.fontSize / 100) * size.width;
                const overlayX = (overlay.x / 100) * size.width;
                const overlayY = (overlay.y / 100) * size.height;
                const overlayWidth = (overlay.maxWidth / 100) * size.width;
                const displayValue = metrics?.text ?? (key === "position" ? value.toUpperCase() : value);
                const fontStyle = metrics?.fontStyle ?? (overlay.fontWeight >= 700 ? "bold" : "normal");
                const fontFamily =
                  metrics?.fontFamily ??
                  (key === "name" || key === "number" || key === "position"
                    ? "Bebas Neue, sans-serif"
                    : "Barlow, sans-serif");
                const lineHeight = metrics?.lineHeight ?? (key === "description" ? 1.25 : 1.05);
                const textHeight = metrics?.height ?? fontSize * lineHeight;
                const textWidth = metrics?.width ?? overlayWidth;

                let backgroundNode = null;
                if (overlay.background) {
                  const paddingX = (overlay.background.paddingX ?? 0.4) * fontSize;
                  const paddingY = (overlay.background.paddingY ?? 0.2) * fontSize;
                  const borderWidth = (overlay.background.borderWidth ?? 0) * fontSize;
                  const radius = (overlay.background.radius ?? 0) * fontSize;
                  const minGap = (overlay.background.minGap ?? 0) * fontSize;
                  const rectWidth = Math.min(textWidth + paddingX * 2, overlayWidth);
                  const availableTop = Math.max(0, overlayY - lastTextBottom - minGap);
                  const topPadding = Math.min(paddingY, availableTop);
                  const rectHeight = textHeight + paddingY + topPadding;
                  const alignOffset =
                    overlay.align === "center"
                      ? (overlayWidth - rectWidth) / 2
                      : overlay.align === "right"
                      ? overlayWidth - rectWidth
                      : 0;

                  backgroundNode = (
                    <Rect
                      x={alignOffset}
                      y={-topPadding}
                      width={rectWidth}
                      height={rectHeight}
                      fill={overlay.background.color}
                      stroke={overlay.background.borderColor}
                      strokeWidth={borderWidth}
                      cornerRadius={radius}
                      listening={false}
                    />
                  );

                  lastTextBottom = overlayY - topPadding + rectHeight;
                } else {
                  lastTextBottom = Math.max(lastTextBottom, overlayY + textHeight);
                }

                return (
                  <Group
                    key={key}
                    x={overlayX}
                    y={overlayY}
                    draggable={isEditingLayout}
                    listening={isEditingLayout}
                    dragBoundFunc={(pos) => {
                      const maxX = Math.max(0, size.width - overlayWidth);
                      const maxY = Math.max(0, size.height - textHeight);
                      return {
                        x: Math.min(maxX, Math.max(0, pos.x)),
                        y: Math.min(maxY, Math.max(0, pos.y)),
                      };
                    }}
                    onDragEnd={(event) => {
                      if (!isEditingLayout || !onTextPositionChange) return;
                      const node = event.target;
                      const nextX = (node.x() / size.width) * 100;
                      const nextY = (node.y() / size.height) * 100;
                      onTextPositionChange(key, { x: nextX, y: nextY });
                    }}
                  >
                    {backgroundNode}
                    <Text
                      x={0}
                      y={0}
                      width={overlayWidth}
                      text={displayValue}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                      fontStyle={fontStyle}
                      fill={overlay.color}
                      align={overlay.align}
                      lineHeight={lineHeight}
                      letterSpacing={
                        key === "number" ? fontSize * 0.08 : fontSize * 0.02
                      }
                      wrap="word"
                    />
                    {isEditingLayout ? (
                      <Rect
                        x={0}
                        y={0}
                        width={overlayWidth}
                        height={textHeight}
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth={1}
                        dash={[6, 6]}
                      />
                    ) : null}
                  </Group>
                );
              });
            })()}
          </Layer>
        </Stage>
      ) : (
        <div className="aspect-[5/7] rounded-[24px] border border-white/10 bg-[var(--surface-muted)]" />
      )}
    </div>
  );
}
