declare const Constant: () => {
    now: {
        readonly __type: "sql";
        readonly value: "CURRENT_TIMESTAMP";
    };
    emptyArray: {
        readonly __type: "sql";
        readonly value: "'[]'";
    };
} | {
    now: string;
    emptyArray: string;
};
export { Constant };
