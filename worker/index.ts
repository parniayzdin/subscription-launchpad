import { analyzeRequest } from "../lib/subscription/request";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
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

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/analyze") {
      if (request.method !== "POST") {
        return json({ message: "Use POST to analyze a subscription plan." }, 405);
      }
      return analyze(request);
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
