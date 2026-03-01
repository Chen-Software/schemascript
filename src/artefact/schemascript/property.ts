import type { SchemaBuilder } from "./schema";

class Property<DataType extends string, TData = unknown, TConfig = never> {
	constructor(
		public readonly _type: DataType,
		private readonly options: PropertyOptions<TData, TConfig> = {
			isOptional: false,
			isIdentifier: false,
			isUnique: false,
			isArray: false,
		},
	) {}

	getOptions(): PropertyOptions<TData, TConfig> {
		return { ...this.options };
	}

	private setOptions(
		updates: Partial<PropertyOptions<TData, TConfig>>,
	): Property<DataType, TData, TConfig> {
		return new Property(this._type, { ...this.options, ...updates });
	}

	init<T extends TData = TData>(name: string): Property<DataType, T, TConfig> {
		return this.setOptions({ name }) as unknown as Property<
			DataType,
			T,
			TConfig
		>;
	}

	config(config: TConfig): Property<DataType, TData, TConfig> {
		return this.setOptions({ config });
	}

	default(value: TData): Property<DataType, TData, TConfig> {
		return this.setOptions({ defaultValue: value });
	}

	identifier(
		this: Property<Exclude<DataType, "enum">, TData, TConfig>,
	): Property<DataType, TData, TConfig> {
		if (this._type === "enum") {
			throw new Error("Enums cannot be identifiers.");
		}
		return this.setOptions({ isIdentifier: true }) as unknown as Property<
			DataType,
			TData,
			TConfig
		>;
	}

	optional(): Property<DataType, TData | null, TConfig> {
		return this.setOptions({ isOptional: true });
	}

	unique(
		this: Property<Exclude<DataType, "enum">, TData, TConfig>,
	): Property<DataType, TData, TConfig> {
		if (this._type === "enum") {
			throw new Error("Enums cannot be unique.");
		}
		return this.setOptions({ isUnique: true }) as unknown as Property<
			DataType,
			TData,
			TConfig
		>;
	}

	array(): Property<DataType, TData[], TConfig> {
		return this.setOptions({ isArray: true }) as Property<
			DataType,
			TData[],
			TConfig
		>;
	}

	references(ref: () => unknown): Property<DataType, TData, TConfig> {
		return this.setOptions({ references: ref });
	}

	get type(): DataType {
		return this._type;
	}

	get name(): string | undefined {
		return this.options.name;
	}

	get configs(): TConfig | undefined {
		return this.options.config;
	}

	get isOptional(): boolean {
		return this.options.isOptional;
	}

	get isIdentifier(): boolean {
		return this.options.isIdentifier;
	}

	get isUnique(): boolean {
		return this.options.isUnique;
	}

	get isArray(): boolean {
		return !!this.options.isArray;
	}

	get hasDefault(): boolean {
		return this.options.defaultValue !== undefined;
	}

	get defaultValue(): TData | undefined {
		return this.options.defaultValue;
	}

	toString(): string {
		const name = this.name ?? "unnamed";
		const optional = this.isOptional ? ".optional()" : "";
		const array = this.isArray ? ".array()" : "";
		const defaultVal = this.hasDefault
			? `.default(${typeof this.defaultValue === "bigint" ? this.defaultValue.toString() : JSON.stringify(this.defaultValue)})`
			: "";

		if (this._type === "enum") {
			const config = this.configs as
				| { options?: string[] | Record<string, number> }
				| undefined;
			const options = config?.options;
			if (options) {
				if (Array.isArray(options)) {
					const values = options.map((v) => `"${v}"`).join(", ");
					return `enum("${name}",\n    {   options:\n\t\t\t[${values}]\n\t}\n   )${optional}${array}${defaultVal}`;
				}
				if (typeof options === "object") {
					const values = Object.entries(options)
						.map(([k, v]) => `\t\t\t\t${k}: ${v},`)
						.join("\n");
					return `enum("${name}",\n    {   options:\n\t\t\t{\n${values}\n\t\t\t}\n\t\t}\n   )${optional}${array}${defaultVal}`;
				}
			}
		}

		const identifier = this.isIdentifier ? ".identifier()" : "";
		const unique = this.isUnique ? ".unique()" : "";
		return `${this._type}("${name}")${identifier}${optional}${unique}${array}${defaultVal}`;
	}

	toTypeScriptType(): string {
		let typeStr: string;
		switch (this._type) {
			case "integer":
				typeStr = "bigint";
				break;
			case "real":
				typeStr = "number";
				break;
			case "text":
				typeStr = "string";
				break;
			case "blob":
				typeStr = "Uint8Array";
				break;
			case "timestamp":
				typeStr = "Date";
				break;
			case "node":
				typeStr = "object";
				break;
			case "enum": {
				const config = this.configs as
					| { options?: string[] | Record<string, number> }
					| undefined;
				const options = config?.options;
				if (options) {
					if (Array.isArray(options)) {
						typeStr = options.map((v) => `"${v}"`).join(" | ");
					} else {
						typeStr = Object.keys(options)
							.map((v) => `"${v}"`)
							.join(" | ");
					}
				} else {
					typeStr = "string | number";
				}
				break;
			}
			default:
				typeStr = "unknown";
		}

		if (this.isArray) {
			typeStr = `${typeStr}[]`;
		}

		if (this.isOptional) {
			typeStr = `${typeStr} | null`;
		}

		return typeStr;
	}

	toJSON() {
		return {
			type: this._type,
			...this.options,
			hasDefault: this.hasDefault,
		};
	}
}

type PropertyOptions<TData = unknown, TConfig = unknown> = {
	name?: string;
	config?: TConfig;
	isOptional: boolean;
	isIdentifier: boolean;
	isUnique: boolean;
	isArray?: boolean;
	defaultValue?: TData;
	autoIncrement?: boolean;
	references?: () => unknown;
};

type PropertyBuilder<
	DataType extends string = string,
	TData = unknown,
	TConfig = unknown,
> = (name: string, config?: TConfig) => Property<DataType, TData, TConfig>;

export { Property, type PropertyOptions, type PropertyBuilder };
