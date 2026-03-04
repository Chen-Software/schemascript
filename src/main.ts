import { sql } from "drizzle-orm";
import { cacheDb, storeDb } from "./data";
import { artefactTable } from "./data/schemas";

const query = sql`
    select "Hello World!" as text
`;
const cacheSql = cacheDb();
const storageSql = storeDb();
const resultCache = cacheSql.get<{ text: string }>(query);
const resultStore = storageSql.get<{ text: string }>(query);
console.log(resultCache, resultStore);

const artefacts = storageSql.select().from(artefactTable).all();
console.log("Artefacts:", artefacts);
