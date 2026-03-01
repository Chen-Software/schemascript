import type { FieldBuilder } from "./field";
import { field } from "./field";
import type { Property } from "./property";

declare const __host_predict_call: (prompt: string, schema: string) => string;

function Schema<TName extends string>(
	name: TName,
	schemaBuilder: SchemaBuilder,
) {
	const fields = schemaBuilder(field);

	const schema = {
		_name: name,
		fields,

		toString() {
			const fieldDescriptions = Object.entries(fields)
				.map(([key, prop]) => {
					const colName = prop.name ?? key;
					const optional = prop.isOptional ? ".optional()" : "";
					const identifier = prop.isIdentifier ? ".identifier()" : "";
					const unique = prop.isUnique ? ".unique()" : "";
					const array = prop.isArray ? ".array()" : "";
					const defaultVal = prop.hasDefault
						? `.default(${typeof prop.defaultValue === "bigint" ? prop.defaultValue.toString() : JSON.stringify(prop.defaultValue)})`
						: "";

					let base = "";
					switch (prop.type) {
						case "enum": {
							const config = prop.configs as
								| { options?: string[] | Record<string, number> }
								| undefined;
							const options = config?.options;
							if (options) {
								if (Array.isArray(options)) {
									const values = options.map((v) => `"${v}"`).join(", ");
									base = `   enum("${colName}",\n    {   options:\n\t\t\t[${values}]\n\t}\n   )`;
								} else if (typeof options === "object") {
									const values = Object.entries(options)
										.map(([k, v]) => `\t\t\t\t${k}: ${v},`)
										.join("\n");
									base = `   enum("${colName}",\n    {   options:\n\t\t\t{\n${values}\n\t\t\t}\n\t\t}\n   )`;
								}
							}
							break;
						}
						default:
							base = `   ${prop.type}("${colName}")`;
					}

					return `${base}${identifier}${optional}${unique}${array}${defaultVal}`;
				})
				.join(",\n");

			return `Schema: ${name}\n{\n${fieldDescriptions}\n}`;
		},

		toTypeScriptInterface(): string {
			const interfaceName = name.charAt(0).toUpperCase() + name.slice(1);
			const fieldDefinitions = Object.entries(fields)
				.map(([key, prop]) => {
					const type = prop.toTypeScriptType();
					return `  ${key}: ${type};`;
				})
				.join("\n");

			return `interface ${interfaceName} {\n${fieldDefinitions}\n}`;
		},

		toJSON() {
			return {
				name,
				fields: Object.fromEntries(
					Object.entries(fields).map(([key, prop]) => [key, prop.toJSON()]),
				),
			};
		},
	};

	return schema;
}

type SchemaBuilder = (
	prop: FieldBuilder,
) => Record<string, Property<string, unknown, unknown>>;

export { Schema, type SchemaBuilder };
