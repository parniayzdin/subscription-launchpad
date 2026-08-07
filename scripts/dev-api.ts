import { createServer, type IncomingMessage } from "node:http";
import { loadEnvFile } from "node:process";
import { analyzeRequest, parsePlan } from "../lib/subscription/request";
import { listPlans, savePlan, type MongoSettings } from "../lib/plans/mongodb";

const port = 8787;

try {
  loadEnvFile();
} catch {
  // MongoDB is optional until a local .env file is created.
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

function readBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body) as unknown);
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  if (request.url === "/api/plans") {
    try {
      if (request.method === "GET") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ plans: await listPlans(mongoSettings()) }));
        return;
      }

      if (request.method === "POST") {
        const plan = parsePlan(await readBody(request));
        const saved = await savePlan(mongoSettings(), plan, analyzeRequest(plan));
        response.writeHead(201, { "Content-Type": "application/json" });
        response.end(JSON.stringify(saved));
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The plan could not be saved.";
      response.writeHead(message === "Plan storage is not connected yet." ? 503 : 400, {
        "Content-Type": "application/json"
      });
      response.end(JSON.stringify({ message }));
      return;
    }
  }

  if (request.method !== "POST" || request.url !== "/api/analyze") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "API route not found." }));
    return;
  }

  try {
    const result = analyzeRequest(await readBody(request));
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The plan could not be checked.";
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message }));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Subscription analysis API listening on http://127.0.0.1:${port}`);
});
