import { build } from "esbuild";

const workerRequireShim = `
import * as nodeBuffer from "node:buffer";
import * as nodeChildProcess from "node:child_process";
import * as nodeCrypto from "node:crypto";
import * as nodeDns from "node:dns";
import * as nodeEvents from "node:events";
import * as nodeFs from "node:fs";
import * as nodeFsPromises from "node:fs/promises";
import * as nodeHttp from "node:http";
import * as nodeNet from "node:net";
import * as nodeOs from "node:os";
import * as nodeProcess from "node:process";
import * as nodeStream from "node:stream";
import * as nodeTimers from "node:timers";
import * as nodeTimersPromises from "node:timers/promises";
import * as nodeTls from "node:tls";
import * as nodeUrl from "node:url";
import * as nodeUtil from "node:util";
import * as nodeZlib from "node:zlib";

const workerNodeModules = {
  buffer: nodeBuffer,
  child_process: nodeChildProcess,
  crypto: nodeCrypto,
  dns: nodeDns,
  events: nodeEvents,
  fs: nodeFs,
  "fs/promises": nodeFsPromises,
  http: nodeHttp,
  net: nodeNet,
  os: nodeOs,
  process: nodeProcess,
  stream: nodeStream,
  timers: nodeTimers,
  "timers/promises": nodeTimersPromises,
  tls: nodeTls,
  url: nodeUrl,
  util: nodeUtil,
  zlib: nodeZlib
};

const require = (name) => {
  const loaded = workerNodeModules[name];
  if (!loaded) throw new Error(\`Optional module not installed: \${name}\`);
  return loaded;
};
`;

await build({
  entryPoints: ["worker/index.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node22",
  outfile: "dist/server/index.js",
  banner: {
    js: workerRequireShim
  }
});
