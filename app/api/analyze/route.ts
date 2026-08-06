import { analyzePlan } from "@/lib/subscription/schedule";
import type { SubscriptionPlan } from "@/lib/subscription/types";

const textFields: Array<keyof SubscriptionPlan> = ["productName", "startDate"];
const numberFields: Array<keyof SubscriptionPlan> = [
  "priceCents",
  "discountPercent",
  "billingEveryWeeks",
  "deliveryEveryWeeks",
  "freeShippingThresholdCents",
  "activeSubscribers",
  "unitsPerDelivery",
  "inventoryUnits",
];

function parsePlan(value: unknown): SubscriptionPlan {
  if (!value || typeof value !== "object") {
    throw new Error("Add the subscription details before running the preview.");
  }

  const plan = value as Record<string, unknown>;

  for (const field of textFields) {
    if (typeof plan[field] !== "string" || !plan[field].trim()) {
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

export async function POST(request: Request) {
  try {
    const plan = parsePlan(await request.json());
    return Response.json(analyzePlan(plan));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The plan could not be checked.";

    return Response.json({ message }, { status: 400 });
  }
}
