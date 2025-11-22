"use client";

import { Fragment } from "react";

export interface Step {
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentIndex: number;
}

const baseCircleClasses =
  "grid h-12 w-12 place-items-center rounded-full border border-accent/15 bg-accent/5 text-[16px] font-semibold text-muted-foreground/50 shadow-sm transition-all";
const activeCircleClasses =
  "border-none !text-foreground bg-accent shadow-[0_8px_18px_rgba(194,24,91,0.3)]";

const ProgressSteps = ({ steps, currentIndex }: ProgressStepsProps) => {
  return (
    <div className="flex items-center gap-4 rounded-full px-7 py-5">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <Fragment key={step.label}>
            <div className="flex min-w-[120px] flex-col items-center gap-2 text-center">
              <span
                className={`${baseCircleClasses} ${
                  isActive ? activeCircleClasses : ""
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-[13px] text-muted-foreground ${
                  isActive ? "text-accent font-medium" : ""
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(194,24,91,0.2),transparent)]" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default ProgressSteps;
