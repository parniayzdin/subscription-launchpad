"use client";

import { useState } from "react";
import type { SubscriptionPlan } from "@/lib/subscription/types";

interface PlanBuilderProps {
  plan: SubscriptionPlan;
  loading: boolean;
  onChange: (plan: SubscriptionPlan) => void;
  onAnalyze: () => Promise<void>;
}

const steps = ["Offer", "Schedule", "Readiness"];

export function PlanBuilder({
  plan,
  loading,
  onChange,
  onAnalyze,
}: PlanBuilderProps) {
  const [step, setStep] = useState(0);

  function update<Key extends keyof SubscriptionPlan>(
    field: Key,
    value: SubscriptionPlan[Key],
  ) {
    onChange({ ...plan, [field]: value });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    void onAnalyze();
  }

  return (
    <section className="builder-card">
      <div className="stepper" aria-label="Setup progress">
        {steps.map((label, index) => (
          <button
            className={
              index === step
                ? "step active"
                : index < step
                  ? "step complete"
                  : "step"
            }
            type="button"
            key={label}
            onClick={() => setStep(index)}
            aria-current={index === step ? "step" : undefined}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit}>
        {step === 0 ? (
          <fieldset>
            <legend>Create the offer</legend>
            <p className="field-intro">
              Start with what subscribers will buy and pay.
            </p>

            <label className="field full">
              <span>Product name</span>
              <input
                value={plan.productName}
                onChange={(event) => update("productName", event.target.value)}
                required
              />
            </label>

            <div className="field-grid">
              <label className="field">
                <span>Regular price</span>
                <div className="input-prefix">
                  <b>$</b>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={(plan.priceCents / 100).toFixed(2)}
                    onChange={(event) =>
                      update(
                        "priceCents",
                        Math.round(Number(event.target.value) * 100),
                      )
                    }
                    required
                  />
                </div>
              </label>
              <label className="field">
                <span>Subscriber discount</span>
                <div className="input-suffix">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={plan.discountPercent}
                    onChange={(event) =>
                      update("discountPercent", Number(event.target.value))
                    }
                    required
                  />
                  <b>%</b>
                </div>
              </label>
            </div>

            <label className="field full">
              <span>First billing date</span>
              <input
                type="date"
                value={plan.startDate}
                onChange={(event) => update("startDate", event.target.value)}
                required
              />
            </label>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset>
            <legend>Choose the schedule</legend>
            <p className="field-intro">
              Set how often customers pay and receive the product.
            </p>

            <div className="field-grid">
              <label className="field">
                <span>Bill customers</span>
                <select
                  value={plan.billingEveryWeeks}
                  onChange={(event) =>
                    update("billingEveryWeeks", Number(event.target.value))
                  }
                >
                  <option value="1">Every week</option>
                  <option value="2">Every 2 weeks</option>
                  <option value="4">Every 4 weeks</option>
                </select>
              </label>
              <label className="field">
                <span>Deliver products</span>
                <select
                  value={plan.deliveryEveryWeeks}
                  onChange={(event) =>
                    update("deliveryEveryWeeks", Number(event.target.value))
                  }
                >
                  <option value="1">Every week</option>
                  <option value="2">Every 2 weeks</option>
                  <option value="4">Every 4 weeks</option>
                </select>
              </label>
            </div>

            <label className="field full">
              <span>Free-shipping minimum</span>
              <div className="input-prefix">
                <b>$</b>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={(plan.freeShippingThresholdCents / 100).toFixed(2)}
                  onChange={(event) =>
                    update(
                      "freeShippingThresholdCents",
                      Math.round(Number(event.target.value) * 100),
                    )
                  }
                />
              </div>
            </label>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset>
            <legend>Check launch readiness</legend>
            <p className="field-intro">
              Estimate whether inventory can support the first 90 days.
            </p>

            <div className="field-grid">
              <label className="field">
                <span>Starting subscribers</span>
                <input
                  type="number"
                  min="1"
                  value={plan.activeSubscribers}
                  onChange={(event) =>
                    update("activeSubscribers", Number(event.target.value))
                  }
                />
              </label>
              <label className="field">
                <span>Units per delivery</span>
                <input
                  type="number"
                  min="1"
                  value={plan.unitsPerDelivery}
                  onChange={(event) =>
                    update("unitsPerDelivery", Number(event.target.value))
                  }
                />
              </label>
            </div>

            <label className="field full">
              <span>Available inventory</span>
              <input
                type="number"
                min="0"
                value={plan.inventoryUnits}
                onChange={(event) =>
                  update("inventoryUnits", Number(event.target.value))
                }
              />
            </label>
          </fieldset>
        ) : null}

        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            Back
          </button>
          <button className="primary-button" type="submit" disabled={loading}>
            {step === steps.length - 1
              ? loading
                ? "Checking plan…"
                : "Run launch check"
              : "Continue"}
          </button>
        </div>
      </form>
    </section>
  );
}
