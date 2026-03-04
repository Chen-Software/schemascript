import type { FieldBuilder } from "./_field";
import type { Property } from "./property";
declare function Schema<TName extends string>(name: TName, schemaBuilder: SchemaBuilder): {
    _name: TName;
    fields: {
        [k: string]: Property<string, unknown, unknown>;
    };
    toString(): string;
    toTypeScriptInterface(): string;
    toJSON(): {
        name: TName;
        fields: {
            [k: string]: {
                hasDefault: boolean;
                name?: string;
                enumOptions?: unknown;
                isOptional: boolean;
                isUnique?: boolean;
                isArray?: boolean;
                isIdentifier?: boolean;
                autoIncrement?: boolean;
                defaultValue?: JavaScriptType | import("drizzle-orm").SQL;
                references?: {
                    ref: () => import("drizzle-orm/sqlite-core").AnySQLiteColumn;
                    actions?: import("./property").ReferenceActions;
                };
                type: string;
            };
        };
    };
};
type SchemaBuilder = (prop: FieldBuilder) => Record<string, Property<string, unknown, unknown>>;
export { Schema, type SchemaBuilder };
