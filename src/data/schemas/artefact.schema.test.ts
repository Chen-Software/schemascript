import { describe, expect, test } from "bun:test";
import { _$ } from "@/utils/dedent";
import { artefactSchema, artefactTable } from "./artefact.schema";

describe("Artefact Schema", () => {
	test("should output the correct schema representation", () => {
		const schemaString = artefactSchema.toString();
		const schemaExpected = _$`
			Schema: Artefact
			{
			   text("name"),
			   integer("timestamp").default("now()")
			}`;
		expect(schemaString).toBe(schemaExpected);
	});
	test("should output the correct table representation", () => {
		expect(artefactTable).toBeDefined();
	});
});
