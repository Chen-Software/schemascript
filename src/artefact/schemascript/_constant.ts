import { sql } from "../../data/proxies/sqlite";

const SqlValue = () => ({
	now: sql`CURRENT_TIMESTAMP`,
	emptyArray: sql`'[]'`,
});

const sqlValue = SqlValue();

const sqlConstant = () => ({
	now: sqlValue.now,
	emptyArray: sqlValue.emptyArray,
});

const constant = () => ({
	now: "now",
	emptyArray: "[]",
});

// @ts-expect-error
const BUILD_TARGET = process.env.BUILD_TARGET;

const Constant = () =>
	(BUILD_TARGET === "SQLite" && sqlConstant()) || constant();

export { Constant };
