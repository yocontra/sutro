import { NextFunction, Response } from 'express';
import { Trace, ExpressRequest, ResourceRoot, SutroArgs } from './types';
declare type Args = {
    trace?: Trace;
    serializeResponse: SutroArgs['serializeResponse'];
    augmentContext?: SutroArgs['augmentContext'];
};
declare const _default: (resource: ResourceRoot, { trace, augmentContext, serializeResponse }: Args) => (req: ExpressRequest, res: Response, next: NextFunction) => Promise<void>;
export default _default;
