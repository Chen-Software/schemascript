import { describe, expect, test } from "bun:test";
import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { field } from "./field";
import { Table } from "./table";

describe("E2E SQL Generation for Foreign Keys", () => {
	test("should generate correct SQL for foreign keys", async () => {
		const testDir = join(process.cwd(), "e2e-sql-test");
		const outDir = join(testDir, "out");
		const drizzleDir = join(testDir, "drizzle");

		mkdirSync(testDir, { recursive: true });

		const schemaContent = `
import { Table } from "../src/data/core/table";

const users = Table("users", (prop) => ({
    id: prop.integer("id").identifier(),
}));

const posts = Table("posts", (prop) => ({
    id: prop.integer("id").identifier(),
    authorId: prop.integer("author_id").references(() => users.id),
}));

export const usersTable = users;
export const postsTable = posts;
`;

		writeFileSync(join(testDir, "schema.ts"), schemaContent);

		try {
			// 1. Build the schema
			await Bun.build({
				entrypoints: [join(testDir, "schema.ts")],
				outdir: outDir,
				target: "node",
				format: "esm",
				external: [
					"drizzle-orm",
					"drizzle-orm/sqlite-core",
					"drizzle-orm/sqlite-proxy",
				],
			});

			// 2. Generate SQL using drizzle-kit
			const schemaFile = join(outDir, "schema.js");
			await $`BUILD_TARGET=SQLite bun x drizzle-kit generate --dialect sqlite --schema ${schemaFile} --out ${drizzleDir}`;

			// 3. Find and read the generated SQL file
			const files = readdirSync(drizzleDir);
			const sqlFile = files.find((f) => f.endsWith(".sql"));
			expect(sqlFile).toBeDefined();

			const sqlContent = readFileSync(join(drizzleDir, sqlFile!), "utf8");

			// 4. Verify SQL content
			expect(sqlContent).toContain(
				"REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action",
			);
		} finally {
			rmSync(testDir, { recursive: true, force: true });
		}
	}, 30000); // Increase timeout for E2E
});
