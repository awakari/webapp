const subCondSchema = {
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
                                title: "Key",
                                id: "key",
                                type: "string",
                                required: true,
                                minLength: 1,
                                options: {
                                    inputAttributes: {
                                        placeholder: "e.g. price, revenue, time, ...",
                                    },
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
                                title: "Key",
                                id: "key",
                                type: "string",
                                required: true,
                                options: {
                                    inputAttributes: {
                                        placeholder: "e.g. language, source, title, ...",
                                    }
                                },
                            },
                            term: {
                                title: "Term(s)",
                                id: "term",
                                type: "string",
                                required: true,
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

// Initialize the editor
var editor = new JSONEditor(document.getElementById("sub_cond_editor"), subCondSchema);

// Hook up the validation indicator to update its
// status whenever the editor changes
editor.on('change', function () {
    // Get an array of errors from the validator
    var errors = editor.validate();

    var indicator = document.getElementById('valid_indicator');

    // Not valid
    if (errors.length) {
        indicator.className = 'label label-danger'
        indicator.textContent = "not valid";
    }
    // Valid
    else {
        indicator.className = 'label label-success'
        indicator.textContent = "valid";
    }
});
