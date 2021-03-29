/// <reference types="qs" />
/// <reference types="express" />
import { SutroArgs, SutroRouter } from './types';
export declare const rewriteLargeRequests: (req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export * from './errors';
declare const _default: ({ swagger, base, resources, pre, post, augmentContext, trace }: SutroArgs) => SutroRouter;
export default _default;
