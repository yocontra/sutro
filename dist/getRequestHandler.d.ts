import { NextFunction, Response } from 'express';
import { Trace, ExpressRequest, ResourceRoot } from './types';
declare const _default: (resource: ResourceRoot, { trace, augmentContext }: {
    trace?: Trace;
    augmentContext?: any;
}) => (req: ExpressRequest, res: Response, next: NextFunction) => Promise<void>;
export default _default;
