import { Primitive, Schema, Table, value } from "../types";

const artefact = () => ({
	name: Primitive.text("name"),
	timestamp: Primitive.integer("timestamp").default(value.now()),
});

const artefactSchema = Schema("Artefact", artefact);
const artefactTable = Table("artefacts", artefact);

export { artefactSchema, artefactTable };
