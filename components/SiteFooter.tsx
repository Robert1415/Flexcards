import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs uppercase tracking-[0.3em] text-[var(--muted-ink)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-6 w-[110px]">
            <Image
              src="/brand/logo.png"
              alt="Flex Trading Cards logo"
              fill
              className="object-contain"
            />
          </div>
          <span>Flex Trading Cards</span>
        </div>
        <span>Built for ONYX + Canon UV workflows</span>
      </div>
    </footer>
  );
}
