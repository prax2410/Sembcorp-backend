const ajvInstance = require("./AjvInstance");

const schema = {
    type: 'object',
    properties: {
        first_name: {
            type: 'string',
            maxLength: 32
        },
        last_name: {
            type: 'string',
            maxLength: 32
        },
        email: {
            type: 'string',
            format: 'email'
        },
        user_name: {
            type: 'string'
        },
        password: {
            type: 'string'
        },
        role: {
            type: 'number',
            default: 0
        },
        salt: {
            type: 'string'
        },
        created_at: {
            type: 'string',
            format: 'date'
        }
    },
    required: ['first_name', 'last_name', 'email', 'user_name', 'password'],
    additionalProperties: false
};

module.exports = ajvInstance.compile(schema);