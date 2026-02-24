import { Property } from "./property";

const integer = new Property<"integer", bigint, unknown>("integer");
const real = new Property<"real", number, unknown>("real");
const text = new Property<"text", string, unknown>("text");
const blob = new Property<"blob", Uint8Array, unknown>("blob");
const enumeration = new Property<"enum", bigint, { options: string[] }>("enum");

export { integer, real, text, blob, enumeration as enum };
