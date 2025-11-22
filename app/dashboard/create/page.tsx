"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { decodeEventLog } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import ProgressSteps from "@/app/components/dashboard/ProgressSteps";
import { StrategyFromAi } from "@/lib/strategy-model";
import { TOKENS, TokenKey } from "@/lib/tokens";
import { buildStepsFromAi } from "@/lib/encode-strategy";

import { fyContracts } from "@/lib/contracts";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/toast-provider";

const STEPS = [
  { label: "Prompt" },
  { label: "AI Strategy" },
  { label: "Deploy to flare" },
];

export default function CreateStrategyPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const router = useRouter();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [aiStrategy, setAiStrategy] = useState<StrategyFromAi | null>(null);
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const hasStrategy = !!aiStrategy;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setAiStrategy(null);

    try {
      const res = await fetch("/api/ai/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to generate strategy");
      }
      const data = (await res.json()) as { strategy: StrategyFromAi };
      setAiStrategy(data.strategy);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unexpected error";
      toast({ description: message, variant: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeploy = async () => {
    if (!aiStrategy) return;

    const tokenKey = aiStrategy.inputToken as TokenKey;
    const token = TOKENS[tokenKey];

    if (!token) {
      toast({
        description: "AI returned an unsupported input token. Try again.",
        variant: "error",
      });
      return;
    }

    if (!isConnected || !address) {
      toast({
        description:
          "Connect your wallet on BNB testnet to deploy the strategy.",
        variant: "error",
      });
      return;
    }

    setDeploying(true);

    try {
      const steps = buildStepsFromAi(aiStrategy);

      const hash = await writeContractAsync({
        abi: fyContracts.strategyVault.abi,
        address: fyContracts.strategyVault.address,
        functionName: "createStrategy",
        args: [aiStrategy.name, token.address, steps],
      });

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === "reverted") {
          toast({
            description:
              "Failed to deploy strategy. Check your wallet and try again.",
            variant: "error",
          });
          return;
        }

        let vaultStrategyId: number | null = null;

        for (const log of receipt.logs) {
          if (
            log.address.toLowerCase() !==
            fyContracts.strategyVault.address.toLowerCase()
          ) {
            continue;
          }

          try {
            const decoded = decodeEventLog({
              abi: fyContracts.strategyVault.abi,
              data: log.data,
              topics: log.topics,
            });
            console.log("[decoded]: ", decoded);

            if (decoded.eventName === "StrategyCreated") {
              const id = (decoded.args as unknown as { strategyId: bigint })
                ?.strategyId;
              if (id != null) {
                vaultStrategyId = Number(id);
                break;
              }
            }
          } catch {
            // ignore non-matching logs
          }
        }

        if (vaultStrategyId != null) {
          const res = await fetch("/api/strategies/create-from-ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vaultStrategyId,
              prompt,
              strategy: aiStrategy,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to save strategy metadata.");
          }

          toast({
            title: "Strategy deployed",
            description: "Strategy deployed successfully.",
            variant: "success",
          });
          router.push(`/dashboard/strategies/${vaultStrategyId}`);
        }
      }
    } catch {
      toast({
        description:
          "Failed to deploy strategy. Check your wallet and try again.",
        variant: "error",
      });
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8">
        <div className="mb-4 sm:mb-8 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:justify-between">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-[28px] sm:text-[32px] lg:text-4xl font-semibold text-[#1A1A1A]">
              Create New Strategy
            </h1>
            <p className="mt-3 sm:mt-4 text-[14px] sm:text-[16px] text-[#4A6B6E]">
              Describe the strategy you want. Fluid Yield will turn it into
              executable steps on flare.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="rounded-full border border-accent/30 text-white bg-accent px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 text-xs sm:text-sm font-semibold  transition hover:text-accent-foreground hover:bg-accent/10 cursor-pointer w-full sm:w-auto"
            disabled
          >
            Save Draft (coming soon)
          </Button>
        </div>

        <div className="mb-8 sm:mb-12 overflow-x-auto">
          <ProgressSteps
            steps={STEPS}
            currentIndex={hasStrategy ? 2 : prompt ? 1 : 0}
          />
        </div>

        <section className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-[0_24px_48px_rgba(6,24,26,0.45)] backdrop-blur-sm">
          <h2 className="mb-6 sm:mb-8 text-xs sm:text-sm text-center font-semibold uppercase tracking-[0.18em] text-[#1A1A1A]">
            Tell Fluid Yield what you want to build
          </h2>

          <label className="flex flex-col gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-[#4A6B6E]">
              Strategy Idea (prompt)
            </span>
            <textarea
              rows={5}
              className="rounded-xl sm:rounded-2xl border border-[#EDFCFE0F] bg-[#EDFCFE0F] px-4 sm:px-5 py-3 sm:py-4 text-[14px] sm:text-[15px] text-[#1A1A1A] placeholder:text-[#6B8A8D] focus:border-[#1FE9F7] focus:outline-none focus:ring-0 resize-none"
              placeholder="E.g. A medium-risk looping strategy using WBNB as input, swapping into USDT then supplying to Venus, with auto-withdraw to BUSD when markets are volatile."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>

          <div className="mt-6 sm:mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] sm:text-[13px] text-[#4A6B6E]">
              {generating ? (
                <span>
                  Computing contract inputs and strategy steps for flare
                </span>
              ) : (
                <span>
                  Fluid Yield will infer tokens, Venus markets, and steps based
                  on your description.
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="default"
              className="text-xs sm:text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 text-center cursor-pointer w-full sm:w-auto"
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
            >
              {generating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>

          {aiStrategy && (
            <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 md:grid-cols-[1.4fr_minmax(0,1fr)] items-start">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#4A6B6E]">
                  AI Strategy Preview
                </p>
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1A1A1A]">
                  {aiStrategy.name}
                </h3>
                <p className="text-[13px] sm:text-[14px] leading-6 text-[#2A2A2A]">
                  {aiStrategy.summary}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 rounded-2xl border border-[#EDFCFE0F] bg-[#070B0B] px-4 sm:px-5 py-4 sm:py-5">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#B8D4D7]">
                  Deployment Details
                </p>
                <div className="space-y-1 text-[13px] sm:text-[14px] text-[#E7FDFF]">
                  <p>
                    <span className="text-[#B8D4D7]">Input Token:</span>{" "}
                    {aiStrategy.inputToken}
                  </p>
                  <p>
                    <span className="text-[#B8D4D7]">Risk:</span>{" "}
                    {aiStrategy.riskLevel}
                  </p>
                  <p>
                    <span className="text-[#B8D4D7]">Steps:</span>{" "}
                    {aiStrategy.steps.length}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="default"
                  className="mt-2 text-xs sm:text-sm font-medium text-[#090909] bg-[#1FE9F7] hover:bg-[#1FE9F7]/80 rounded-lg px-6 sm:px-10 py-3 sm:py-4 text-center cursor-pointer w-full"
                  onClick={handleDeploy}
                  disabled={deploying || isPending}
                >
                  {deploying || isPending
                    ? "Deploying to flare..."
                    : "Deploy Strategy"}
                </Button>
              </div>

              <div className="md:col-span-2 mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#4A6B6E] mb-2">
                  Execution Steps
                </p>
                <ol className="space-y-1 text-[13px] sm:text-[14px] text-[#1A1A1A]">
                  {aiStrategy.steps.map((step, index) => (
                    <li key={index}>
                      <span className="text-[#4A6B6E] mr-2">{index + 1}.</span>
                      <span className="uppercase text-[11px] tracking-[0.16em] text-[#0A9BA0] mr-2">
                        {step.action}
                      </span>
                      {step.label ?? "Generated step"}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
