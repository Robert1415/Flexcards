import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.85)] p-5 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.5)] transition hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 240px, 80vw"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-heading text-2xl text-[var(--ink)]">
          {product.name}
        </h3>
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-neon)]">
          {formatPrice(product.price)}
        </span>
      </div>
      <p className="mt-2 text-sm text-[var(--muted-ink)]">
        {product.description}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href="/builder"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
        >
          Customize
        </Link>
        <Link
          href="/cart"
          className="rounded-full bg-[var(--brand-neon)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--paper)] shadow-[0_0_20px_var(--glow)]"
        >
          Add to cart
        </Link>
      </div>
    </article>
  );
}
