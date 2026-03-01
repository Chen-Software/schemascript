import type { SQL } from "../../data/proxies/sqlite";
import * as Primitive from "./primitive";
import type { PropertyBuilder } from "./property";

const integerField = (name: string) => Primitive.integer.init(name);
const realField = (name: string) => Primitive.real.init(name);
const textField = (name: string) => Primitive.text.init(name);
const blobField = (name: string) => Primitive.blob.init(name);
const timestampField = (name: string) => Primitive.timestamp.init(name);
const nodeField = (name: string) => Primitive.node.init(name);
const enumField = (
	name: string,
	config: { options: string[] | Record<string, number> },
) => Primitive.enum.init(name).config(config);

const Field = (): FieldBuilder => ({
	integer: integerField,
	real: realField,
	text: textField,
	blob: blobField,
	timestamp: timestampField,
	node: nodeField,
	enum: enumField,
});

const field = Field();

interface FieldBuilder {
	integer: PropertyBuilder<"integer", bigint>;
	real: PropertyBuilder<"real", number>;
	text: PropertyBuilder<"text", string>;
	blob: PropertyBuilder<"blob", Uint8Array>;
	timestamp: PropertyBuilder<"timestamp", Date | bigint | string | SQL>;
	node: PropertyBuilder<"node", object>;
	enum: PropertyBuilder<
		"enum",
		string | number | bigint,
		{ options: string[] | Record<string, number> }
	>;
}

export { field, Field, type FieldBuilder };
