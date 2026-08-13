import assert from "node:assert/strict";
import test from "node:test";
import analyzeHandler from "../api/analyze";
import plansHandler from "../api/plans";
import { samplePlan } from "../lib/subscription/types";

test("serves subscription analysis through the Vercel API", async () => {
  const response = await analyzeHandler.fetch(
    new Request("https://subscriptionlaunchpad.vercel.app/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(samplePlan)
    })
  );

  assert.equal(response.status, 200);
  const analysis = await response.json();
  assert.equal(analysis.readyToLaunch, true);
  assert.equal(analysis.schedule.length, 14);
});

test("explains when Vercel plan storage is not connected", async () => {
  const originalUri = process.env["MONGODB_URI"];
  delete process.env["MONGODB_URI"];

  try {
    const response = await plansHandler.fetch(
      new Request("https://subscriptionlaunchpad.vercel.app/api/plans")
    );

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      message: "Plan storage is not connected yet."
    });
  } finally {
    if (originalUri) {
      process.env["MONGODB_URI"] = originalUri;
    }
  }
});
