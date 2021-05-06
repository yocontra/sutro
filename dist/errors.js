"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ValidationError = exports.BadRequestError = exports.UnauthorizedError = exports.codes = void 0;
const util_1 = require("util");
const inspectOptions = {
    depth: 100,
    breakLength: Infinity
};
const serializeIssues = (fields) => fields.map((f) => `\n - ${util_1.inspect(f, inspectOptions)}`);
exports.codes = {
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    serverError: 500
};
class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized', status = exports.codes.unauthorized) {
        super(message);
        this.toString = () => `${super.toString()} (HTTP ${this.status})`;
        this.message = message;
        this.status = status;
        Error.captureStackTrace(this, UnauthorizedError);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class BadRequestError extends Error {
    constructor(message = 'Bad Request', status = exports.codes.badRequest) {
        super(message);
        this.message = message;
        this.status = status;
        Error.captureStackTrace(this, BadRequestError);
    }
    toString() {
        return `${super.toString()} (HTTP ${this.status})`;
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends BadRequestError {
    constructor(fields) {
        super();
        this.fields = fields;
        Error.captureStackTrace(this, ValidationError);
    }
    toString() {
        const original = super.toString();
        if (!this.fields)
            return original; // no custom validation
        if (Array.isArray(this.fields)) {
            return `${original}\nIssues:${serializeIssues(this.fields)}`;
        }
        return this.fields;
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(message = 'Not Found', status = exports.codes.notFound) {
        super(message);
        this.toString = () => `${super.toString()} (HTTP ${this.status})`;
        this.message = message;
        this.status = status;
        Error.captureStackTrace(this, NotFoundError);
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=errors.js.map