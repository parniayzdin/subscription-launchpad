import { analyzePlan } from "./schedule.js";
import type { PlanAnalysis, SubscriptionPlan } from "./types.js";

const textFields: Array<keyof SubscriptionPlan> = ["productName", "startDate"];
const numberFields: Array<keyof SubscriptionPlan> = [
  "priceCents",
  "discountPercent",
  "billingEveryWeeks",
  "deliveryEveryWeeks",
  "freeShippingThresholdCents",
  "activeSubscribers",
  "unitsPerDelivery",
  "inventoryUnits"
];

export function parsePlan(value: unknown): SubscriptionPlan {
  if (!value || typeof value !== "object") {
    throw new Error("Add the subscription details before running the preview.");
  }

  const plan = value as Record<string, unknown>;

  for (const field of textFields) {
    if (typeof plan[field] !== "string" || !(plan[field] as string).trim()) {
      throw new Error(`The ${field} field is required.`);
    }
  }

  for (const field of numberFields) {
    if (typeof plan[field] !== "number" || !Number.isFinite(plan[field])) {
      throw new Error(`The ${field} field must be a number.`);
    }
  }

  return plan as unknown as SubscriptionPlan;
}

export function analyzeRequest(value: unknown): PlanAnalysis {
  return analyzePlan(parsePlan(value));
}
