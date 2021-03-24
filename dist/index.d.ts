/// <reference types="express" />
import { SutroArgs, SutroRouter } from './types';
export declare const rewriteLargeRequests: (req: import("./types").SutroRequest, res: import("express").Response<any, Record<string, any>>, next: import("express").NextFunction) => void;
export * from './errors';
declare const _default: ({ swagger, base, resources, pre, post, augmentContext, trace }: SutroArgs) => SutroRouter;
export default _default;
