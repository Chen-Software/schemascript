import type { SQL } from "../../data/proxies/sqlite";
import { Property } from "./property";

const integer = new Property<"integer", bigint>("integer");

const real = new Property<"real", number>("real");

const text = new Property<"text", string>("text");

const blob = new Property<"blob", Uint8Array>("blob");

const timestamp = new Property<"timestamp", Date | bigint | string | SQL>(
	"timestamp",
);

const node = new Property<"node", object>("node");

const enumeration = new Property<
	"enum",
	string | number | bigint,
	{ options: string[] | Record<string, number> }
>("enum");

export { integer, real, text, blob, timestamp, node, enumeration as enum };
