import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <div className="absolute inset-0">
        <Image
          src="/brand/hero-box-top.png"
          alt="Flex Trading Cards hero background"
          fill
          className="object-cover opacity-35"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-[var(--paper)]" />
      </div>

      <main className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <p className="fade-up text-xs font-semibold uppercase tracking-[0.45em] text-[var(--muted-ink)]">
            Bold, personalized, premium cards
          </p>
          <h1 className="fade-up font-heading text-4xl font-semibold leading-tight md:text-5xl">
            Build trading cards that put the player in the spotlight.
          </h1>
          <p className="fade-up-delay max-w-xl text-lg text-[var(--muted-ink)]">
            Upload a portrait, cut out the subject, and design matching front
            and back layouts. The builder keeps everything aligned and ready
            for production.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/builder"
              className="rounded-full bg-[var(--brand-neon)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--paper)] shadow-[0_0_28px_var(--glow)] transition hover:opacity-90"
            >
              Start building
            </Link>
            <Link
              href="/builder"
              className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink)] transition hover:border-[var(--brand-neon)]"
            >
              View templates
            </Link>
          </div>
          <div className="grid gap-3 text-sm text-[var(--muted-ink)] sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.8)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em]">Step 1</p>
              <p className="font-semibold text-[var(--ink)]">Upload photo</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.8)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em]">Step 2</p>
              <p className="font-semibold text-[var(--ink)]">Edit front/back</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[rgba(46,68,58,0.8)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em]">Step 3</p>
              <p className="font-semibold text-[var(--ink)]">Export PNGs</p>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center">
          <div className="absolute -left-6 top-6 h-40 w-40 rounded-[32px] border border-white/10 bg-[rgba(46,68,58,0.7)] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.45)]" />
          <div className="relative w-full max-w-[420px]">
            <div className="float-slow relative overflow-hidden rounded-[36px] border border-white/10 bg-[var(--surface)] shadow-[0_40px_90px_-60px_rgba(0,0,0,0.8)]">
              <div className="relative aspect-[5/7]">
                <Image
                  src="/brand/card-neon.png"
                  alt="Neon card preview"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 420px, 80vw"
                />
                <div className="absolute left-[8%] top-[10%] rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[var(--brand-neon)]">
                  Neon Core
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 right-6 w-32 rotate-6">
              <div className="relative aspect-[5/7] overflow-hidden rounded-[24px] border border-white/10 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.7)]">
                <Image
                  src="/brand/card-umpire.png"
                  alt="Umpire card preview"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 140px, 40vw"
                />
              </div>
            </div>
            <div className="absolute -top-10 right-10 w-24 -rotate-3">
              <div className="relative aspect-[5/7] overflow-hidden rounded-[20px] border border-white/10 shadow-[0_16px_30px_-24px_rgba(0,0,0,0.7)]">
                <Image
                  src="/brand/card-christmas.png"
                  alt="Seasonal card preview"
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--muted-ink)]">
              Reviews
            </p>
            <h2 className="font-heading text-3xl font-semibold">
              Coaches and parents love the finish.
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-[rgba(46,68,58,0.7)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-neon)]">
            4.9 avg rating
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "The neon edge and bold nameplate feel premium. Our team loved the keepsakes.",
              author: "Coach Lewis · Varsity Baseball",
            },
            {
              quote:
                "We were able to export both sides and send to print the same day. Super clean.",
              author: "Alyssa R. · Booster Club",
            },
            {
              quote:
                "Background removal plus the stylized outline makes every athlete pop.",
              author: "Darren M. · Youth League Director",
            },
          ].map((review) => (
            <article
              key={review.author}
              className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.85)] p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.5)]"
            >
              <p className="text-sm text-[var(--ink)]">{review.quote}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-ink)]">
                {review.author}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--muted-ink)]">
              FAQs
            </p>
            <h2 className="font-heading text-3xl font-semibold">
              Everything you need to know before you build.
            </h2>
            <p className="text-sm text-[var(--muted-ink)]">
              We keep the workflow fast: upload, remove background, edit, and
              export. Here are the questions we hear most often.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                question: "Can I use the classic or stylized cutout?",
                answer:
                  "Yes. Toggle between Classic (clean cutout) and Stylized (outlined, boosted contrast) before exporting.",
              },
              {
                question: "Do the front and back always match?",
                answer:
                  "They stay synced to the same template, so colors and layouts feel cohesive across the card.",
              },
              {
                question: "What file type do I get?",
                answer:
                  "You can download both sides as PNGs at 2x resolution for sharing or production.",
              },
              {
                question: "Will this work for different sports?",
                answer:
                  "Yes. The builder includes a baseball template and a wrestling template, with more coming soon.",
              },
            ].map((item) => (
              <div
                key={item.question}
                className="rounded-3xl border border-white/10 bg-[rgba(46,68,58,0.8)] p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-neon)]">
                  {item.question}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-ink)]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
