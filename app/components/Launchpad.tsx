"use client";

import { useState } from "react";
import type {
  PlanAnalysis,
  SubscriptionPlan,
} from "@/lib/subscription/types";
import { samplePlan } from "@/lib/subscription/types";
import { PlanBuilder } from "./PlanBuilder";
import { ResultsPanel } from "./ResultsPanel";

export function Launchpad() {
  const [plan, setPlan] = useState<SubscriptionPlan>(samplePlan);
  const [analysis, setAnalysis] = useState<PlanAnalysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const result = (await response.json()) as
        | PlanAnalysis
        | { message: string };

      if (!response.ok || "message" in result) {
        throw new Error(
          "message" in result
            ? result.message
            : "The preview could not be created.",
        );
      }

      setAnalysis(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The preview could not be created.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-shell">
      <a className="skip-link" href="#workspace">
        Skip to plan builder
      </a>
      <header className="topbar">
        <a
          className="brand"
          href="#top"
          aria-label="Subscription Launchpad home"
        >
          <span className="brand-mark" aria-hidden="true">
            SL
          </span>
          <span>Subscription Launchpad</span>
        </a>
        <span className="demo-pill">Interactive demo</span>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">Plan with confidence</p>
          <h1>Build a subscription customers can trust.</h1>
          <p className="hero-copy">
            Set up the offer, preview the next 90 days, and catch pricing,
            shipping, schedule, or inventory problems before launch.
          </p>
        </div>
        <div className="hero-note" aria-label="Launchpad workflow">
          <span>Configure</span>
          <i aria-hidden="true" />
          <span>Preview</span>
          <i aria-hidden="true" />
          <span>Validate</span>
        </div>
      </section>

      <section
        className="workspace"
        id="workspace"
        aria-label="Subscription plan workspace"
      >
        <PlanBuilder
          plan={plan}
          loading={loading}
          onChange={(nextPlan) => {
            setPlan(nextPlan);
            setAnalysis(null);
          }}
          onAnalyze={runAnalysis}
        />

        <ResultsPanel
          analysis={analysis}
          productName={plan.productName}
          error={error}
        />
      </section>
    </main>
  );
}
