import { listPlans, savePlan, type MongoSettings } from "../lib/plans/mongodb.js";
import { analyzeRequest, parsePlan } from "../lib/subscription/request.js";

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function mongoSettings(): MongoSettings {
  if (!process.env["MONGODB_URI"]) {
    throw new Error("Plan storage is not connected yet.");
  }

  return {
    uri: process.env["MONGODB_URI"],
    databaseName: process.env["MONGODB_DATABASE"] || "subscription_launchpad"
  };
}

const handler = {
  async fetch(request: Request): Promise<Response> {
    try {
      if (request.method === "GET") {
        return json({ plans: await listPlans(mongoSettings()) });
      }

      if (request.method === "POST") {
        const plan = parsePlan(await request.json());
        const analysis = analyzeRequest(plan);
        return json(await savePlan(mongoSettings(), plan, analysis), 201);
      }

      return json({ message: "Use GET or POST for saved plans." }, 405);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The plan could not be saved.";
      const status = message === "Plan storage is not connected yet." ? 503 : 400;
      return json({ message }, status);
    }
  }
};

export default handler;
