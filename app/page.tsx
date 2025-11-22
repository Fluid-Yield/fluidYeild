import Image from "next/image";
import FY_logo from "@/public/nirLogoWhite.png";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Background accents */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-40 left-[10%] h-80 w-80 rounded-full blur-[120px] opacity-25"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(31,233,247,0.28) 0%, rgba(31,233,247,0.04) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div
          className="absolute -bottom-24 right-[8%] h-64 w-md rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(143,181,184,0.25) 0%, rgba(143,181,184,0.06) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      <section className="px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl py-12 sm:py-18 lg:py-22">
          {/* Brand row */}
          <div className="mx-auto mb-6 sm:mb-8 flex w-full max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-up">
              <Image
                src={FY_logo}
                alt=" Fluid Yield"
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <span className="text-sm translate-y-2 sm:text-base text-accent-foreground">
                Fluid Yield
              </span>
            </div>
          </div>
          {/* Hero split */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-center">
            <div className="flex flex-col items-start text-left gap-6">
              <div className="flex items-center gap-2 animate-fade-up">
                <span className="rounded-full border text-accent border-[#dedbdb] px-3 py-1.5 text-[11px] tracking-wide ">
                  Strategy-first DeFi
                </span>
                <span className="rounded-full border text-accent border-[#dedbdb] px-3 py-1.5 text-[11px] tracking-wide ">
                  Fluid Yield — clarity-first strategy tooling.
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-accent/70 animate-fade-up">
                Build <span className="text-accent">strategies</span> you’re
                proud to share.
              </h1>
              <p className="max-w-xl  text-sm sm:text-base animate-fade-up-delayed">
                A clean space to compose, backtest, and publish DeFi strategies.
                Designed for clarity, built for collaboration.
              </p>

              <div className="mt-1 flex items-center gap-3 animate-fade-up-delayed">
                <a
                  href="/dashboard"
                  className="rounded-full border border-[#f5266059] bg-background px-6 sm:px-7 py-3 text-sm sm:text-base font-medium text-accent shadow-glow-pink transition hover:text-[#ff6b8f]"
                >
                  Launch Dapp
                </a>
                <a
                  href="/dashboard/learn"
                  className="rounded-full bg-accent px-6 sm:px-7 py-3 text-sm sm:text-base text-white border border-accent/50 hover:bg-accent/90 transition"
                >
                  What’s inside
                </a>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 max-w-lg">
                <div
                  className="rounded-lg border border-[#dedbdb]  p-3 animate-fade-up"
                  style={{ animationDelay: "0ms" }}
                >
                  <p className="text-xs text-accent">Curators</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Community-led
                  </p>
                </div>
                <div
                  className="rounded-lg border border-[#dedbdb]  p-3 animate-fade-up"
                  style={{ animationDelay: "120ms" }}
                >
                  <p className="text-xs text-accent">Privacy</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Yours by default
                  </p>
                </div>
                <div
                  className="rounded-lg border border-[#dedbdb]  p-3 animate-fade-up"
                  style={{ animationDelay: "240ms" }}
                >
                  <p className="text-xs text-accent">Latency</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Snappy
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 max-w-lg">
                <div className="rounded-lg border border-[#dedbdb]  p-3">
                  <p className="text-xs text-accent">Chains</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Base, OP, BSC
                  </p>
                </div>
                <div className="rounded-lg border border-[#dedbdb]  p-3">
                  <p className="text-xs text-accent">Focus</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Clarity-first
                  </p>
                </div>
                <div className="rounded-lg border border-[#dedbdb]  p-3">
                  <p className="text-xs text-accent">Mode</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    Collaborative
                  </p>
                </div>
              </div>
            </div>

            {/* Preview card */}
            <div className="rounded-2xl border border-accent/50 bg-background p-4 sm:p-5 lg:p-6 shadow-[0_24px_48px_rgba(6,24,26,0.35)] animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm ">Preview</p>
                <p className="text-xs ">Example strategy</p>
              </div>
              <div className="mt-3 aspect-16/10 w-full overflow-hidden rounded-lg border border-[#132225] bg-[#070B0B] flex items-center justify-center animate-fade-up-delayed">
                <img
                  src="/bar.svg"
                  alt="Strategy preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div
                  className="rounded-md border border-accent/50 bg-background p-3 animate-fade-up"
                  style={{ animationDelay: "0ms" }}
                >
                  <p className="text-[11px] ">Type</p>
                  <p className="text-sm font-semibold mt-1">Momentum</p>
                </div>
                <div
                  className="rounded-md border border-accent/50 bg-background p-3 animate-fade-up"
                  style={{ animationDelay: "120ms" }}
                >
                  <p className="text-[11px] ">Risk</p>
                  <p className="text-sm font-semibold mt-1 ">Mod.</p>
                </div>
                <div
                  className="rounded-md border border-accent/50 bg-background p-3 animate-fade-up"
                  style={{ animationDelay: "240ms" }}
                >
                  <p className="text-[11px] ">Perf.</p>
                  <p className="text-sm font-semibold mt-1">+12.4%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 sm:mt-20 h-px w-full bg-gradient-to-r from-transparent via-[#1c2a2d] to-transparent animate-fade-up" />

          {/* Feature grid */}
          <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div
              className="rounded-xl border border-accent/50 bg-background shadow-glow-pink  p-5 animate-fade-up"
              style={{ animationDelay: "0ms" }}
            >
              <h3 className="text-accent font-medium">Visual composition</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag-free building blocks, clear defaults, and guardrails that
                stay out of your way.
              </p>
            </div>
            <div
              className="rounded-xl border border-accent/50 bg-background shadow-glow-pink  p-5 animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              <h3 className="font-medium text-accent">Fast backtesting</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Iterate quickly with lightweight sims and focused metrics that
                tell the story.
              </p>
            </div>
            <div
              className="rounded-xl border border-accent/50 bg-background shadow-glow-pink  p-5 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <h3 className="font-medium text-accent">Respectful publishing</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Share drafts, invite comments, and keep ownership of what you
                ship.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-14 sm:mt-18 rounded-2xl border border-accent/50 shadow-glow-pink bg-background p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold ">
                Start crafting your first strategy
              </h3>
              <p className="mt-2 text-muted-foreground text-sm ">
                It takes minutes to set up a draft. No loud banners. No
                distractions.
              </p>
            </div>
            <a
              href="/dashboard/create"
              className="bg-accent text-white px-6 sm:px-7 py-3 text-sm sm:text-base font-medium rounded-full transition hover:bg-accent/90"
            >
              Create Strategy
            </a>
          </div>
        </div>
      </section>
      <div className="mt-16" />
      {/* Footer */}
      <Footer />
    </main>
  );
}
