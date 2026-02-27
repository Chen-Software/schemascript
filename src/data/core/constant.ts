import { sql } from "../proxies/sqlite";

const BUILD_TARGET = process.env["BUILD_TARGET"];

const SqlValue = () => ({
	now: sql`CURRENT_TIMESTAMP`,
});

const sqlValue = SqlValue();

const sqlConstant = () => ({
	now: sqlValue.now,
});

const constant = () => ({
	now: "now",
});

const Constant = () =>
	(BUILD_TARGET === "SQLite" && sqlConstant()) || constant();

export { Constant };
