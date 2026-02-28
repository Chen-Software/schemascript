import type { primitive } from "../proxies/sqlite";
import { blob, integer, real, sqliteTable, text } from "../proxies/sqlite";
import { field } from "./field";
import type { SchemaBuilder } from "./schema";

function Table<TName extends string>(
	name: TName,
	schemaBuilder: SchemaBuilder,
) {
	const fields = schemaBuilder(field);
	const sqliteColumns: Record<string, primitive> = {};

	for (const [key, prop] of Object.entries(fields)) {
		const columnName = prop.name ?? key;
		let builder: primitive;

		if (prop.isArray) {
			builder = blob(columnName, { mode: "json" });
			switch (prop.type) {
				case "integer": {
					builder = builder.$type(Array<bigint>);
					break;
				}
				case "real": {
					builder = builder.$type(Array<number>);
					break;
				}
				case "text": {
					builder = builder.$type(Array<string>);
					break;
				}
				case "blob": {
					builder = builder.$type(Array<typeof Uint8Array>);
					break;
				}
				case "json": {
					builder = builder.$type(Array<object>);
					break;
				}
				case "timestamp": {
					builder = builder.$type(Array<bigint>);
					break;
				}
				case "enum": {
					builder = builder.$type(Array<bigint>);
					break;
				}
				default:
					throw new Error(`Unsupported type: ${prop.type}`);
			}
		} else {
			switch (prop.type) {
				case "integer":
					builder = integer(columnName);
					break;
				case "real":
					builder = real(columnName);
					break;
				case "text":
					builder = text(columnName);
					break;
				case "blob":
					builder = blob(columnName, { mode: "buffer" });
					break;
				case "timestamp":
					builder = integer(columnName, { mode: "timestamp" });
					break;
				case "json":
					builder = blob(columnName, { mode: "json" });
					break;
				case "enum": {
					const config = prop.configs as { options?: string[] } | undefined;
					builder = integer(columnName, {
						mode: "number",
						...(config?.options as unknown as Record<string, unknown>),
					});
					break;
				}
				default:
					throw new Error(`Unsupported type: ${prop.type}`);
			}
		}

		if (prop.isIdentifier) {
			builder = builder.primaryKey() as typeof builder;
		}
		if (!prop.isOptional) {
			builder = builder.notNull() as typeof builder;
		}
		if (prop.isUnique) {
			builder = builder.unique() as typeof builder;
		}
		if (prop.hasDefault) {
			builder = builder.default(prop.defaultValue as never) as typeof builder;
		}

		sqliteColumns[key] = builder;
	}

	return sqliteTable(name, sqliteColumns);
}

export { Table };
