import Link from "next/link";
import { formatPrice, products } from "@/lib/products";

const checkoutItems = [
  { product: products[0], quantity: 1 },
  { product: products[1], quantity: 2 },
];

export default function CheckoutPage() {
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen px-6 pb-20 pt-16 text-[var(--ink)]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--muted-ink)]">
              Checkout
            </p>
            <h1 className="font-heading text-4xl font-semibold">
              Confirm your order
            </h1>
          </div>
          <Link
            href="/cart"
            className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--muted-ink)] transition hover:text-[var(--ink)]"
          >
            Back to cart
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="space-y-6 rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.85)] p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-ink)]">
                Contact
              </p>
              <div className="mt-3 grid gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  Name
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--ink)]"
                    placeholder="First and last name"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  Email
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--ink)]"
                    placeholder="you@email.com"
                    type="email"
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-ink)]">
                Shipping
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  Address
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--ink)]"
                    placeholder="123 Main St"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  City
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--ink)]"
                    placeholder="City"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  State
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--ink)]"
                    placeholder="State"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-ink)]">
                  Zip
                  <input
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-3 text-sm text-[var(--ink)]"
                    placeholder="00000"
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-[var(--brand-neon)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--paper)] shadow-[0_0_24px_var(--glow)]"
            >
              Place order
            </button>
            <p className="text-xs text-[var(--muted-ink)]">
              This is a UI stub - payment integration comes next.
            </p>
          </form>

          <aside className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.85)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-ink)]">
              Order summary
            </p>
            <div className="mt-4 space-y-3 text-sm">
              {checkoutItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between"
                >
                  <span>
                    {item.product.name} x{item.quantity}
                  </span>
                  <span>
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
