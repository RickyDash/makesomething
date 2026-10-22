import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// No patched braces release exists as of 2026-10-22. Only the dev-only
// ESLint path is accepted; see SECURITY.md. Any new advisory still fails.
const reviewedAdvisory = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
const serious = new Set(["high", "critical"]);

export function blockingFindings(report, lockfile) {
  if (report.error || !report.vulnerabilities || !report.metadata) {
    throw new Error("The dependency audit did not return a complete report.");
  }
  const vulnerabilities = report.vulnerabilities;
  const reviewed = (name, seen = new Set()) => {
    if (seen.has(name)) return false;
    const item = vulnerabilities[name];
    if (!item || !Array.isArray(item.via) || item.via.length === 0) return false;
    const nextSeen = new Set([...seen, name]);
    return item.via.every((cause) => {
      if (typeof cause === "string") return reviewed(cause, nextSeen);
      if (!serious.has(cause.severity)) return true;
      return (
        name === "braces" &&
        cause.url === reviewedAdvisory &&
        item.nodes?.length > 0 &&
        item.nodes.every((node) => lockfile.packages?.[node]?.dev === true)
      );
    });
  };
  return Object.entries(vulnerabilities)
    .filter(([name, item]) => serious.has(item.severity) && !reviewed(name))
    .map(([name]) => name);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = spawnSync("npm", ["audit", "--json"], { encoding: "utf8" });
  if (result.error || (result.status !== 0 && result.status !== 1)) {
    throw new Error("npm audit could not complete.");
  }
  const report = JSON.parse(result.stdout);
  const lockfile = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const blocked = blockingFindings(report, lockfile);
  if (blocked.length) {
    console.error(`Unreviewed high/critical vulnerabilities: ${blocked.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log("Dependency audit passed; only the documented dev-only braces advisory is excepted when present.");
  }
}
