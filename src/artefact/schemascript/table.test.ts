import { describe, expect, test } from "bun:test";
import { field } from "./field";
import { Schema } from "./schema";
import { Table } from "./table";

describe("Table implementation for timestamp, node, and enum", () => {
	test("should correctly handle timestamp fields", () => {
		const users = Table("users", (prop) => ({
			createdAt: prop.timestamp("created_at"),
			updatedAt: prop.timestamp("updated_at").optional(),
		}));
		expect(users.createdAt).toBeDefined();
		expect(users.updatedAt).toBeDefined();
	});

	test("should correctly handle node fields", () => {
		const users = Table("users", (prop) => ({
			metadata: prop.node("metadata"),
		}));
		expect(users.metadata).toBeDefined();
	});

	test("should correctly handle enum fields", () => {
		const users = Table("users", (prop) => ({
			role: prop.enum("role", { options: { ADMIN: 1, USER: 2 } }),
		}));
		expect(users.role).toBeDefined();
	});

	test("should correctly handle array fields", () => {
		const users = Table("users", (prop) => ({
			tags: prop.text("tags").array(),
			scores: prop.integer("scores").array(),
			timestamps: prop.timestamp("timestamps").array(),
			nodes: prop.node("nodes").array(),
			enums: prop.enum("enums", { options: { A: 1, B: 2 } }).array(),
		}));
		expect(users.tags).toBeDefined();
		expect(users.scores).toBeDefined();
		expect(users.timestamps).toBeDefined();
		expect(users.nodes).toBeDefined();
		expect(users.enums).toBeDefined();
	});
});
