"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";
import type { BackFields, Template, TextOverlay } from "@/lib/types";
import { backFieldOrder } from "@/lib/templates";
import useLoadedImage from "@/lib/useLoadedImage";

type CardBackPreviewProps = {
  template: Template;
  fields: BackFields;
  photoUrl?: string | null;
  stageRef: RefObject<Konva.Stage | null>;
  isEditingLayout?: boolean;
  textOverrides?: Partial<Record<keyof BackFields, Pick<TextOverlay, "x" | "y">>>;
  onTextPositionChange?: (key: keyof BackFields, next: { x: number; y: number }) => void;
};

const CARD_RATIO = 7 / 5;

export default function CardBackPreview({
  template,
  fields,
  photoUrl = null,
  stageRef,
  isEditingLayout = false,
  textOverrides,
  onTextPositionChange,
}: CardBackPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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

  const backgroundImage = useLoadedImage(template.back.background);
  const aiImage = useLoadedImage(photoUrl);

  const frame = template.back.photoFrame;
  const frameX = frame ? (frame.x / 100) * size.width : 0;
  const frameY = frame ? (frame.y / 100) * size.height : 0;
  const frameW = frame ? (frame.w / 100) * size.width : 0;
  const frameH = frame ? (frame.h / 100) * size.height : 0;

  const aiLayout = useMemo(() => {
    if (!aiImage || !frameW || !frameH) return null;
    const imageWidth = aiImage.naturalWidth || aiImage.width;
    const imageHeight = aiImage.naturalHeight || aiImage.height;
    if (!imageWidth || !imageHeight) return null;
    const scale = Math.max(frameW / imageWidth, frameH / imageHeight);
    const width = imageWidth * scale;
    const height = imageHeight * scale;
    const x = (frameW - width) / 2;
    const y = (frameH - height) / 2;
    return { x, y, width, height };
  }, [aiImage, frameW, frameH]);

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

            {frame ? (
              <Group
                x={frameX}
                y={frameY}
                clipFunc={(ctx) => {
                  const radius = frame.radius ?? 0;
                  ctx.beginPath();
                  ctx.moveTo(radius, 0);
                  ctx.arcTo(frameW, 0, frameW, frameH, radius);
                  ctx.arcTo(frameW, frameH, 0, frameH, radius);
                  ctx.arcTo(0, frameH, 0, 0, radius);
                  ctx.arcTo(0, 0, frameW, 0, radius);
                  ctx.closePath();
                }}
              >
                {aiImage && aiLayout ? (
                  <KonvaImage
                    image={aiImage}
                    width={aiLayout.width}
                    height={aiLayout.height}
                    x={aiLayout.x}
                    y={aiLayout.y}
                  />
                ) : (
                  <Rect
                    width={frameW}
                    height={frameH}
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={2}
                    dash={[10, 8]}
                    listening={false}
                  />
                )}
              </Group>
            ) : null}

            {backFieldOrder.map((key) => {
              const value = fields[key];
              if (!value.trim()) return null;
              const overlay = {
                ...template.back.text[key],
                ...(textOverrides?.[key] ?? {}),
              };
              const fontSize = (overlay.fontSize / 100) * size.width;
              const fontStyle = overlay.fontWeight >= 700 ? "bold" : "normal";
              const lineHeight = key === "bio" ? 1.35 : 1.2;
              const overlayWidth = (overlay.maxWidth / 100) * size.width;
              const textHeight = fontSize * lineHeight;

              return (
                <Group
                  key={key}
                  x={(overlay.x / 100) * size.width}
                  y={(overlay.y / 100) * size.height}
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
                  <Text
                    x={0}
                    y={0}
                    width={overlayWidth}
                    text={value}
                    fontSize={fontSize}
                    fontFamily={
                      key === "footerNote"
                        ? "Bebas Neue, sans-serif"
                        : "Barlow, sans-serif"
                    }
                    fontStyle={fontStyle}
                    fill={overlay.color}
                    align={overlay.align}
                    lineHeight={lineHeight}
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
            })}
          </Layer>
        </Stage>
      ) : (
        <div className="aspect-[5/7] rounded-[24px] border border-white/10 bg-[var(--surface-muted)]" />
      )}
    </div>
  );
}
