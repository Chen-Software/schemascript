import { describe, expect, test } from "bun:test";
import { field } from "./field";
import { Table } from "./table";

describe("Table", () => {
	test("should map all primitive types to Drizzle columns", () => {
		const MyTable = Table("my_table", () => ({
			int: field.integer(),
			real: field.real(),
			txt: field.text(),
			bool: field.boolean(),
			buf: field.blob(),
			time: field.timestamp(),
			obj: field.node(),
		}));

		expect(MyTable).toBeDefined();
		const columns = (
			MyTable as unknown as {
				[key: symbol]: Record<string, { notNull: boolean }>;
			}
		)[Symbol.for("drizzle:Columns")];
		expect(Object.keys(columns)).toEqual([
			"int",
			"real",
			"txt",
			"bool",
			"buf",
			"time",
			"obj",
		]);
	});

	test("should handle optional fields by omitting notNull", () => {
		const MyTable = Table("my_table", () => ({
			req: field.text(),
			opt: field.text().optional(),
		}));

		const columns = (
			MyTable as unknown as {
				[key: symbol]: Record<string, { notNull: boolean }>;
			}
		)[Symbol.for("drizzle:Columns")];
		expect(columns.req.notNull).toBe(true);
		expect(columns.opt.notNull).toBe(false);
	});

	test("should handle unique fields", () => {
		const MyTable = Table("my_table", () => ({
			email: field.text().unique(),
			id: field.integer(),
		}));

		const columns = (
			MyTable as unknown as {
				[key: symbol]: Record<string, { isUnique: boolean }>;
			}
		)[Symbol.for("drizzle:Columns")];
		expect(columns.email.isUnique).toBe(true);
		expect(columns.id.isUnique).toBe(false);
	});

	test("should handle both unique and optional fields", () => {
		const MyTable = Table("my_table", () => ({
			both: field.text().optional().unique(),
		}));

		const columns = (
			MyTable as unknown as {
				[key: symbol]: Record<string, { isUnique: boolean; notNull: boolean }>;
			}
		)[Symbol.for("drizzle:Columns")];
		expect(columns.both.isUnique).toBe(true);
		expect(columns.both.notNull).toBe(false);
	});

	test("should handle identifier fields", () => {
		const MyTable = Table("my_table", () => ({
			id: field.integer().identifier({ autoIncrement: true }),
		}));

		expect(MyTable).toBeDefined();
	});

	test("should handle enums with mapping", () => {
		const MyTable = Table("my_table", () => ({
			status: field.enum({ options: ["A", "B"] }),
		}));

		const columns = (
			MyTable as unknown as { [key: symbol]: Record<string, unknown> }
		)[Symbol.for("drizzle:Columns")];
		expect(columns.status).toBeDefined();
	});

	test("should handle enums with object options", () => {
		const MyTable = Table("my_table", () => ({
			status: field.enum({ options: { ACTIVE: 1, INACTIVE: 0 } }),
		}));

		const columns = (
			MyTable as unknown as { [key: symbol]: Record<string, unknown> }
		)[Symbol.for("drizzle:Columns")];
		expect(columns.status).toBeDefined();
	});

	test("should fallback to integer for enums without options", () => {
		const MyTable = Table(
			"my_table",
			(f: { enum: (c: unknown) => unknown }) => ({
				status: f.enum({}),
			}),
		);
		const columns = (
			MyTable as unknown as { [key: symbol]: Record<string, unknown> }
		)[Symbol.for("drizzle:Columns")];
		expect(columns.status).toBeDefined();
	});

	test("should throw error for unsupported type", () => {
		expect(() => {
			Table("error", () => ({
				bad: {
					type: "invalid",
					finalise: (key: string) => ({ type: "invalid", name: key }),
				} as any,
			}));
		}).toThrow("Unsupported type: invalid");
	});
});
