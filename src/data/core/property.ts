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

	identifier(): Property<DataType, TData, TConfig> {
		return this.setOptions({ isIdentifier: true });
	}

	optional(): Property<DataType, TData | null, TConfig> {
		return this.setOptions({ isOptional: true });
	}

	unique(): Property<DataType, TData, TConfig> {
		return this.setOptions({ isUnique: true });
	}

	array(): Property<DataType, TData[], TConfig> {
		return this.setOptions({ isArray: true }) as Property<
			DataType,
			TData[],
			TConfig
		>;
	}

	deriveFrom(config: DeriveConfig): Property<DataType, TData, TConfig> {
		return this.setOptions({ deriveConfig: config });
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

	get deriveConfig(): DeriveConfig | undefined {
		return this.options.deriveConfig;
	}

	get hasDefault(): boolean {
		return this.options.defaultValue !== undefined;
	}

	get defaultValue(): TData | undefined {
		return this.options.defaultValue;
	}

	toString(): string {
		const name = this.name ?? "unnamed";
		const identifier = this.isIdentifier ? ".identifier()" : "";
		const optional = this.isOptional ? ".optional()" : "";
		const unique = this.isUnique ? ".unique()" : "";
		const array = this.isArray ? ".array()" : "";
		const defaultVal = this.hasDefault
			? `.default(${typeof this.defaultValue === "bigint" ? this.defaultValue.toString() : JSON.stringify(this.defaultValue)})`
			: "";

		if (this._type === "enum") {
			const config = this.configs as
				| { options?: Record<string, number> }
				| undefined;
			const options = config?.options;
			if (options && typeof options === "object") {
				const values = Object.entries(options)
					.map(([k, v]) => `\t\t\t\t${k}: ${v},`)
					.join("\n");
				return `enum("${name}",\n    {   options:\n\t\t\t{\n${values}\n\t\t\t}\n\t}\n   )${identifier}${optional}${unique}${array}${defaultVal}`;
			}
		}

		return `${this._type}("${name}")${identifier}${optional}${unique}${array}${defaultVal}`;
	}

	toJSON() {
		return {
			type: this._type,
			...this.options,
			hasDefault: this.hasDefault,
		};
	}
}

type DeriveConfig = {
	schemas: (SchemaBuilder | string | (() => SchemaBuilder))[];
	joinOn: (o: string, u: string) => string;
	sql: (o: string, u: string) => string;
};

type PropertyOptions<TData = unknown, TConfig = unknown> = {
	name?: string;
	config?: TConfig;
	isOptional: boolean;
	isIdentifier: boolean;
	isUnique: boolean;
	isArray?: boolean;
	deriveConfig?: DeriveConfig;
	defaultValue?: TData;
	autoIncrement?: boolean;
	references?: () => unknown;
};

type PropertyBuilder<
	DataType extends string = string,
	TData = unknown,
	TConfig = unknown,
> = (name: string, config?: TConfig) => Property<DataType, TData, TConfig>;

export {
	Property,
	type PropertyOptions,
	type PropertyBuilder,
	type DeriveConfig,
};
