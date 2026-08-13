import { analyzeRequest } from "../lib/subscription/request";

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

const handler = {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return json({ message: "Use POST to analyze a subscription plan." }, 405);
    }

    try {
      return json(analyzeRequest(await request.json()));
    } catch (error) {
      const message = error instanceof Error ? error.message : "The plan could not be checked.";
      return json({ message }, 400);
    }
  }
};

export default handler;
