import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-4 z-50 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-[rgba(46,68,58,0.9)] px-5 py-3 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)] backdrop-blur">
          <Link className="flex items-center gap-3" href="/">
            <div className="relative h-8 w-[140px]">
              <Image
                src="/brand/logo.png"
                alt="Flex Trading Cards logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.45em] text-[var(--muted-ink)] sm:inline">
              Trading Cards
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--muted-ink)]">
            <Link
              className="rounded-full border border-white/10 px-4 py-2 transition hover:text-white"
              href="/"
            >
              Home
            </Link>
            <Link
              className="rounded-full border border-white/10 px-4 py-2 transition hover:text-white"
              href="/shop"
            >
              Shop
            </Link>
            <Link
              className="rounded-full border border-white/10 px-4 py-2 transition hover:text-white"
              href="/cart"
            >
              Cart
            </Link>
            <Link
              className="rounded-full bg-[var(--brand-neon)] px-4 py-2 text-[var(--paper)] shadow-[0_0_24px_var(--glow)] transition hover:opacity-90"
              href="/builder"
            >
              Build
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
