"use client";

import { useState } from "react";
import { triggerDownload } from "@/lib/utils";

type ExportButtonProps = {
  getDataUrl: () => string | null;
  fileName: string;
  label: string;
};

export default function ExportButton({
  getDataUrl,
  fileName,
  label,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const dataUrl = getDataUrl();
      if (!dataUrl) {
        setError("Preview not ready yet.");
        return;
      }
      triggerDownload(dataUrl, fileName);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="w-full rounded-2xl bg-[var(--brand-neon)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--paper)] shadow-[0_0_24px_var(--glow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? "Exporting..." : label}
      </button>
      <p className="text-xs text-[var(--muted-ink)]">
        Exports the preview at 2x resolution.
      </p>
      {error ? <p className="text-xs text-[var(--accent)]">{error}</p> : null}
    </div>
  );
}
