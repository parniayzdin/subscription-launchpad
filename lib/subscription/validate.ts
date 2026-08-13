import type { SubscriptionPlan, ValidationIssue } from "./types";

const DAYS_PER_WEEK = 7;

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function calculateDiscountedPriceCents(plan: SubscriptionPlan) {
  const multiplier = 1 - plan.discountPercent / 100;
  return Math.round(plan.priceCents * multiplier);
}

export function countDeliveries(plan: SubscriptionPlan, horizonDays = 90) {
  if (plan.deliveryEveryWeeks <= 0) return 0;
  const intervalDays = plan.deliveryEveryWeeks * DAYS_PER_WEEK;
  return Math.floor((horizonDays - 1) / intervalDays) + 1;
}

export function validatePlan(
  plan: SubscriptionPlan,
  horizonDays = 90,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const discountedPrice = calculateDiscountedPriceCents(plan);

  if (
    plan.priceCents <= 0 ||
    plan.discountPercent < 0 ||
    plan.discountPercent >= 100 ||
    discountedPrice <= 0
  ) {
    issues.push({
      id: "price",
      severity: "error",
      title: "The subscription price is not valid",
      message: "The discount must leave a positive amount to charge.",
      suggestion: "Use a discount below 100% and confirm the product price.",
    });
  }

  if (
    plan.freeShippingThresholdCents > 0 &&
    plan.priceCents >= plan.freeShippingThresholdCents &&
    discountedPrice < plan.freeShippingThresholdCents
  ) {
    issues.push({
      id: "shipping",
      severity: "warning",
      title: "The discount removes free shipping",
      message: `The regular price qualifies, but the subscription price becomes ${formatMoney(discountedPrice)}. This is below the ${formatMoney(plan.freeShippingThresholdCents)} threshold.`,
      suggestion:
        "Lower the free shipping threshold or clearly show subscribers the shipping charge.",
    });
  }

  if (plan.billingEveryWeeks !== plan.deliveryEveryWeeks) {
    issues.push({
      id: "cadence",
      severity: "warning",
      title: "Billing and delivery use different schedules",
      message: `Customers are billed every ${plan.billingEveryWeeks} weeks and receive a delivery every ${plan.deliveryEveryWeeks} weeks.`,
      suggestion:
        "Confirm that the different schedules are intentional before launch.",
    });
  }

  const projectedUnits =
    countDeliveries(plan, horizonDays) *
    plan.activeSubscribers *
    plan.unitsPerDelivery;

  if (projectedUnits > plan.inventoryUnits) {
    issues.push({
      id: "inventory",
      severity: "error",
      title: "Inventory will not cover the preview period",
      message: `The plan needs ${projectedUnits} units over ${horizonDays} days, but only ${plan.inventoryUnits} are available.`,
      suggestion:
        "Add inventory, reduce the initial subscriber count, or use a longer delivery interval.",
    });
  }

  return issues;
}
