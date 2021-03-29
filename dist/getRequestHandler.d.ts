import { NextFunction, Response } from 'express';
import { Trace, ExpressRequest, ResourceRoot, AugmentContext } from './types';
declare const _default: (resource: ResourceRoot, { trace, augmentContext }: {
    trace?: Trace;
    augmentContext?: AugmentContext;
}) => (req: ExpressRequest, res: Response, next: NextFunction) => Promise<void>;
export default _default;
