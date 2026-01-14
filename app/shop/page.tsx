import Link from "next/link";
import ProductCard from "@/components/Shop/ProductCard";
import { products } from "@/lib/products";

export default function ShopPage() {
  return (
    <div className="min-h-screen px-6 pb-20 pt-16 text-[var(--ink)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--muted-ink)]">
              Shop
            </p>
            <h1 className="font-heading text-4xl font-semibold">
              Trading card packages
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted-ink)]">
              Choose a package, customize the design, and send it to print when
              you are ready.
            </p>
          </div>
          <Link
            href="/cart"
            className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
          >
            View cart
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.8)] p-6 text-sm text-[var(--muted-ink)]">
          Need a custom volume order? Contact the Flex team for bulk pricing.
        </div>
      </div>
    </div>
  );
}
