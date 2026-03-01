import { describe, expect, test } from "bun:test";
import { _$ } from "@/utils/dedent";
import { field } from "./field";
import { Schema } from "./schema";
import { Table } from "./table";

describe("Comprehensive Schema and Table Tests", () => {
	test("Schema toString with new types", () => {
		const schema = Schema("comprehensive", (prop) => ({
			ts: prop.timestamp("ts"),
			meta: prop.node("meta"),
			status: prop.enum("status", { options: ["active", "inactive"] }),
			tags: prop.text("tags").array(),
			scores: prop.integer("scores").array(),
			history: prop.timestamp("history").array(),
		}));

		const expected = _$`
			Schema: comprehensive
			{
			   timestamp("ts"),
			   node("meta"),
			   enum("status",
			    {   options:
						["active", "inactive"]
				}
			   ),
			   text("tags").array(),
			   integer("scores").array(),
			   timestamp("history").array()
			}`;
		expect(schema.toString()).toBe(expected);
	});

	test("Table mapping with new types", () => {
		const MyTable = Table("my_table", (prop) => ({
			id: prop.integer("id").identifier(),
			createdAt: prop.timestamp("created_at"),
			metadata: prop.node("metadata"),
			role: prop.enum("role", { options: ["admin", "user"] }),
			permissions: prop.enum("permissions", { options: { READ: 1, WRITE: 2 } }),
			tags: prop.text("tags").array(),
			logs: prop.node("logs").array(),
		}));

		expect(MyTable.id).toBeDefined();
		expect(MyTable.createdAt).toBeDefined();
		expect(MyTable.metadata).toBeDefined();
		expect(MyTable.role).toBeDefined();
		expect(MyTable.permissions).toBeDefined();
		expect(MyTable.tags).toBeDefined();
		expect(MyTable.logs).toBeDefined();
	});

	test("Integer Enums (Production Grade)", () => {
		const schema = Schema("Artefact", (prop) => ({
			mode: prop.enum("mode", {
				options: {
					blob: 100644,
					executable: 100755,
					symlink: 120000,
					directory: 40000,
					submodule: 160000,
				},
			}),
		}));

		const expected = _$`
			Schema: Artefact
			{
			   enum("mode",
			    {   options:
						{
							blob: 100644,
							executable: 100755,
							symlink: 120000,
							directory: 40000,
							submodule: 160000,
						}
					}
			   )
			}`;
		expect(schema.toString()).toBe(expected);

		const tsInterface = schema.toTypeScriptInterface();
		expect(tsInterface).toContain(
			'mode: "blob" | "executable" | "symlink" | "directory" | "submodule";',
		);

		const table = Table("artefacts", (prop) => ({
			mode: prop.enum("mode", {
				options: {
					blob: 100644,
					executable: 100755,
					symlink: 120000,
					directory: 40000,
					submodule: 160000,
				},
			}),
		}));
		expect(table.mode).toBeDefined();
	});

	test("Drizzle column types for enums", () => {
		const EnumTable = Table("enum_table", (prop) => ({
			stringEnum: prop.enum("s", { options: ["a", "b"] }),
			numberEnum: prop.enum("n", { options: { X: 1, Y: 2 } }),
		}));

		expect(EnumTable.stringEnum).toBeDefined();
		expect(EnumTable.numberEnum).toBeDefined();
	});
});
