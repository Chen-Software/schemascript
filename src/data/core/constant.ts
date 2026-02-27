import { sql } from "../proxies/sqlite";

const Value = () => ({
	now: sqlValue.now,
});

const value = Value();

const sqlValue = {
	now: () => now,
};

const now = sql`CURRENT_TIMESTAMP`;

export { value, Value };
