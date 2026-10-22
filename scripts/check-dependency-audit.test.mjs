import { test } from "node:test";
import assert from "node:assert/strict";
import { blockingFindings } from "./check-dependency-audit.mjs";

const report = (url = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm") => ({
  metadata: {},
  vulnerabilities: {
    braces: { severity: "high", via: [{ severity: "high", url }], nodes: ["node_modules/braces"] },
    micromatch: { severity: "high", via: ["braces"] },
  },
});
const devLock = { packages: { "node_modules/braces": { dev: true } } };
test("allows only the reviewed development dependency chain", () => {
  assert.deepEqual(blockingFindings(report(), devLock), []);
});
test("blocks the same advisory in production dependencies", () => {
  assert.deepEqual(blockingFindings(report(), { packages: {} }), ["braces", "micromatch"]);
});
test("blocks a new advisory in the same package", () => {
  assert.deepEqual(blockingFindings(report("https://example.test/new-advisory"), devLock), ["braces", "micromatch"]);
});
test("fails closed on incomplete audit data", () => {
  assert.throws(() => blockingFindings({ error: "offline" }, devLock));
  assert.deepEqual(blockingFindings({ metadata: {}, vulnerabilities: { unknown: { severity: "critical", via: [] } } }, devLock), ["unknown"]);
});
