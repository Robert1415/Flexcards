import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <Image
            src="/brand/bat.svg"
            alt="Loading"
            fill
            className="spin-bat object-contain"
            priority
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted-ink)]">
          Loading
        </p>
      </div>
    </div>
  );
}
