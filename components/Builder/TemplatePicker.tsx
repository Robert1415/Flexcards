"use client";

import Image from "next/image";
import type { Template } from "@/lib/types";

type TemplatePickerProps = {
  templates: Template[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function TemplatePicker({
  templates,
  selectedId,
  onSelect,
}: TemplatePickerProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {templates.map((template) => {
        const isSelected = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            aria-pressed={isSelected}
            className={`rounded-2xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
              isSelected
                ? "border-[var(--brand-neon)] bg-[rgba(52,255,90,0.08)]"
                : "border-white/10 bg-[rgba(46,68,58,0.7)]"
            }`}
          >
            <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-white/10">
              <Image
                src={template.front.background}
                alt={`${template.name} background`}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
              {template.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
