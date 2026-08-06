import { createServer } from "node:http";
import { analyzeRequest } from "../lib/subscription/request";

const port = 8787;

const server = createServer((request, response) => {
  if (request.method !== "POST" || request.url !== "/api/analyze") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "API route not found." }));
    return;
  }

  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk: string) => {
    body += chunk;
  });
  request.on("end", () => {
    try {
      const result = analyzeRequest(JSON.parse(body) as unknown);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : "The plan could not be checked.";
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message }));
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Subscription analysis API listening on http://127.0.0.1:${port}`);
});
