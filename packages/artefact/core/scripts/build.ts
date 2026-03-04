import { $ } from "bun";
import { execSync } from "node:child_process";

const version = await $`git describe --tags --always`.text();
const target = "SQLite";
const buildTime = new Date().toISOString();
const gitCommit = await $`git rev-parse HEAD`.text();

await Bun.build({
  entrypoints: ["./src/data/schemas/index.ts"],
  outdir: "./out/schemas",
  define: {
    BUILD_VERSION: JSON.stringify(version.trim()),
    BUILD_TARGET: JSON.stringify(target),
    BUILD_TIME: JSON.stringify(buildTime),
    GIT_COMMIT: JSON.stringify(gitCommit.trim()),
  },
  target: "node",
  format: "esm",
});

const schemaFilePath = "./out/schemas/index.js";
const generateSql = await $`BUILD_TARGET=SQLite drizzle-kit generate --dialect sqlite --schema ${schemaFilePath}`;

if (generateSql.exitCode !== 0) {
  console.error("Error generating SQL:", generateSql.stderr);
  process.exit(1);
}

await Bun.build({
  entrypoints: ["./src/main.ts"],
  outdir: "./dist",
  define: {
    BUILD_VERSION: JSON.stringify(version.trim()),
    BUILD_TARGET: JSON.stringify(target),
    BUILD_TIME: JSON.stringify(buildTime),
    GIT_COMMIT: JSON.stringify(gitCommit.trim()),
  },
  target: "node",
  format: "esm",
});

await Bun.build({
	entrypoints: ["../../artefact/schemascript/index.ts"],
	outdir: "../../artefact/schemascript/dist",
	define: {
		BUILD_VERSION: JSON.stringify(version.trim()),
		BUILD_TARGET: JSON.stringify(target),
		BUILD_TIME: JSON.stringify(buildTime),
		GIT_COMMIT: JSON.stringify(gitCommit.trim()),
	},
	target: "node",
	format: "esm",
	external: ["drizzle-orm"],
});

console.info("Generating type definitions...");
try {
	console.info("Generating type definitions for @artefact/schemascript...");
	execSync(
		"cd ../../artefact/schemascript && bun x tsc --project tsconfig.json || true",
	);
	// Flatten the output: tsc with rootDir: "../../" (packages/) puts files in dist/artefact/schemascript/
	execSync(
		"cd ../../artefact/schemascript && if [ -d dist/artefact/schemascript ]; then cp -r dist/artefact/schemascript/* .; fi && rm -rf dist artefact data utils core/*.test.d.ts",
	);
} catch (e) {
	console.error("Error generating type definitions:", e);
}

console.info(`Built with version ${version.trim()}, commit ${gitCommit.trim()}, build time ${buildTime}.`);
