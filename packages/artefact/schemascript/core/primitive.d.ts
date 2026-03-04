import type { SQL } from "@/data/proxies/sqlite";
import { Property } from "./property";
type primitive = bigint | number | string | Uint8Array | Date | boolean | object;
declare const integer: Property<"integer", bigint, never>;
declare const real: Property<"real", number, never>;
declare const text: Property<"text", string, never>;
declare const blob: Property<"blob", Uint8Array<ArrayBufferLike>, never>;
declare const timestamp: Property<"timestamp", string | bigint | SQL<unknown> | Date, never>;
declare const boolean: Property<"boolean", boolean, never>;
declare const node: Property<"node", object, never>;
declare const enumeration: Property<"enum", string | number | bigint, {
    options: string[] | Record<string, number>;
}>;
export { type primitive, integer, real, text, blob, timestamp, boolean, node, enumeration as enum, };
