export type IssueSeverity = "warning" | "error";

export type ScheduleEventType = "billing" | "delivery";

export interface SubscriptionPlan {
  productName: string;
  startDate: string;
  priceCents: number;
  discountPercent: number;
  billingEveryWeeks: number;
  deliveryEveryWeeks: number;
  freeShippingThresholdCents: number;
  activeSubscribers: number;
  unitsPerDelivery: number;
  inventoryUnits: number;
}

export interface ValidationIssue {
  id: "price" | "shipping" | "cadence" | "inventory";
  severity: IssueSeverity;
  title: string;
  message: string;
  suggestion: string;
}

export interface ScheduleEvent {
  date: string;
  type: ScheduleEventType;
  amountCents?: number;
  units?: number;
}

export interface PlanAnalysis {
  discountedPriceCents: number;
  projectedRevenueCents: number;
  projectedUnits: number;
  issues: ValidationIssue[];
  schedule: ScheduleEvent[];
  readyToLaunch: boolean;
}

export const samplePlan: SubscriptionPlan = {
  productName: "Roaster's Choice Coffee",
  startDate: "2026-09-01",
  priceCents: 4500,
  discountPercent: 15,
  billingEveryWeeks: 2,
  deliveryEveryWeeks: 2,
  freeShippingThresholdCents: 4000,
  activeSubscribers: 24,
  unitsPerDelivery: 1,
  inventoryUnits: 180,
};
