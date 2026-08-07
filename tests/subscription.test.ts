import assert from "node:assert/strict";
import test from "node:test";
import { serializeSavedPlan } from "../lib/plans/types";
import { analyzePlan, buildSchedule } from "../lib/subscription/schedule";
import { analyzeRequest, parsePlan } from "../lib/subscription/request";
import { samplePlan } from "../lib/subscription/types";
import {
  calculateDiscountedPriceCents,
  validatePlan,
} from "../lib/subscription/validate";

test("calculates the subscriber price after the discount", () => {
  assert.equal(calculateDiscountedPriceCents(samplePlan), 3825);
});

test("finds when a discount removes free shipping", () => {
  const issues = validatePlan(samplePlan);
  assert.ok(issues.some((issue) => issue.id === "shipping"));
});

test("warns when billing and delivery schedules differ", () => {
  const issues = validatePlan({
    ...samplePlan,
    billingEveryWeeks: 2,
    deliveryEveryWeeks: 4,
  });

  assert.ok(issues.some((issue) => issue.id === "cadence"));
});

test("detects inventory that cannot cover the preview", () => {
  const issues = validatePlan({ ...samplePlan, inventoryUnits: 100 });
  const inventoryIssue = issues.find((issue) => issue.id === "inventory");

  assert.equal(inventoryIssue?.severity, "error");
});

test("builds billing and delivery events for 90 days", () => {
  const schedule = buildSchedule(samplePlan);

  assert.equal(
    schedule.filter((event) => event.type === "billing").length,
    7,
  );
  assert.equal(
    schedule.filter((event) => event.type === "delivery").length,
    7,
  );
});

test("allows warnings while blocking plans with errors", () => {
  assert.equal(analyzePlan(samplePlan).readyToLaunch, true);
  assert.equal(
    analyzePlan({ ...samplePlan, inventoryUnits: 100 }).readyToLaunch,
    false,
  );
});

test("parses an API-ready subscription plan", () => {
  assert.deepEqual(parsePlan(samplePlan), samplePlan);
});

test("rejects incomplete API input", () => {
  assert.throws(
    () => analyzeRequest({ productName: "Coffee" }),
    /startDate field is required/,
  );
});

test("serializes a saved subscription plan for the API", () => {
  const analysis = analyzePlan(samplePlan);
  const saved = serializeSavedPlan({
    _id: { toString: () => "plan-123" },
    plan: samplePlan,
    analysis,
    savedAt: new Date("2026-08-06T12:00:00.000Z")
  });

  assert.equal(saved.id, "plan-123");
  assert.equal(saved.plan.productName, samplePlan.productName);
  assert.equal(saved.savedAt, "2026-08-06T12:00:00.000Z");
});
