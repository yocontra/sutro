/// <reference types="qs" />
/// <reference types="express" />
import { format, stream } from './formatResults';
import cacheControl from './cacheControl';
import { SutroArgs, SutroRouter, EndpointIsAuthorized, EndpointExecute, EndpointFormat, EndpointCache, EndpointHTTP, SutroRequest, SutroStream } from './types';
export declare const rewriteLargeRequests: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export type { EndpointIsAuthorized, EndpointExecute, EndpointFormat, EndpointCache, EndpointHTTP, SutroRequest, SutroStream };
export * from './errors';
export { format as formatResults, stream as formatResultsStream };
export { cacheControl };
declare const _default: ({ swagger, base, resources, pre, post, augmentContext, formatResults, trace }: SutroArgs) => SutroRouter;
export default _default;
