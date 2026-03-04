import { Database } from "bun:sqlite";
import fs from "node:fs";
import { join } from "node:path";
import { drizzle as ordb } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schemas";

const cacheDb = () => {
	const memSql = new Database(":memory:");
	const db = ordb(memSql, { schema });
	migrate(db, { migrationsFolder: join(import.meta.dirname, "../../drizzle") });
	return db;
};

const storeDb = () => {
	const storageDir = join(process.cwd(), "storage");
	const dbPath = join(storageDir, "main.sqlite.db");
	if (!fs.existsSync(storageDir)) {
		fs.mkdirSync(storageDir, { recursive: true });
	}
	const diskSql = new Database(dbPath, { create: true });
	const db = ordb(diskSql, { schema });
	migrate(db, { migrationsFolder: join(import.meta.dirname, "../../drizzle") });
	return db;
};

export { cacheDb, storeDb };
