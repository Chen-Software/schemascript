import type { SchemaBuilder } from "@artefact/schemascript";
import { field, Schema, Table, value } from "@artefact/schemascript";

const action: SchemaBuilder = () => ({
	/**
	 * The actor identifier.
	 *
	 * @name actor
	 * @description The actor identifier.
	 * @type TEXT
	 */
	actor: field.text("actor"),

	/**
	 * The timestamp of the action.
	 *
	 * @name timestamp
	 * @description The timestamp of the action.
	 * @type TIMESTAMP
	 */
	timestamp: field.timestamp("timestamp").default(value.now),
});

const actionSchema = Schema("Action", action);
const actionTable = Table("actions", action);

export { action, actionSchema, actionTable };
