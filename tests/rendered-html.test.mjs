import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("builds the Angular Subscription Launchpad shell", async () => {
  const [html, appTemplate, builderTemplate, styles, packageJson] =
    await Promise.all([
      readFile(new URL("../dist/client/index.html", import.meta.url), "utf8"),
      readFile(new URL("../src/app/app.html", import.meta.url), "utf8"),
      readFile(
        new URL("../src/app/components/plan-builder.component.html", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../src/styles.css", import.meta.url), "utf8"),
      readFile(new URL("../package.json", import.meta.url), "utf8"),
    ]);

  assert.match(html, /<title>Subscription Launchpad<\/title>/i);
  assert.match(html, /<app-root><\/app-root>/i);
  assert.match(appTemplate, /Build a subscription customers can trust/);
  assert.match(builderTemplate, /aria-label="Setup progress"/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(packageJson, /"@angular\/core"/);
  assert.doesNotMatch(packageJson, /"react"|"vinext"/);
});

test("serves the subscription analysis API from the worker", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: "Coffee Club",
        startDate: "2026-09-01",
        priceCents: 4500,
        discountPercent: 15,
        billingEveryWeeks: 2,
        deliveryEveryWeeks: 2,
        freeShippingThresholdCents: 4000,
        activeSubscribers: 24,
        unitsPerDelivery: 1,
        inventoryUnits: 180,
      }),
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
  );

  assert.equal(response.status, 200);
  const analysis = await response.json();
  assert.equal(analysis.readyToLaunch, true);
  assert.equal(analysis.schedule.length, 14);
});

test("explains when MongoDB plan storage is not connected", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("storage-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/plans"),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 })
      }
    }
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    message: "Plan storage is not connected yet."
  });
});
