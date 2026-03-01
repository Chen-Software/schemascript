import { describe, expect, test } from "bun:test";
import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";
import { _$ } from "@/utils/dedent";
import { Schema } from "./schema";

describe("Schema toString", () => {
	test("should output schema name and fields", () => {
		const schema = Schema("users", (prop) => ({
			id: prop.integer("id").identifier(),
			name: prop.text("name"),
			email: prop.text("email").unique(),
		}));
		const result = schema.toString();
		const expected = _$`
			Schema: users
			{
			   integer("id").identifier(),
			   text("name"),
			   text("email").unique()
			}`;
		expect(result).toBe(expected);
	});
	test("should include .optional() for optional fields", () => {
		const schema = Schema("posts", (prop) => ({
			id: prop.integer("id").identifier(),
			title: prop.text("title"),
			content: prop.text("content").optional(),
		}));
		const result = schema.toString();
		const expected = _$`
			Schema: posts
			{
			   integer("id").identifier(),
			   text("title"),
			   text("content").optional()
			}`;
		expect(result).toBe(expected);
	});
	test("should include default value for fields with default", () => {
		const schema = Schema("settings", (prop) => ({
			id: prop.integer("id").identifier(),
			theme: prop.text("theme").default("light"),
			isActive: prop.integer("isActive").default(1n),
		}));
		const result = schema.toString();
		const expected = _$`
			Schema: settings
			{
			   integer("id").identifier(),
			   text("theme").default("light"),
			   integer("isActive").default(1)
			}`;
		expect(result).toBe(expected);
	});
	test("should handle combinations of modifiers", () => {
		const schema = Schema("complex", (prop) => ({
			id: prop.integer("id").identifier(),
			code: prop.text("code").unique().optional(),
			count: prop.integer("count").default(0n),
			description: prop.text("description").optional(),
		}));
		const result = schema.toString();
		const expected = _$`
			Schema: complex
			{
			   integer("id").identifier(),
			   text("code").optional().unique(),
			   integer("count").default(0),
			   text("description").optional()
			}`;
		expect(result).toBe(expected);
	});
	test("should format output with proper indentation and newlines", () => {
		const schema = Schema("formatted", (prop) => ({
			id: prop.integer("id").identifier(),
			name: prop.text("name"),
		}));
		const result = schema.toString();
		const lines = result.split("\n");
		expect(lines[0]).toBe("Schema: formatted");
		expect(lines[1]).toBe("{");
		expect(lines.at(-1)).toBe("}");
	});
	test("should handle all data types", () => {
		const schema = Schema("all_types", (prop) => ({
			id: prop.integer("id").identifier(),
			amount: prop.real("amount"),
			data: prop.blob("data"),
			description: prop.text("description"),
		}));
		const result = schema.toString();
		const expected = _$`
			Schema: all_types
			{
			   integer("id").identifier(),
			   real("amount"),
			   blob("data"),
			   text("description")
			}`;
		expect(result).toBe(expected);
	});
	test("should handle empty schema", () => {
		const schema = Schema("empty", () => ({}));
		const result = schema.toString();
		expect(result).toBe("Schema: empty\n{\n\n}");
	});
	test("should handle fields with custom names", () => {
		const schema = Schema("custom_names", (prop) => ({
			user_id: prop.integer("id"),
			user_name: prop.text("name").init("full_name"),
		}));
		const result = schema.toString();
		const expected = _$`
			Schema: custom_names
			{
			   integer("id"),
			   text("full_name")
			}`;
		expect(result).toBe(expected);
	});
});
test("should handle enum field type", () => {
	const schema = Schema("statuses", (prop) => ({
		id: prop.integer("id").identifier(),
		status: prop.enum("status", {
			options: { pending: 1, active: 2, inactive: 3 },
		}),
	}));
	const result = schema.toString();
	const expected = _$`
			Schema: statuses
			{
			   integer("id").identifier(),
			   enum("status",
			    {   options:
						{
							pending: 1,
							active: 2,
							inactive: 3,
						}
					}
			   )
			}`;
	expect(result).toBe(expected);
});

describe("toTypeScriptInterface", () => {
	test("should generate correct TypeScript interface", () => {
		const schema = Schema("User", (prop) => ({
			id: prop.integer("id").identifier(),
			username: prop.text("username").unique(),
			email: prop.text("email").optional(),
			avatar: prop.blob("avatar").optional(),
			age: prop.real("age").default(18),
			createdAt: prop.timestamp("created_at"),
			tags: prop.text("tags").array(),
			metadata: prop.node("metadata"),
			role: prop.enum("role", { options: ["admin", "user"] }),
		}));

		const result = schema.toTypeScriptInterface();
		const expected = _$`
			interface User {
			  id: bigint;
			  username: string;
			  email: string | null;
			  avatar: Uint8Array | null;
			  age: number;
			  createdAt: Date;
			  tags: string[];
			  metadata: object;
			  role: "admin" | "user";
			}`;
		expect(result).toBe(expected);
	});

	test("should validate generated TypeScript end-to-end using Bun.build", async () => {
		const schema = Schema("Comprehensive", (prop) => ({
			id: prop.integer("id").identifier(),
			name: prop.text("name"),
			age: prop.real("age").optional(),
			data: prop.blob("data"),
			lastLogin: prop.timestamp("last_login").default(new Date()),
			metadata: prop.node("metadata"),
			status: prop.enum("status", { options: ["active", "inactive"] }),
			tags: prop.text("tags").array(),
		}));

		const generatedCode = schema.toTypeScriptInterface();
		const testFilePath = join(process.cwd(), "generated-type-test.ts");

		// Wrap in a complete TS file that uses the interface
		const fullContent = `
${generatedCode}

const testObj: Comprehensive = {
    id: 1n,
    name: "Jules",
    age: 25,
    data: new Uint8Array([1, 2, 3]),
    lastLogin: new Date(),
    metadata: { key: "value" },
    status: "active",
    tags: ["a", "b"]
};

console.log(testObj);
`;

		writeFileSync(testFilePath, fullContent);

		try {
			const buildResult = await Bun.build({
				entrypoints: [testFilePath],
				target: "node",
			});
			expect(buildResult.success).toBe(true);
		} finally {
			unlinkSync(testFilePath);
		}
	});
});

describe("Type Safety Restrictions", () => {
	test("should forbid identifier() on enums at compile time", async () => {
		const testFilePath = join(process.cwd(), "enum-identifier-test.ts");
		const content = `
import { Schema } from "./src/data/core/schema";

const s = Schema("test", (prop) => ({
    // @ts-expect-error - enums cannot be identifiers
    role: prop.enum("role", { options: ["a", "b"] }).identifier()
}));
`;
		writeFileSync(testFilePath, content);
		try {
			const result =
				await $`bun x tsc --noEmit --target esnext --module esnext --moduleResolution node --skipLibCheck ${testFilePath}`;
			expect(result.exitCode).toBe(0);
		} finally {
			unlinkSync(testFilePath);
		}
	});

	test("should forbid unique() on enums at compile time", async () => {
		const testFilePath = join(process.cwd(), "enum-unique-test.ts");
		const content = `
import { Schema } from "./src/data/core/schema";

const s = Schema("test", (prop) => ({
    // @ts-expect-error - enums cannot be unique
    role: prop.enum("role", { options: ["a", "b"] }).unique()
}));
`;
		writeFileSync(testFilePath, content);
		try {
			const result =
				await $`bun x tsc --noEmit --target esnext --module esnext --moduleResolution node --skipLibCheck ${testFilePath}`;
			expect(result.exitCode).toBe(0);
		} finally {
			unlinkSync(testFilePath);
		}
	});

	test("should throw runtime error if identifier() is called on enum", () => {
		const schema = Schema("test", (prop) => ({
			role: prop.enum("role", { options: ["a"] }),
		}));

		expect(() => (schema.fields.role as any).identifier()).toThrow(
			"Enums cannot be identifiers.",
		);
	});

	test("should throw runtime error if unique() is called on enum", () => {
		const schema = Schema("test", (prop) => ({
			role: prop.enum("role", { options: ["a"] }),
		}));

		expect(() => (schema.fields.role as any).unique()).toThrow(
			"Enums cannot be unique.",
		);
	});
});
