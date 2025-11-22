import Image from "next/image";

import {
  getAllStrategiesWithAi,
  toStrategyCardProps,
} from "@/lib/strategies-service";
import TimeRangeToggle from "../components/dashboard/TimeRangeToggle";
import StrategyCard from "../components/dashboard/StrategyCard";

export default async function DashboardHomePage() {
  const all = await getAllStrategiesWithAi();
  const cards = await Promise.all(all.map(toStrategyCardProps));

  const featured = cards[0] ?? null;
  const others = cards.slice(1);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8">
        <section className="mb-12 sm:mb-16">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Featured Strategy
              </h2>
              <p className="text-sm text-foreground/70">
                Top-performing DeFi strategy curated by experts
              </p>
            </div>

            <TimeRangeToggle />
          </div>

          <div className="mb-8 border border-border rounded-md p-6 bg-background">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {featured?.title ?? "No strategies yet"}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/70 mb-4">
                  <span>Creator:</span>
                  {featured && (
                    <span className="text-accent font-medium">
                      {featured.creator}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex flex-col gap-1 min-w-[100px] px-4 py-3 rounded border border-border bg-muted/30">
                  <span className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
                    Type
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {featured?.type ?? "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 min-w-[100px] px-4 py-3 rounded border border-border bg-muted/30">
                  <span className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
                    Risk
                  </span>
                  <span className="text-sm font-semibold text-[#FCD34D]">
                    {featured?.risk ?? "—"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 min-w-[100px] px-4 py-3 rounded border border-border bg-muted/30">
                  <span className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
                    Performance
                  </span>
                  {featured && (
                    <span className="text-sm font-semibold text-accent">
                      {featured.performance}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop/tablet image */}
            <div className="mt-6 border-t border-border pt-6">
              <Image
                src="/bar.svg"
                alt="Performance chart"
                width={1000}
                height={1000}
                className="w-full h-[200px] object-contain"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              All Strategies
            </h2>
            <p className="text-sm text-foreground/70">
              Browse and compare available DeFi strategies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
            {cards.length === 0 ? (
              <p className="text-[13px] sm:text-[14px] text-foreground/70 col-span-full">
                No strategies have been created yet. Use the Create page to let
                Nir build one from your prompt.
              </p>
            ) : (
              (others.length > 0 ? others : cards).map((strategy) => (
                <StrategyCard
                  key={`${strategy.title}-${strategy.href}`}
                  {...strategy}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
