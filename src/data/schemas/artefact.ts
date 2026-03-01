import type { SchemaBuilder } from "@artefact/schemascript";
import { field, Schema, Table, value } from "@artefact/schemascript";

const artefact: SchemaBuilder = () => ({
	/**
	 * The full path including filename of the artefact.
	 *
	 * @name pathname
	 * @description The full path including filename of the artefact.
	 * @type TEXT
	 * @unique
	 */
	pathname: field.text("pathname").unique(),

	/**
	 * The mode type of the artefact.
	 *
	 * @name mode
	 * @description The mode type of the artefact.
	 * @type Enum
	 */
	mode: field.enum("mode", {
		options: {
			blob: 100644,
			executable: 100755,
			symlink: 120000,
			directory: 40000,
			submodule: 160000,
		},
	}),

	/**
	 * The cryptographic hash digest of the artefact content.
	 *
	 * @name digest
	 * @description The cryptographic hash digest of the artefact content.
	 * @type TEXT
	 */
	digest: field.text("digest").unique(),

	/**
	 * The last modification timestamp of the artefact.
	 *
	 * @name modified_at
	 * @description The last modification timestamp of the artefact.
	 * @type TIMESTAMP
	 */
	modifiedAt: field.timestamp("modified_at").default(value.now),

	/**
	 * The creation timestamp of the artefact.
	 *
	 * @name created_at
	 * @description The creation timestamp of the artefact.
	 * @type INTEGER.Timestamp
	 */
	createdAt: field.timestamp("created_at").default(value.now),
});

const artefactSchema = Schema("Artefact", artefact);
const artefactTable = Table("artefacts", artefact);

export { artefact, artefactSchema, artefactTable };
