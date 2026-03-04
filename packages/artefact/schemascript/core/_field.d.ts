import type { SQL } from "@/data/proxies/sqlite";
import type { Property, PropertyBuilder } from "./property";
declare const Field: () => FieldBuilder;
declare const field: FieldBuilder;
interface FieldBuilder {
    integer: PropertyBuilder<"integer", bigint>;
    real: PropertyBuilder<"real", number>;
    text: PropertyBuilder<"text", string>;
    blob: PropertyBuilder<"blob", Uint8Array>;
    timestamp: PropertyBuilder<"timestamp", Date | bigint | string | SQL>;
    boolean: PropertyBuilder<"boolean", boolean>;
    node: PropertyBuilder<"node", object>;
    enum: (config: {
        options: string[] | Record<string, number>;
    }) => Property<"enum", string | number | bigint, {
        options: string[] | Record<string, number>;
    }>;
}
export { field, Field, type FieldBuilder };
