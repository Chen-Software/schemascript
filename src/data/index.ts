import { Database } from "bun:sqlite";
import { join } from "node:path";
import { drizzle as ordb } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schemas";

const cacheDb = () => {
	const memSql = new Database(":memory:");
	const db = ordb(memSql, { schema });
	migrate(db, { migrationsFolder: "./drizzle" });
	return db;
};

const storeDb = () => {
	const dbPath = join(process.cwd(), "storage", "main.sqlite.db");
	const diskSql = new Database(dbPath, { create: true });
	const db = ordb(diskSql, { schema });
	migrate(db, { migrationsFolder: "./drizzle" });
	return db;
};

export { cacheDb, storeDb };
