/// <reference types="node" />
import { IRouter, Request, Response } from 'express';
import { Stream } from 'stream';
export declare type Opt = {
    [key: string]: any;
};
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
    path?: PathParams;
    method: string;
    instance?: boolean;
    swagger?: any;
    isAuthorized?: () => Promise<boolean>;
    execute: <T>() => Promise<T>;
    format: <T>() => Promise<T>;
    cache?: {
        header: CacheOptions | (() => CacheOptions);
        key: () => string;
        get: <T>(opt: Opt | string, key: string) => Promise<T>;
        set: <T>(opt: Opt | string, data: any, key: string) => Promise<T>;
    };
    http: {
        method: MethodVerbs;
        instance: boolean;
    };
    endpoint?: ResourceRoot;
    successCode?: number;
    hierarchy?: string;
};
export declare type Resource = {
    [key: string]: ResourceRoot;
};
export declare type Resources = {
    [key: string]: Resource;
};
export declare type Handler = (args: ResourceRoot) => void;
export declare type walkResourceArgs = {
    base?: string;
    name: string;
    resource: Resource;
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
export declare type getMetaArgs = {
    base: string;
    resources: Resources;
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
    swagger: any;
    base: string;
    resources: Resources;
};
export declare type Swagger = {
    swagger: string;
    info: {
        title: string;
        version: string;
    };
    basePath: string;
    schemes: string[];
    paths: Meta;
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
};
export declare type Trace = {
    start: (name: string) => Trace;
    end: () => Trace;
};
export declare type SutroArgs = {
    base: string;
    resources: Resources;
    swagger?: any;
    pre?: <T>(resource: ResourceRoot, req: SutroRequest, res: Response) => Promise<T>;
    post?: <T>() => Promise<T>;
    augmentContext?: (context: Opt, req: SutroRequest) => Opt;
    trace?: Trace;
};
export interface SutroRouter extends IRouter {
    swagger?: any;
    meta?: any;
    base?: any;
}
export declare type ResponseStatusKeys = 'default' | '200' | '201' | '204' | '401' | '404' | '500';
export declare type Responses = {
    [key in ResponseStatusKeys]?: {
        description: string;
    };
};
export interface SutroRequest extends Request {
    originalMethod?: MethodVerbs;
    timedout?: boolean;
    user?: any;
    data?: any;
    options?: any;
    session?: any;
    noResponse?: boolean;
    onFinish?: (fn: (req: SutroRequest, res: Response) => void) => void;
    withRaw?: (fn: (req: SutroRequest, res: Response) => void) => void;
    _req?: SutroRequest;
    _res?: Response;
}
export interface SutroStream extends Stream {
    contentType?: string;
}
export declare type sendResponseArgs = {
    opt: any;
    successCode?: number;
    resultData: any;
    writeCache: any;
};
