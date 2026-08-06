import type {
  PlanAnalysis,
  ScheduleEvent,
  ScheduleEventType,
  SubscriptionPlan,
} from "./types";
import {
  calculateDiscountedPriceCents,
  validatePlan,
} from "./validate";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseStartDate(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("The subscription start date is not valid.");
  }
  return parsed;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createEvents(
  plan: SubscriptionPlan,
  type: ScheduleEventType,
  intervalWeeks: number,
  horizonDays: number,
): ScheduleEvent[] {
  if (intervalWeeks <= 0) return [];

  const start = parseStartDate(plan.startDate);
  const endTime = start.getTime() + (horizonDays - 1) * DAY_IN_MS;
  const intervalMs = intervalWeeks * 7 * DAY_IN_MS;
  const events: ScheduleEvent[] = [];

  for (let time = start.getTime(); time <= endTime; time += intervalMs) {
    events.push({
      date: toDateString(new Date(time)),
      type,
      ...(type === "billing"
        ? {
            amountCents:
              calculateDiscountedPriceCents(plan) * plan.activeSubscribers,
          }
        : { units: plan.unitsPerDelivery * plan.activeSubscribers }),
    });
  }

  return events;
}

export function buildSchedule(plan: SubscriptionPlan, horizonDays = 90) {
  const schedule = [
    ...createEvents(
      plan,
      "billing",
      plan.billingEveryWeeks,
      horizonDays,
    ),
    ...createEvents(
      plan,
      "delivery",
      plan.deliveryEveryWeeks,
      horizonDays,
    ),
  ];

  return schedule.sort((left, right) => {
    const byDate = left.date.localeCompare(right.date);
    if (byDate !== 0) return byDate;
    return left.type === "billing" ? -1 : 1;
  });
}

export function analyzePlan(
  plan: SubscriptionPlan,
  horizonDays = 90,
): PlanAnalysis {
  const schedule = buildSchedule(plan, horizonDays);
  const discountedPriceCents = calculateDiscountedPriceCents(plan);
  const billingCount = schedule.filter(
    (event) => event.type === "billing",
  ).length;
  const deliveryCount = schedule.filter(
    (event) => event.type === "delivery",
  ).length;
  const projectedRevenueCents =
    billingCount * discountedPriceCents * plan.activeSubscribers;
  const projectedUnits =
    deliveryCount * plan.unitsPerDelivery * plan.activeSubscribers;
  const issues = validatePlan(plan, horizonDays);

  return {
    discountedPriceCents,
    projectedRevenueCents,
    projectedUnits,
    issues,
    schedule,
    readyToLaunch: !issues.some((issue) => issue.severity === "error"),
  };
}
