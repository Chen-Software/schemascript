export declare function runMigrationTest(tempDir: string, schemaContent: string): Promise<{
    sqlContent: string;
    cleanup: () => Promise<void>;
}>;
