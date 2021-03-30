/// <reference types="node" />
import { IRouter, Request, Response } from 'express';
import { Readable } from 'stream';
export declare type PathParams = string | RegExp | Array<string | RegExp>;
export declare type CacheOptions = {
    private?: boolean;
    public?: boolean;
    noStore?: boolean;
    noCache?: boolean;
    noTransform?: boolean;
    proxyRevalidate?: boolean;
    mustRevalidate?: boolean;
    staleIfError?: number;
    staleWhileRevalidate?: number;
    maxAge?: number;
    sMaxAge?: number;
};
export declare type MethodKeys = 'find' | 'create' | 'findById' | 'replaceById' | 'updateById' | 'deleteById';
export declare type MethodVerbs = 'get' | 'post' | 'put' | 'patch' | 'delete';
export declare type Methods = {
    [key: string]: {
        method: MethodVerbs;
        instance: boolean;
        successCode?: number;
    };
};
export declare type ResourceRoot = {
    hidden?: boolean;
    path: PathParams;
    method: string;
    instance: boolean;
    swagger?: SwaggerConfig;
    isAuthorized?: EndpointIsAuthorized;
    execute: EndpointExecute;
    format?: EndpointFormat;
    cache?: EndpointCache;
    http: EndpointHTTP;
    endpoint: ResourceRoot;
    successCode?: number;
    hierarchy: string;
};
export declare type Resource = {
    [key: string]: ResourceRoot;
};
export declare type Resources = {
    [key: string]: any;
};
export declare type Handler = (args: ResourceRoot) => void;
export declare type walkResourceArgs = {
    base?: string;
    name: string;
    resource: ResourceRoot;
    hierarchy?: string;
    handler: Handler;
};
export declare type getPathArgs = {
    resource: string;
    endpoint?: string;
    instance: boolean;
};
export declare type Paths = {
    [key: string]: {
        [key in MethodVerbs]?: SwaggerConfig;
    };
};
export declare type MetaRoot = {
    path?: PathParams;
    method?: MethodVerbs;
    instance?: boolean;
    [Key: string]: any;
};
export declare type Meta = {
    [key: string]: Meta | MetaRoot;
};
export declare type getSwaggerArgs = {
    swagger: Swagger;
    base?: string;
    resources: Resources;
};
export declare type Swagger = {
    swagger?: string;
    info?: {
        title?: string;
        version?: string;
        termsOfService?: string;
        contact?: {
            name?: string;
            url?: string;
        };
        description?: string;
    };
    basePath?: string;
    schemes?: string[];
    paths?: {
        [key: string]: {
            [key: string]: SwaggerConfig;
        };
    };
};
export declare type SwaggerConfig = {
    consumes?: string[];
    produces?: string[];
    parameters?: {
        name: string;
        in: string;
        required: boolean;
        type: string;
    }[] | undefined;
    responses?: Responses;
    operationId?: string;
    summary?: string;
    description?: string;
};
export declare type Trace = {
    start: (name: string) => Trace;
    end: () => Trace;
};
export declare type SutroArgs = {
    base?: string;
    resources: Resources;
    swagger?: Swagger;
    pre?: (resource: ResourceRoot, req: Request, res: Response) => void;
    post?: (resource: ResourceRoot, req: Request, res: Response, err?: any) => void;
    augmentContext?: AugmentContext;
    trace?: Trace;
};
export declare type AugmentContext = (context: SutroRequest, req: Request) => Promise<SutroRequest> | SutroRequest;
export interface SutroRouter extends IRouter {
    swagger?: Swagger;
    meta?: Meta;
    base?: string;
}
export declare type ResponseStatusKeys = 'default' | '200' | '201' | '204' | '401' | '404' | '500';
export declare type Responses = {
    [key in ResponseStatusKeys]?: {
        description: string;
    };
};
export interface ExpressRequest extends Request {
    timedout: boolean;
    user?: unknown;
    session?: unknown;
}
export interface SutroRequest {
    ip: Request['ip'];
    url: Request['url'];
    protocol: Request['protocol'];
    method: Request['method'];
    subdomains: Request['subdomains'];
    path: Request['path'];
    headers: Request['headers'];
    cookies: Request['cookies'];
    user?: unknown;
    data?: unknown;
    options: Request['query'];
    session?: unknown;
    noResponse?: boolean;
    onFinish?: (fn: (req: Request, res: Response) => void) => void;
    withRaw?: (fn: (req: Request, res: Response) => void) => void;
    _req: ExpressRequest;
    _res: Response;
}
export interface SutroStream extends Readable {
    contentType?: string;
}
export declare type EndpointIsAuthorized = (opt: SutroRequest) => Promise<boolean> | boolean;
export declare type EndpointExecute = <T>(opt: SutroRequest) => Promise<T> | T;
export declare type EndpointFormat = <T>() => Promise<T> | T;
export declare type EndpointCache = {
    header: CacheOptions | (() => CacheOptions);
    key: () => string;
    get: (opt: SutroRequest | string, key: string) => Promise<any> | any;
    set: (opt: SutroRequest | string, data: any, key: string) => Promise<any> | any;
};
export declare type EndpointHTTP = {
    method: MethodVerbs;
    instance: boolean;
};
