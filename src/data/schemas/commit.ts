import type { SchemaBuilder } from "@artefact/schemascript";
import { field, Schema, Table, value } from "@artefact/schemascript";

const commit: SchemaBuilder = () => ({
	/**
	 * The message.
	 *
	 * @name message
	 * @description The full path including filename of the commit.
	 * @type TEXT
	 * @unique
	 */
	message: field.text("message").unique(),

	/**
	 * The mode type of the commit.
	 *
	 * @name mode
	 * @description The mode type of the commit.
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
	 * The cryptographic hash digest of the commit content.
	 *
	 * @name digest
	 * @description The cryptographic hash digest of the commit content.
	 * @type TEXT
	 * @unique
	 * @identifier
	 */
	digest: field.text("digest").unique().identifier(),

	/**
	 * The cryptographic hash digest identifier of the commit parents.
	 *
	 * @name digest
	 * @description The cryptographic hash digest of the commit parents.
	 * @type TEXT.Array
	 */
	parents: field.text("parents").array(),

	/**
	 * The author actino of the commit.
	 *
	 * @name author
	 * @description The author action of the commit.
	 * @type NODE
	 */
	author: field.node("author"),

	/**
	 * The committer action.
	 *
	 * @name committer
	 * @description The committer action.
	 * @type TEXT.JSON
	 */
	committer: field.text("committer", { mode: "json" }),

	/**
	 * The content of the commit.
	 *
	 * @name artefacts
	 * @description The content of the commit.
	 * @type TEXT.Array
	 * @array
	 */
	artefacts: field.text("artefacts").array().default(value.emptyArray),
});

const commitSchema = Schema("Commit", commit);
const commitTable = Table("commits", commit);

export { commit, commitSchema, commitTable };
