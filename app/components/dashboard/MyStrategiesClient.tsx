"use client";

import { useState } from "react";
import type { StrategyCardProps } from "@/app/types/strategy-types";
import StrategyCard from "@/app/components/dashboard/StrategyCard";
import SegmentedTabs from "@/app/components/dashboard/SegmentedTabs";
import { Button } from "@/app/components/ui/button";

const TABS = [
  { label: "Joined Strategies", value: "joined" },
  { label: "Created Strategies", value: "created" },
];

interface MyStrategiesClientProps {
  joined: StrategyCardProps[];
  created: StrategyCardProps[];
}

export function MyStrategiesClient({
  joined,
  created,
}: MyStrategiesClientProps) {
  const [activeTab, setActiveTab] = useState<"joined" | "created">("joined");

  const strategies = activeTab === "joined" ? joined : created;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 lg:py-10">
        <header className="mb-8 sm:mb-12 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[28px] sm:text-[32px] lg:text-[34px] font-semibold tracking-[0.01em] text-[#1A1A1A]">
              My Strategies
            </h1>
            <p className="mt-2 text-[14px] sm:text-[16px] text-[#4A6B6E]">
              View strategies you have joined or created on Nir.
            </p>
          </div>

          <Button
            variant="ghost"
            className="rounded-lg border border-accent/30 bg-accent/5 px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 text-xs sm:text-sm font-semibold text-accent transition hover:text-accent-foreground hover:bg-accent/10 w-full sm:w-auto"
            disabled
          >
            Export (coming soon)
          </Button>
        </header>

        <section className="mb-8 sm:mb-10 flex flex-col items-center gap-4 sm:gap-6">
          <SegmentedTabs
            tabs={TABS}
            defaultValue="joined"
            onChange={(value) =>
              setActiveTab(value === "created" ? "created" : "joined")
            }
          />
        </section>

        <section className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {strategies.length === 0 ? (
            <p className="text-[13px] sm:text-[14px] text-[#4A6B6E] col-span-full">
              No strategies found yet for this tab.
            </p>
          ) : (
            strategies.map((strategy) => (
              <StrategyCard
                key={`${strategy.title}-${strategy.href}`}
                {...strategy}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}
