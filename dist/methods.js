"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const methods = {
    find: {
        method: 'get',
        instance: false
    },
    create: {
        method: 'post',
        instance: false,
        successCode: 201
    },
    findById: {
        method: 'get',
        instance: true
    },
    replaceById: {
        method: 'put',
        instance: true
    },
    updateById: {
        method: 'patch',
        instance: true
    },
    deleteById: {
        method: 'delete',
        instance: true
    }
};
exports.default = methods;
//# sourceMappingURL=methods.js.map