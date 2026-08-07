import { analyzeRequest, parsePlan } from "../lib/subscription/request";
import { listPlans, savePlan, type MongoSettings } from "../lib/plans/mongodb";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  MONGODB_URI?: string;
  MONGODB_DATABASE?: string;
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

async function analyze(request: Request): Promise<Response> {
  try {
    return json(analyzeRequest(await request.json()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The plan could not be checked.";
    return json({ message }, 400);
  }
}

function mongoSettings(env: Env): MongoSettings {
  if (!env.MONGODB_URI) {
    throw new Error("Plan storage is not connected yet.");
  }

  return {
    uri: env.MONGODB_URI,
    databaseName: env.MONGODB_DATABASE || "subscription_launchpad"
  };
}

async function handlePlans(request: Request, env: Env): Promise<Response> {
  try {
    const settings = mongoSettings(env);

    if (request.method === "GET") {
      return json({ plans: await listPlans(settings) });
    }

    if (request.method === "POST") {
      const plan = parsePlan(await request.json());
      const analysis = analyzeRequest(plan);
      return json(await savePlan(settings, plan, analysis), 201);
    }

    return json({ message: "Use GET or POST for saved plans." }, 405);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The plan could not be saved.";
    const status = message === "Plan storage is not connected yet." ? 503 : 400;
    return json({ message }, status);
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/analyze") {
      if (request.method !== "POST") {
        return json({ message: "Use POST to analyze a subscription plan." }, 405);
      }
      return analyze(request);
    }

    if (url.pathname === "/api/plans") {
      return handlePlans(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ message: "API route not found." }, 404);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (acceptsHtml) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }

    return assetResponse;
  }
};

export default worker;
