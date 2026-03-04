import type { AnySQLiteColumn, SQL } from "@/data/proxies/sqlite";
import type { primitive } from "./primitive";
declare class Property<TypeName extends string, JavaScriptType = primitive, EnumOptionType = never> {
    private readonly _type;
    private readonly options;
    constructor(_type: TypeName, options?: PropertyOptions<JavaScriptType, EnumOptionType>);
    getOptions(): PropertyOptions<JavaScriptType, EnumOptionType>;
    private setOptions;
    init<T extends JavaScriptType = JavaScriptType>(): Property<TypeName, T, EnumOptionType>;
    finalise<T extends JavaScriptType = JavaScriptType>(name: string): Property<TypeName, T, EnumOptionType>;
    enumOptions(enumOptions: EnumOptionType): Property<TypeName, JavaScriptType, EnumOptionType>;
    optional(): Property<TypeName, JavaScriptType | null, EnumOptionType>;
    unique(): Property<TypeName, JavaScriptType, EnumOptionType>;
    array(): Property<TypeName, JavaScriptType[], EnumOptionType>;
    default(value: JavaScriptType | SQL): Property<TypeName, JavaScriptType, EnumOptionType>;
    identifier(this: Property<Exclude<TypeName, "enum">, JavaScriptType, EnumOptionType>, config?: TypeName extends "integer" ? {
        autoIncrement: boolean;
    } : never): Property<TypeName, JavaScriptType, EnumOptionType>;
    references(ref: () => AnySQLiteColumn, actions?: ReferenceActions): Property<TypeName, JavaScriptType, EnumOptionType>;
    get type(): TypeName;
    get name(): string | undefined;
    get enumConfigs(): EnumOptionType | undefined;
    get isOptional(): boolean;
    get isUnique(): boolean;
    get isArray(): boolean;
    get isIdentifier(): boolean;
    get isAutoIncrement(): boolean;
    get reference(): PropertyOptions["references"];
    get hasDefault(): boolean;
    get defaultValue(): JavaScriptType | SQL | undefined;
    toString(): string;
    toTypeScriptType(): string;
    toJSON(): {
        hasDefault: boolean;
        name?: string;
        enumOptions?: EnumOptionType | undefined;
        isOptional: boolean;
        isUnique?: boolean;
        isArray?: boolean;
        isIdentifier?: boolean;
        autoIncrement?: boolean;
        defaultValue?: JavaScriptType | SQL;
        references?: {
            ref: () => AnySQLiteColumn;
            actions?: ReferenceActions;
        };
        type: TypeName;
    };
}
type PropertyOptions<_JavaScriptType = unknown, EnumOptionType = unknown> = {
    name?: string;
    enumOptions?: EnumOptionType;
    isOptional: boolean;
    isUnique?: boolean;
    isArray?: boolean;
    isIdentifier?: boolean;
    autoIncrement?: boolean;
    defaultValue?: JavaScriptType | SQL;
    references?: {
        ref: () => AnySQLiteColumn;
        actions?: ReferenceActions;
    };
};
type ReferenceAction = "cascade" | "restrict" | "no action" | "set null" | "set default";
type ReferenceActions = {
    onUpdate?: ReferenceAction;
    onDelete?: ReferenceAction;
};
type PropertyBuilder<TypeName extends string = string, JavaScriptType = unknown, EnumOptionType = unknown> = (config?: EnumOptionType) => Property<TypeName, JavaScriptType, EnumOptionType>;
export { Property, type PropertyOptions, type PropertyBuilder, type ReferenceAction, type ReferenceActions, };
