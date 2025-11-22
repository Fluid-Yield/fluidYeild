// components/StrategyCard.tsx
"use client";

import Link from "next/link";
import { ChartImage } from "./ChartImage";
import type { StrategyCardProps } from "@/app/types/strategy-types";
import { riskColor } from "@/lib/utils";

const StrategyCard = ({
  title,
  type,
  creator,
  description,
  performance,
  risk,
  href = "#",
}: StrategyCardProps) => {
  return (
    <article className="relative flex min-h-[280px] sm:min-h-[300px] z-20 flex-col justify-between gap-4 sm:gap-6 rounded-[24px] sm:rounded-[28px] border border-[#1FE9F7]/20 px-4 sm:px-6 pb-4 sm:pb-6 text-[#D4F7F9] shadow-[0_20px_36px_rgba(6,33,36,0.35),inset_0_0_18px_rgba(31,233,247,0.08)] [background:radial-gradient(160%_120%_at_50%_0%,rgba(31,233,247,0.25),rgba(3,9,10,0.9)),rgba(8,17,18,0.95)] overflow-hidden">
      <ChartImage />

      <span className="badge-angled mb-6 sm:mb-10 mx-auto py-2 sm:py-3 text-[11px] sm:text-xs">
        {type}
      </span>

      <div className="absolute top-20 sm:top-28 left-1/2 -translate-x-1/2 z-30 bg-[rgba(18,33,33,0.72)] creator-badge rounded-lg px-6 sm:px-10 py-1.5 sm:py-2">
        <p className="text-[10px] sm:text-xs font-medium text-[#5AF3FB]">
          {creator}
        </p>
      </div>

      {/* Strategy Details */}
      <div
        className="mt-4 sm:mt-6 rounded-lg p-3 sm:p-4 
                bg-[rgba(18,33,33,0.34)] 
                bg-glass-blur-md
                "
      >
        <div className="relative z-10 flex flex-col space-y-2 mb-2 mt-2 sm:mt-4">
          <h3 className="text-sm sm:text-base font-semibold leading-snug text-[#F2F4F5]">
            {title}
          </h3>
          <p className="relative z-10 h-[70px] text-[10px] sm:text-xs text-wrap text-[#ADBEBF] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-[10px] sm:text-xs uppercase tracking-[0.14em] text-[#79AFB3]">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs uppercase font-medium tracking-[0.14em] text-[#79AFB3]">
              Performance:{" "}
            </span>
            <strong className="text-xs sm:text-sm normal-case tracking-normal text-[#5AF3FB]">
              {performance}
            </strong>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs tracking-[0.14em] text-[#D6D7D7]">
              Risk:
            </span>
            <strong
              className={`text-xs sm:text-sm normal-case tracking-normal ${riskColor(
                risk
              )}`}
            >
              {risk}
            </strong>
          </div>
        </div>

        <div className="relative z-10 mt-3 sm:mt-4 flex bg-transparent border-none outline-none flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          <Link
            className="text-xs sm:text-sm font-medium text-[#79AFB3] strategy-badge rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 w-full text-center"
            href={href}
          >
            View Details
          </Link>
          <Link
            href={href}
            className="text-xs sm:text-sm font-medium text-[#090909] bg-[#1FE9F7] hover:bg-[#1FE9F7]/80 cursor-pointer rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 w-full text-center"
          >
            Join Strategy
          </Link>
        </div>
      </div>
    </article>
  );
};

export default StrategyCard;
