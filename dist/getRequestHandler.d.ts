import { NextFunction, Response } from 'express';
import { Trace, ExpressRequest, ResourceRoot, SutroArgs } from './types';
declare type Args = {
    trace?: Trace;
    formatResults: SutroArgs['formatResults'];
    augmentContext?: SutroArgs['augmentContext'];
};
declare const _default: (resource: ResourceRoot, { trace, augmentContext, formatResults }: Args) => (req: ExpressRequest, res: Response, next: NextFunction) => Promise<void>;
export default _default;
