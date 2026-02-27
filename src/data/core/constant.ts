import { sql } from "../proxies/sqlite";

const BUILD_TARGET = process.env["BUILD_TARGET"];

const sqlValue = {
	now: () => sql`CURRENT_TIMESTAMP`
};

const Constant = () =>
	(BUILD_TARGET === "SQLite" && {
		now: sqlValue.now,
	}) || {
		now: () => "now()",
	};

export { Constant };
