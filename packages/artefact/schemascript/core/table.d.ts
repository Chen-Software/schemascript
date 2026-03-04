import type { SchemaBuilder } from "./schema";
declare function Table(name: string, schemaBuilder: SchemaBuilder): import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
    name: string;
    schema: undefined;
    columns: {
        [x: string]: import("drizzle-orm/sqlite-core").SQLiteColumn<{
            name: any;
            tableName: string;
            dataType: any;
            columnType: any;
            data: any;
            driverParam: any;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: any;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            [x: string]: any;
            [x: number]: any;
            [x: symbol]: any;
        }>;
    };
    dialect: "sqlite";
}>;
export { Table };
