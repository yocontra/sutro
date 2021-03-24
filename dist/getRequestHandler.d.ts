import { NextFunction, Response } from 'express';
import { Trace, SutroRequest, ResourceRoot } from './types';
declare const _default: (resource: ResourceRoot, { trace, augmentContext }: {
    trace?: Trace | undefined;
    augmentContext?: any;
}) => (req: SutroRequest, res: Response, next: NextFunction) => Promise<void>;
export default _default;
