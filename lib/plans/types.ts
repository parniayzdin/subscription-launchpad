import type { PlanAnalysis, SubscriptionPlan } from "../subscription/types";

export interface SavedPlan {
  id: string;
  plan: SubscriptionPlan;
  analysis: PlanAnalysis;
  savedAt: string;
}

export interface StoredPlanDocument {
  _id: { toString(): string };
  plan: SubscriptionPlan;
  analysis: PlanAnalysis;
  savedAt: Date;
}

export function serializeSavedPlan(document: StoredPlanDocument): SavedPlan {
  return {
    id: document._id.toString(),
    plan: document.plan,
    analysis: document.analysis,
    savedAt: document.savedAt.toISOString()
  };
}
