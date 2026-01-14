import Image from "next/image";
import Link from "next/link";
import { formatPrice, products } from "@/lib/products";

const cartItems = [
  { product: products[0], quantity: 1 },
  { product: products[1], quantity: 2 },
];

export default function CartPage() {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen px-6 pb-20 pt-16 text-[var(--ink)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--muted-ink)]">
              Cart
            </p>
            <h1 className="font-heading text-4xl font-semibold">
              Your selections
            </h1>
          </div>
          <Link
            href="/shop"
            className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
          >
            Continue shopping
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.85)] p-4"
              >
                <div className="relative h-28 w-24 overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-heading text-2xl">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-[var(--muted-ink)]">
                      {item.product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-[var(--muted-ink)]">
                    <span>Qty {item.quantity}</span>
                    <span>{formatPrice(item.product.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.85)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-ink)]">
              Order summary
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted-ink)]">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="mt-6">
              <Link
                href="/checkout"
                className="block w-full rounded-full bg-[var(--brand-neon)] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[var(--paper)] shadow-[0_0_24px_var(--glow)]"
              >
                Proceed to checkout
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
