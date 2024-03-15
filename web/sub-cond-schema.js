let subCondSchema = {
    iconlib: "spectre",
    theme: "html",
    // The schema for the editor
    schema: {
        additionalProperties: false,
        title: "Condition",
        $ref: "#/definitions/cond",
        definitions: {
            cond: {
                type: "object",
                id: "cond",
                defaultProperties: [
                    "not",
                ],
                minProperties: 2,
                maxProperties: 2,
                properties: {
                    not: {
                        title: "Not",
                        id: "not",
                        type: "boolean",
                        format: "checkbox",
                        default: false,
                        required: true,
                    },
                    gc: {
                        title: "Group",
                        type: "object",
                        id: "gc",
                        defaultProperties: ["logic", "group"],
                        properties: {
                            logic: {
                                title: "Logic",
                                id: "logic",
                                type: "integer",
                                enum: [0, 1, 2],
                                options: {
                                    enum_titles: ["And", "Or", "Xor"],
                                },
                                required: true,
                            },
                            group: {
                                title: "Conditions",
                                id: "group",
                                type: "array",
                                items: {
                                    title: "Condition",
                                    $ref: "#/definitions/cond",
                                },
                                required: true,
                                minItems: 2,
                                maxItems: 10,
                            }
                        },
                        additionalProperties: false,
                    },
                    nc: {
                        title: "Number",
                        type: "object",
                        id: "nc",
                        defaultProperties: ["key", "op", "val"],
                        properties: {
                            key: {
                                title: "Attribute",
                                id: "key",
                                type: "string",
                                required: true,
                                minLength: 1,
                                maxLength: 20,
                                pattern: "^[a-z0-9]+$",
                                format: "autocomplete",
                                options: {
                                    "autocomplete": {
                                        "search": "autoCompleteKeyInt",
                                    }
                                },
                            },
                            op: {
                                title: "Operator",
                                id: "op",
                                type: "integer",
                                enum: [1, 2, 3, 4, 5],
                                default: 3,
                                options: {
                                    enum_titles: [">", "≥", "=", "≤", "<"],
                                },
                                required: true,
                            },
                            val: {
                                title: "Value",
                                id: "val",
                                type: "number",
                                required: true,
                            }
                        },
                        additionalProperties: false,
                    },
                    tc: {
                        title: "Text",
                        type: "object",
                        id: "tc",
                        defaultProperties: ["key", "term", "exact"],
                        properties: {
                            key: {
                                title: "Attribute",
                                id: "key",
                                type: "string",
                                required: false,
                                minLength: 0,
                                maxLength: 20,
                                pattern: "^[a-z0-9]*$",
                                format: "autocomplete",
                                options: {
                                    "autocomplete": {
                                        "search": "autoCompleteKeyTxt",
                                    }
                                },
                            },
                            term: {
                                title: "Any of words",
                                id: "term",
                                type: "string",
                                required: true,
                                minLength: 3,
                                options: {
                                    inputAttributes: {
                                        placeholder: "e.g. Tesla, iPhone, ...",
                                    }
                                },
                            },
                            exact: {
                                title: "Exact Match",
                                id: "exact",
                                type: "boolean",
                                format: "checkbox",
                                default: false,
                                required: true,
                            }
                        },
                        additionalProperties: false,
                    },
                }
            },
        }
    }
};
