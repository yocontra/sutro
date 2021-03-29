export declare const codes: {
    badRequest: number;
    unauthorized: number;
    forbidden: number;
    notFound: number;
    serverError: number;
};
export declare class UnauthorizedError extends Error {
    message: string;
    status: number;
    constructor(message?: string, status?: number);
    toString: () => string;
}
export declare class BadRequestError extends Error {
    message: string;
    status: number;
    constructor(message?: string, status?: number);
    toString(): string;
}
export declare class ValidationError extends BadRequestError {
    fields?: string | string[];
    constructor(message: string, fields: string[]);
    toString(): string;
}
export declare class NotFoundError extends Error {
    message: string;
    status: number;
    constructor(message?: string, status?: number);
    toString: () => string;
}
