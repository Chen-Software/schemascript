import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { type AnySQLiteColumn, blob, customType, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
declare function runtime<TSchema extends Record<string, unknown>>(): import("drizzle-orm/sqlite-proxy").SqliteRemoteDatabase<TSchema>;
interface QueryPayload {
    sql: string;
    params: unknown[];
    method: "run" | "all" | "values" | "get";
}
interface QueryResult {
    rows?: unknown[][];
    last_insert_row_id?: number;
    changes?: number;
    error?: string;
}
type primitive = ReturnType<typeof integer> | ReturnType<typeof text> | ReturnType<typeof real> | ReturnType<typeof blob>;
export { runtime, type primitive, type QueryPayload, type QueryResult, integer, blob, real, sqliteTable, text, sql, type SQL, customType, type AnySQLiteColumn, };
