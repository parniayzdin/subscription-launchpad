import { copyFile, mkdir, writeFile } from "node:fs/promises";

await mkdir("dist/.openai", { recursive: true });
await mkdir("dist/server", { recursive: true });
await copyFile(".openai/hosting.json", "dist/.openai/hosting.json");

await writeFile(
  "dist/server/wrangler.json",
  JSON.stringify(
    {
      main: "index.js",
      compatibility_date: "2026-08-06",
      assets: {
        directory: "../client",
        binding: "ASSETS",
        not_found_handling: "single-page-application"
      }
    },
    null,
    2
  )
);
