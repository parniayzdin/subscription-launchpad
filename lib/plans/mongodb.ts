import type { Collection } from "mongodb";
import type { PlanAnalysis, SubscriptionPlan } from "../subscription/types";
import { serializeSavedPlan, type SavedPlan } from "./types";

export interface MongoSettings {
  uri: string;
  databaseName: string;
}

interface PlanDocument {
  plan: SubscriptionPlan;
  analysis: PlanAnalysis;
  savedAt: Date;
}

async function useCollection<T>(
  settings: MongoSettings,
  operation: (collection: Collection<PlanDocument>) => Promise<T>
): Promise<T> {
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(settings.uri);

  try {
    await client.connect();
    return await operation(
      client.db(settings.databaseName).collection<PlanDocument>("subscription_plans")
    );
  } finally {
    await client.close();
  }
}

export async function savePlan(
  settings: MongoSettings,
  plan: SubscriptionPlan,
  analysis: PlanAnalysis
): Promise<SavedPlan> {
  return useCollection(settings, async (collection) => {
    const savedAt = new Date();
    const result = await collection.insertOne({ plan, analysis, savedAt });

    return serializeSavedPlan({
      _id: result.insertedId,
      plan,
      analysis,
      savedAt
    });
  });
}

export async function listPlans(settings: MongoSettings): Promise<SavedPlan[]> {
  return useCollection(settings, async (collection) => {
    const documents = await collection.find().sort({ savedAt: -1 }).limit(8).toArray();
    return documents.map(serializeSavedPlan);
  });
}
