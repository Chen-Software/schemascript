import type { primitive } from "../../data/proxies/sqlite";
import {
	blob,
	customType,
	integer,
	real,
	sqliteTable,
	text,
} from "../../data/proxies/sqlite";
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
					builder = builder.$type<{ payload: bigint[] }>();
					break;
				}
				case "real": {
					builder = builder.$type<{ payload: number[] }>();
					break;
				}
				case "text": {
					builder = builder.$type<{ payload: string[] }>();
					break;
				}
				case "blob": {
					builder = builder.$type<{ payload: Uint8Array[] }>();
					break;
				}
				case "node": {
					builder = builder.$type<{ payload: object[] }>();
					break;
				}
				case "timestamp": {
					builder = builder.$type<{ payload: bigint[] }>();
					break;
				}
				case "enum": {
					builder = builder.$type<{ payload: bigint[] }>();
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
				case "node":
					builder = blob(columnName, { mode: "json" }).$type<object>();
					break;
				case "enum": {
					const config = prop.configs as
						| { options: string[] | Record<string, number> }
						| undefined;

					if (config?.options) {
						let mapping: Record<string, number>;
						const reverseMapping: Record<number, string> = {};

						if (Array.isArray(config.options)) {
							const options = config.options;
							mapping = {};
							for (let i = 0; i < options.length; i++) {
								mapping[options[i]] = i;
								reverseMapping[i] = options[i];
							}
						} else {
							mapping = config.options;
							for (const [k, v] of Object.entries(mapping)) {
								reverseMapping[v] = k;
							}
						}

						const EnumType = customType<{
							data: string;
							driverData: number;
						}>({
							dataType() {
								return "integer";
							},
							fromDriver(value: number) {
								return reverseMapping[value];
							},
							toDriver(value: string) {
								return mapping[value];
							},
						});
						builder = EnumType(columnName);
					} else {
						builder = integer(columnName);
					}
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
		if (prop.references) {
			builder = builder.references(prop.references as never) as typeof builder;
		}

		sqliteColumns[key] = builder;
	}

	return sqliteTable(name, sqliteColumns);
}

export { Table };
